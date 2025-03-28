import { google } from 'googleapis';
import { User } from '@shared/schema';
import { storage } from './storage';

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/oauth/callback"
);

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to get tokens from authorization code');
  }
}

// Get user info from Google
export async function getUserInfo(accessToken: string) {
  try {
    // Set credentials for this request
    oauth2Client.setCredentials({ access_token: accessToken });
    
    // Use Google People API to get user information
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const response = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    });
    
    if (!response.data) {
      throw new Error('No user data returned from Google');
    }
    
    // Extract relevant information
    const name = response.data.names && response.data.names[0] ? 
                 response.data.names[0].displayName : undefined;
                 
    const email = response.data.emailAddresses && response.data.emailAddresses[0] ? 
                  response.data.emailAddresses[0].value : undefined;
                  
    if (!email) {
      throw new Error('Email not found in Google user data');
    }
    
    return { 
      name, 
      email 
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    throw new Error('Failed to get user information from Google');
  }
}

// Set up Gmail API with refresh token flow
export async function getGmailService(user: User) {
  if (!user.googleRefreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Set credentials with the refresh token
    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken
    });
    
    // Check if access token is expired and needs refresh
    if (!user.googleAccessToken || !user.googleTokenExpiry || new Date(user.googleTokenExpiry) <= new Date()) {
      // Force refresh access token
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update user tokens in database
      await storage.updateUserGoogleTokens(user.id, {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || undefined, // Only included if changed
        expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
      });
    } else {
      // Use existing access token
      oauth2Client.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
        expiry_date: user.googleTokenExpiry?.getTime()
      });
    }
    
    // Create and return the Gmail service
    return google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.error('Error getting Gmail service:', error);
    throw new Error('Failed to authenticate with Gmail');
  }
}

// Helper to create a Gmail message
export function createMessage(options: {
  to: string, 
  subject: string, 
  body: string,
  from?: string,
  cc?: string,
  bcc?: string
}) {
  const { to, subject, body, from, cc, bcc } = options;
  
  // Headers
  let emailLines = [];
  emailLines.push(from ? `From: ${from}` : '');
  emailLines.push(`To: ${to}`);
  if (cc) emailLines.push(`Cc: ${cc}`);
  if (bcc) emailLines.push(`Bcc: ${bcc}`);
  emailLines.push(`Subject: ${subject}`);
  emailLines.push('Content-Type: text/html; charset=utf-8');
  emailLines.push('MIME-Version: 1.0');
  emailLines.push('');
  
  // Body
  emailLines.push(body);
  
  // Encode as base64
  const email = emailLines.join('\r\n').trim();
  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Send an email using Gmail API
export async function sendEmail(user: User, emailOptions: {
  to: string, 
  subject: string, 
  body: string,
  cc?: string,
  bcc?: string
}) {
  try {
    // Get Gmail service
    const gmail = await getGmailService(user);
    
    // Create the message
    const message = createMessage({
      ...emailOptions,
      from: user.googleEmail || user.email || undefined
    });
    
    // Send the message
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email via Gmail');
  }
}

// Check Gmail quota
export async function checkGmailQuota(user: User) {
  try {
    // Get Gmail service
    const gmail = await getGmailService(user);
    
    // Get current quota
    const response = await gmail.users.getProfile({
      userId: 'me'
    });
    
    return {
      emailAddress: response.data.emailAddress,
      messagesTotal: response.data.messagesTotal,
      threadsTotal: response.data.threadsTotal,
      historyId: response.data.historyId
    };
  } catch (error) {
    console.error('Error checking Gmail quota:', error);
    throw new Error('Failed to check Gmail quota');
  }
}