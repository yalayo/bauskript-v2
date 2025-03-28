# Google OAuth Debug Instructions

I've added several tools to help diagnose and fix the Google OAuth issues:

## 1. Check your current OAuth configuration

The debug endpoint is available at:
```
/api/debug/oauth-config
```

This shows:
- Your current client ID (first few characters)
- Length of client ID and client secret
- The redirect URI being used
- Server information

## 2. Run the diagnostic script

I've created a diagnostic script to help test your OAuth flow. Run it with:

```bash
chmod +x diagnose-oauth.sh
./diagnose-oauth.sh
```

This script will:
1. Check your environment variables
2. Show your current OAuth configuration
3. Generate an authorization URL
4. Help you test the token exchange

## 3. Update Google Cloud Console

Based on our logs, the error `invalid_client` with status code 500 indicates:

- Your Google Cloud OAuth client credentials don't match what's configured in Google Cloud Console
- The redirect URI doesn't exactly match what's registered in Google Cloud Console
- The OAuth client may be disabled or deleted in Google Cloud Console

Follow the steps in `fix-google-oauth.md` to reconfigure your OAuth client in Google Cloud Console. Make sure to:

1. Create a new OAuth client ID if you're having persistent issues
2. Ensure the redirect URI exactly matches: 
   ```
   https://9403cc73-a068-4259-ba6c-4048539f1e2a-00-1sgg2zcnl20gr.kirk.replit.dev/api/oauth/callback
   ```
3. Enable the required APIs (Gmail API, People API)
4. Set up the OAuth consent screen with all required scopes

## 4. Update environment variables

After creating a new OAuth client, update your environment variables in Replit:

- `GOOGLE_CLIENT_ID`: Your client ID from Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: Your client secret from Google Cloud Console
- `GOOGLE_REDIRECT_URI`: The exact redirect URI you registered

## 5. Restart the application

After updating your Google Cloud Console settings and environment variables, restart the application with:

```bash
npm run dev
```

or by using the Replit workflow restart button.

## Still having issues?

If you continue to have problems, try creating a completely new project in Google Cloud Console and starting from scratch. Sometimes OAuth clients can get into a bad state that's difficult to recover from.