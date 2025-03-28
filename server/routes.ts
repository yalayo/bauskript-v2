import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProjectSchema, 
  insertDailyReportSchema, 
  insertAttendanceSchema, 
  insertIssueSchema,
  insertPhotoSchema,
  insertBlogPostSchema,
  insertQuestionnaireSchema,
  insertEmailCampaignSchema
} from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Configure Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
let stripe: Stripe | undefined;

if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16" as any,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Projects routes
  app.get("/api/projects", async (req, res, next) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/projects/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ message: "Project not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/projects", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/projects/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Daily Reports routes
  // Routes with "/api/reports" prefix (original)
  app.get("/api/reports", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let reports;
      
      if (projectId) {
        reports = await storage.getDailyReportsByProject(projectId);
      } else {
        reports = await storage.getDailyReports();
      }
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getDailyReport(id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/reports", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertDailyReportSchema.parse(req.body);
      const report = await storage.createDailyReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/reports/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDailyReportSchema.partial().parse(req.body);
      const report = await storage.updateDailyReport(id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });
  
  // Routes with "/api/daily-reports" prefix (for consistent naming)
  app.get("/api/daily-reports", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let reports;
      
      if (projectId) {
        reports = await storage.getDailyReportsByProject(projectId);
      } else {
        reports = await storage.getDailyReports();
      }
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/daily-reports/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getDailyReport(id);
      if (report) {
        res.json(report);
      } else {
        res.status(404).json({ message: "Report not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/daily-reports", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertDailyReportSchema.parse(req.body);
      const report = await storage.createDailyReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/daily-reports/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDailyReportSchema.partial().parse(req.body);
      const report = await storage.updateDailyReport(id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let records;
      
      if (projectId) {
        records = await storage.getAttendanceByProject(projectId);
      } else {
        records = await storage.getAttendanceRecords();
      }
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/attendance/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getAttendanceRecord(id);
      if (record) {
        res.json(record);
      } else {
        res.status(404).json({ message: "Attendance record not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/attendance", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Issues routes
  app.get("/api/issues", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let issues;
      
      if (projectId) {
        issues = await storage.getIssuesByProject(projectId);
      } else {
        issues = await storage.getIssues();
      }
      
      res.json(issues);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/issues/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      if (issue) {
        res.json(issue);
      } else {
        res.status(404).json({ message: "Issue not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/issues", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertIssueSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/issues/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertIssueSchema.partial().parse(req.body);
      const issue = await storage.updateIssue(id, validatedData);
      res.json(issue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Photos routes
  app.get("/api/photos", async (req, res, next) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      let photos;
      
      if (projectId) {
        photos = await storage.getPhotosByProject(projectId);
      } else {
        photos = await storage.getPhotos();
      }
      
      res.json(photos);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/photos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      if (photo) {
        res.json(photo);
      } else {
        res.status(404).json({ message: "Photo not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/photos", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertPhotoSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Blog posts routes
  app.get("/api/blog", async (req, res, next) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/blog/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ message: "Blog post not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/blog", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertBlogPostSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/blog/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, validatedData);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.delete("/api/blog/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res, next) => {
    try {
      const validatedData = insertQuestionnaireSchema.parse(req.body);
      const questionnaire = await storage.createQuestionnaire(validatedData);
      res.status(201).json(questionnaire);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.get("/api/questionnaires", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user?.role !== "admin") return res.sendStatus(403);

    try {
      const questionnaires = await storage.getQuestionnaires();
      res.json(questionnaires);
    } catch (error) {
      next(error);
    }
  });

  // Email campaigns routes
  app.get("/api/email-campaigns", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const campaigns = await storage.getEmailCampaigns();
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/email-campaigns/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getEmailCampaign(id);
      if (campaign) {
        res.json(campaign);
      } else {
        res.status(404).json({ message: "Email campaign not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/email-campaigns", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const validatedData = insertEmailCampaignSchema.parse({
        ...req.body,
        createdBy: req.user?.id,
      });
      const campaign = await storage.createEmailCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  app.patch("/api/email-campaigns/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEmailCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateEmailCampaign(id, validatedData);
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        next(error);
      }
    }
  });

  // Stripe payment routes
  if (stripe) {
    // One-time payment endpoint
    app.post("/api/create-payment-intent", async (req, res, next) => {
      try {
        const { amount, currency = "eur" } = req.body;
        
        // Convert to cents if not already
        const amountInCents = typeof amount === 'number' ? Math.round(amount) : parseInt(amount);
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });

    // Subscription endpoint
    app.post('/api/get-or-create-subscription', async (req, res) => {
      if (!req.isAuthenticated()) {
        return res.sendStatus(401);
      }

      const user = req.user;

      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          // Return existing subscription data
          // Type assertion to properly handle expanded objects
          const latestInvoice = subscription.latest_invoice as any;
          const paymentIntent = latestInvoice?.payment_intent;
          
          res.send({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent?.client_secret,
          });
          return;
        } catch (error: any) {
          console.error("Error retrieving subscription:", error.message);
          // If subscription not found, proceed to create a new one
        }
      }
      
      if (!user.email) {
        return res.status(400).json({ message: "No user email on file" });
      }

      try {
        // Create or retrieve customer
        let customerId = user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.fullName || user.username,
          });
          customerId = customer.id;
          
          // Update user with customer ID
          await storage.updateStripeCustomerId(user.id, customerId);
        }

        // Get the price ID based on the plan
        const { priceId } = req.body;
        if (!priceId) {
          return res.status(400).json({ message: "No price ID provided" });
        }

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price: priceId,
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        // Update user with subscription ID
        await storage.updateUserStripeInfo(user.id, {
          customerId,
          subscriptionId: subscription.id
        });
    
        // Type assertion to properly handle expanded objects
        const latestInvoice = subscription.latest_invoice as any;
        const paymentIntent = latestInvoice?.payment_intent;
        
        res.send({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        });
      } catch (error: any) {
        console.error("Subscription error:", error.message);
        return res.status(400).send({ error: { message: error.message } });
      }
    });
  } else {
    // Fallback if Stripe is not configured
    app.post("/api/create-payment-intent", (req, res) => {
      res.status(500).json({ message: "Stripe is not configured" });
    });
    
    app.post("/api/get-or-create-subscription", (req, res) => {
      res.status(500).json({ message: "Stripe is not configured" });
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
