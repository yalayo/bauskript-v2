import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Mail, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";

export default function GmailAuthPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<string | null>(null);
  const [, navigate] = useLocation();

  // Define the response type for Gmail status
  type GmailStatusResponse = {
    authenticated: boolean;
    email: string;
  };

  // Get Gmail authorization status
  const {
    data: gmailStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch
  } = useQuery<GmailStatusResponse>({
    queryKey: ["/api/gmail/status"],
    queryFn: getQueryFn<GmailStatusResponse>({ on401: "returnNull" }),
    enabled: !!user
  });

  // Mutation for revoking Gmail access
  const revokeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/gmail/revoke");
    },
    onSuccess: () => {
      toast({
        title: "Gmail access revoked",
        description: "Your Gmail access has been successfully revoked",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gmail/status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke Gmail access",
        variant: "destructive"
      });
    },
  });

  useEffect(() => {
    // Get the current URL for redirect after authentication
    setLocation(window.location.pathname);
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const handleConnect = () => {
    console.log('Connecting to Gmail with redirect path:', location);
    // Redirect to Google auth endpoint with current location for redirect back
    window.location.href = `/api/auth/google?redirect=${encodeURIComponent(location || "/gmail-auth")}`;
  };

  const handleDisconnect = () => {
    revokeMutation.mutate();
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Gmail Authorization</h1>
        <p className="text-muted-foreground">
          Connect your Gmail account to send emails directly from the application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Gmail Connection Status
          </CardTitle>
          <CardDescription>
            Connect your Gmail account to enable email features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : statusError ? (
            <div className="bg-red-100 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error checking Gmail status</p>
                <p className="text-red-700 text-sm">{(statusError as Error).message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {gmailStatus?.authenticated ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Connected to Gmail</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="font-medium">Not connected</span>
                      </>
                    )}
                  </div>
                  {gmailStatus?.authenticated && (
                    <div className="text-sm text-muted-foreground">
                      {gmailStatus.email}
                    </div>
                  )}
                </div>
              </div>

              {gmailStatus?.authenticated ? (
                <Button 
                  variant="destructive" 
                  onClick={handleDisconnect} 
                  disabled={revokeMutation.isPending}
                  className="w-full"
                >
                  {revokeMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect Gmail Account'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  className="w-full"
                >
                  Connect Gmail Account
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {gmailStatus?.authenticated && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Send Emails with Gmail</CardTitle>
              <CardDescription>
                Now that your account is connected, you can use Gmail to send emails from the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                onClick={() => navigate("/email-campaigns")}
                className="w-full"
              >
                Go to Email Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}