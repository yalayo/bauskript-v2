# Fix Google OAuth Configuration

The `invalid_client` error you're seeing indicates that there's a mismatch between the OAuth client credentials being used by the application and what's registered in the Google Cloud Console.

## Steps to fix Google OAuth

1. **Visit the Google Cloud Console**
   - Go to https://console.cloud.google.com/
   - Make sure you're in the correct project, or create a new one

2. **Set up OAuth consent screen**
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required app information
   - Add the following scopes:
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
   - Add any test users (your email)
   - Complete the setup

3. **Create new OAuth client ID**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" and select "OAuth client ID"
   - Select "Web application" for the Application type
   - Set a name like "Construction Site Email Manager"
   - Under "Authorized redirect URIs" add:
     ```
     https://9403cc73-a068-4259-ba6c-4048539f1e2a-00-1sgg2zcnl20gr.kirk.replit.dev/api/oauth/callback
     ```
     (confirm this matches your current Replit domain)
   - Click "CREATE"
   - Copy the **Client ID** and **Client Secret**

4. **Update environment variables**
   - Set the following environment variables in Replit:
     - `GOOGLE_CLIENT_ID`: The client ID from step 3
     - `GOOGLE_CLIENT_SECRET`: The client secret from step 3
     - `GOOGLE_REDIRECT_URI`: The exact redirect URI you entered in step 3

5. **Enable required APIs**
   - Navigate to "APIs & Services" > "Library" 
   - Search for and enable:
     - "Gmail API"
     - "People API"

6. **Restart the application**
   - Restart the server and try the authentication again

## Common issues to check

- Ensure the redirect URI in Google Cloud Console exactly matches what's in your `GOOGLE_REDIRECT_URI` environment variable (including http/https protocol and trailing slashes)
- Check that you haven't hit API quota limits
- Verify that your OAuth consent screen is properly configured with all necessary scopes
- If your app is in "testing" mode, make sure your test user is added to the allowed users
- If you've made recent changes to your OAuth configuration, be aware there can be propagation delays (up to ~5 minutes) before changes take effect

## Testing with the debug endpoint

Visit: `/api/debug/oauth-config` in your application to verify the configuration being used by the application matches what you've set up in Google Cloud Console.