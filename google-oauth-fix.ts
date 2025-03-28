import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import { google } from 'googleapis';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check if required environment variables are present
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Print configuration
console.log('Current Google OAuth2 Configuration:');
console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('- Client Secret length:', process.env.GOOGLE_CLIENT_SECRET?.length);
console.log('- Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

// Generate an auth URL for testing
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'
  ],
  prompt: 'consent'
});

console.log('\nAuthorization URL:');
console.log(authUrl);
console.log('\nInstructions:');
console.log('1. Open the above URL in your browser');
console.log('2. Accept the permissions');
console.log('3. You will be redirected, but likely see an error page');
console.log('4. Copy the full URL from your browser address bar');
console.log('5. Paste it below when prompted\n');

rl.question('Paste the redirect URL: ', async (redirectUrl) => {
  try {
    // Extract the authorization code from the URL
    const url = new URL(redirectUrl);
    const code = url.searchParams.get('code');
    
    if (!code) {
      console.error('❌ No authorization code found in the redirect URL');
      rl.close();
      return;
    }
    
    console.log('\nAttempting to exchange authorization code for tokens...');
    
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Successfully obtained tokens:');
    console.log('- Access Token:', tokens.access_token ? '✓ Present' : '✗ Missing');
    console.log('- Refresh Token:', tokens.refresh_token ? '✓ Present' : '✗ Missing');
    console.log('- Expiry Date:', tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : '✗ Missing');
    
    // Set the credentials and fetch user info
    oauth2Client.setCredentials(tokens);
    
    // Use the People API to get user information
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const response = await people.people.get({
      resourceName: 'people/me',
      personFields: 'names,emailAddresses',
    });
    
    console.log('\n✅ Successfully retrieved user info:');
    
    const name = response.data.names && response.data.names[0] ? 
                response.data.names[0].displayName : undefined;
                
    const email = response.data.emailAddresses && response.data.emailAddresses[0] ? 
                 response.data.emailAddresses[0].value : undefined;
    
    console.log('- Name:', name || 'Not found');
    console.log('- Email:', email || 'Not found');
    
    console.log('\n✅ OAuth authentication is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Ensure your Google Cloud Console OAuth client matches these credentials');
    console.log('2. Make sure the Gmail API is enabled in your project');
    console.log('3. Restart your application');
    
  } catch (error) {
    console.error('❌ Error during OAuth token exchange:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    console.log('\nCommon issues:');
    console.log('1. Mismatch between credentials in your app and Google Cloud Console');
    console.log('2. Required APIs not enabled (Gmail API, People API)');
    console.log('3. Redirect URI not authorized in Google Cloud Console');
    console.log('4. OAuth consent screen not properly configured');
  } finally {
    rl.close();
  }
});