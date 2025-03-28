import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { getTokensFromCode, getUserInfo } from "./gmail";

// Extend the session interface to include our custom fields
declare module 'express-session' {
  interface SessionData {
    oauth2ReturnTo?: string;
  }
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "construction-site-management-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );
  
  // Google OAuth strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI) {
    console.log('Setting up Google OAuth strategy with:');
    console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('- Client Secret length:', process.env.GOOGLE_CLIENT_SECRET.length);
    console.log('- Using configured callback URL:', process.env.GOOGLE_REDIRECT_URI);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI,
          scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (user) {
              // Update tokens
              user = await storage.updateUserGoogleTokens(user.id, {
                accessToken,
                refreshToken,
                expiryDate: new Date(Date.now() + 3600 * 1000) // 1 hour from now
              });
              return done(null, user);
            }
            
            // Create a new user
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
            const fullName = profile.displayName || '';
            
            // Generate unique username from email or Google ID
            const baseUsername = email.split('@')[0] || `google_${profile.id}`;
            let username = baseUsername;
            let counter = 1;
            
            // Ensure unique username
            while (await storage.getUserByUsername(username)) {
              username = `${baseUsername}_${counter++}`;
            }
            
            // Create the user with Google information
            const newUser = await storage.saveGoogleUser({
              googleId: profile.id,
              googleEmail: email,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken || '',
              googleTokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 hour from now
              username,
              email,
              fullName
            });
            
            return done(null, newUser);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to the client
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send password back to the client
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  
  // Google OAuth routes
  app.get("/api/auth/google", (req, res, next) => {
    // Store the redirect URL in the session for after successful authentication
    if (req.query.redirect) {
      req.session.oauth2ReturnTo = req.query.redirect as string;
    }
    
    console.log('Starting Google OAuth flow at:', new Date().toISOString());
    console.log('User will be redirected back to:', req.session.oauth2ReturnTo || '/');
    
    passport.authenticate("google", { 
      scope: [
        "profile", 
        "email",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.readonly"
      ],
      accessType: "offline",
      prompt: "consent" // Force approval prompt to get refresh token
    })(req, res, next);
  });
  
  app.get("/api/oauth/callback", (req, res, next) => {
    console.log('Received callback from Google OAuth at:', new Date().toISOString());
    console.log('Query parameters:', req.query);
    
    passport.authenticate("google", { failureRedirect: "/auth" }, (err, user, info) => {
      if (err) {
        console.error('Error during Google authentication:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Authentication failed, no user returned');
        return res.redirect('/auth');
      }
      
      console.log('Google authentication successful for user:', user.username);
      
      req.login(user, (err) => {
        if (err) {
          console.error('Error during login after OAuth:', err);
          return next(err);
        }
        
        // Redirect to the stored URL or default to homepage
        const redirectUrl = req.session.oauth2ReturnTo || "/";
        console.log('Redirecting to:', redirectUrl);
        delete req.session.oauth2ReturnTo;
        res.redirect(redirectUrl);
      });
    })(req, res, next);
  });
  
  // Gmail API authorization status
  app.get("/api/gmail/status", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user as SelectUser;
    const hasGmailAuth = !!(user.googleAccessToken && user.googleRefreshToken);
    
    res.json({
      authenticated: hasGmailAuth,
      email: user.googleEmail || user.email
    });
  });
  
  // Gmail revoke access
  app.post("/api/gmail/revoke", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const user = req.user as SelectUser;
      
      // Clear Google OAuth information
      await storage.updateUserGoogleTokens(user.id, {
        accessToken: "",
        refreshToken: "",
        expiryDate: undefined
      });
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });
}
