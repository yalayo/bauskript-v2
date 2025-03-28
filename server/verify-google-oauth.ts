import { google } from 'googleapis';

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
console.log('Google OAuth2 Configuration:');
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
console.log('\nTo test authentication:');
console.log('1. Open the above URL in your browser');
console.log('2. Accept the permissions');
console.log('3. You should be redirected back to your application');
console.log('4. If you see an error, check the console log for details');