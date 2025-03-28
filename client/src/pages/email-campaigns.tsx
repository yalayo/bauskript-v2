import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, PlusCircle, Mail, Send, BarChart3, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CampaignForm from "@/components/email/campaign-form";
import CampaignList from "@/components/email/campaign-list";
import ContactForm from "@/components/email/contact-form";
import ContactsList from "@/components/email/contacts-list";
import { useQuery } from "@tanstack/react-query";
import { EmailCampaign } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function EmailCampaigns() {
  const { user, isLoading: authLoading } = useAuth();
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [, navigate] = useLocation();
  
  // Define the response type for Gmail status
  type GmailStatusResponse = {
    authenticated: boolean;
    email: string;
  };
  
  // Check Gmail authorization status
  const { data: gmailStatus, isLoading: gmailStatusLoading } = useQuery<GmailStatusResponse>({
    queryKey: ["/api/gmail/status"],
    queryFn: getQueryFn<GmailStatusResponse>({ on401: "returnNull" }),
    enabled: !!user
  });
  
  // Fetch email campaigns data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
  });

  const isLoading = authLoading || campaignsLoading || gmailStatusLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get campaign stats
  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0);
  const activeCampaigns = campaigns.filter(campaign => campaign.status === "running").length;

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Email Campaigns</h1>
      <p className="text-muted-foreground mb-6">Create and manage your email marketing campaigns</p>
      
      {/* Gmail Connection Banner */}
      {!gmailStatus?.authenticated && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gmail Connection Required</AlertTitle>
          <AlertDescription>
            Connect your Gmail account to send emails from our application.
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => navigate("/gmail-auth")}
            >
              Connect Gmail
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  Create and manage your email marketing campaigns
                </CardDescription>
              </div>
              <Dialog open={openCampaignDialog} onOpenChange={setOpenCampaignDialog}>
                <DialogTrigger asChild>
                  <Button className="ml-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Fill out the details below to create a new email campaign.
                    </DialogDescription>
                  </DialogHeader>
                  <CampaignForm onSuccess={() => setOpenCampaignDialog(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <CampaignList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Contact List</CardTitle>
                <CardDescription>
                  Manage your contacts for email campaigns
                </CardDescription>
              </div>
              <Dialog open={openContactDialog} onOpenChange={setOpenContactDialog}>
                <DialogTrigger asChild>
                  <Button className="ml-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>
                      Fill out the contact information below.
                    </DialogDescription>
                  </DialogHeader>
                  <ContactForm onSuccess={() => setOpenContactDialog(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <ContactsList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                View performance metrics for your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Total Sent</h3>
                  <p className="text-3xl font-bold">{totalSent}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Open Rate</h3>
                  <p className="text-3xl font-bold">
                    {totalSent > 0 
                      ? Math.round((campaigns.reduce((total, campaign) => total + (campaign.openCount || 0), 0) / totalSent) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-medium">Click Rate</h3>
                  <p className="text-3xl font-bold">
                    {totalSent > 0 
                      ? Math.round((campaigns.reduce((total, campaign) => total + (campaign.clickCount || 0), 0) / totalSent) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
              <div className="h-[300px] mt-8 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">Campaign analytics will be shown here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
