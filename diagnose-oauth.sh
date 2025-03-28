#!/bin/bash

echo "🔍 Google OAuth Diagnostic Tool"
echo "==============================="
echo "This script will help diagnose issues with Google OAuth authentication."
echo ""

# Check if required environment variables are set
echo "Checking environment variables..."
missing_vars=()
[ -z "$GOOGLE_CLIENT_ID" ] && missing_vars+=("GOOGLE_CLIENT_ID")
[ -z "$GOOGLE_CLIENT_SECRET" ] && missing_vars+=("GOOGLE_CLIENT_SECRET")
[ -z "$GOOGLE_REDIRECT_URI" ] && missing_vars+=("GOOGLE_REDIRECT_URI")

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "Please set these variables and try again."
    exit 1
fi

echo "✅ All required environment variables are set."
echo ""

# Print current configuration
echo "Current OAuth Configuration:"
echo "- Client ID: ${GOOGLE_CLIENT_ID}"
echo "- Client Secret length: ${#GOOGLE_CLIENT_SECRET}"
echo "- Redirect URI: ${GOOGLE_REDIRECT_URI}"
echo ""

echo "Running OAuth verification..."
echo ""

# Run the verification script
npx tsx google-oauth-fix.ts

echo ""
echo "If you continue to have issues, please check the following:"
echo "1. Ensure your Google Cloud Console project has the Gmail API enabled"
echo "2. Verify the redirect URI in Google Cloud Console exactly matches ${GOOGLE_REDIRECT_URI}"
echo "3. Make sure your OAuth consent screen is properly configured with the required scopes"
echo "4. If your app is in testing mode, ensure your email is added as a test user"