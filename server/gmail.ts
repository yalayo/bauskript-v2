import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { storage } from './storage';
import { User } from '@shared/schema';

// These values should be obtained from the Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/oauth/callback';

// Scopes required for Gmail access
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Creates a new OAuth2 client
 */
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
}

/**
 * Generates the authorization URL for Google OAuth
 */
export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Always prompt for consent to ensure we get a refresh token
  });
}

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export async function getTokensFromCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('Failed to get access token');
  }

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || '',
    expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
  };
}

/**
 * Gets user info from Google
 */
export async function getUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
}> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });

  const { data } = await oauth2.userinfo.get();

  if (!data.id || !data.email) {
    throw new Error('Failed to get user info');
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name || '',
  };
}

/**
 * Creates an authenticated Gmail API client for a user
 */
export async function createGmailClient(userId: number): Promise<any> {
  const user = await storage.getUser(userId);
  
  if (!user || !user.googleAccessToken) {
    throw new Error('User not authenticated with Google');
  }
  
  const oauth2Client = createOAuth2Client();
  
  // Set credentials
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime() || undefined
  });
  
  // Set up token refresh callback
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await storage.updateUserGoogleTokens(userId, {
        accessToken: tokens.access_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
      });
    }
  });
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Sends an email via Gmail API
 */
export async function sendEmail(
  userId: number, 
  to: string, 
  subject: string, 
  body: string, 
  isHtml: boolean = false
): Promise<string> {
  const gmail = await createGmailClient(userId);
  const user = await storage.getUser(userId);
  
  if (!user || !user.googleEmail) {
    throw new Error('User email not found');
  }
  
  // Create the email content
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const contentType = isHtml ? 'text/html' : 'text/plain';
  
  const messageParts = [
    `From: ${user.fullName || 'Me'} <${user.googleEmail}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${contentType}; charset=utf-8`,
    '',
    body,
  ];
  
  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  
  return result.data.id;
}

/**
 * Check if a user has valid Google OAuth credentials
 */
export async function hasValidGoogleCredentials(userId: number): Promise<boolean> {
  const user = await storage.getUser(userId);
  
  if (!user || !user.googleAccessToken || !user.googleRefreshToken) {
    return false;
  }
  
  // Check if token is expired and if we can refresh it
  if (user.googleTokenExpiry && user.googleTokenExpiry < new Date()) {
    // Token is expired, but we have a refresh token
    return !!user.googleRefreshToken;
  }
  
  return true;
}