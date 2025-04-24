import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { EmailCampaign } from "@shared/schema";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Loader2, ArrowLeft, BarChart3, Play, Pause, Calendar, CheckCircle2, UserRound, UserPlus, PlayCircle, StopCircle, RotateCw } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import CampaignProcessingInfo from "../components/email/campaign-processing-info";
import ContactsCampaignAssign from "../components/email/contacts-campaign-assign";
import CampaignContactsList from "../components/email/campaign-contacts-list";

export default function CampaignDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const campaignId = id ? parseInt(id) : 0; // Use 0 as a fallback, but this should always have an id
  
  // Fetch campaign details
  const { data: campaign, isLoading, error } = useQuery<EmailCampaign>({
    queryKey: ['/api/email-campaigns', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/email-campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      return response.json();
    },
  });
  
  // Check Gmail connection status
  const { data: gmailStatus } = useQuery({
    queryKey: ['/api/gmail/status'],
    queryFn: async () => {
      const response = await fetch('/api/gmail/status');
      if (!response.ok) {
        return { authenticated: false };
      }
      return response.json();
    },
  });
  
  // Campaign stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/email-campaigns', campaignId, 'stats'],
    queryFn: async () => {
      const response = await fetch(`/api/email-campaigns/${campaignId}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign stats');
      }
      return response.json();
    },
    enabled: !!campaign,
  });
  
  // Resume campaign mutation
  const resumeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/email-campaigns/${campaignId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campaign Resumed",
        description: "The campaign is now running"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to resume campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Pause campaign mutation
  const pauseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/email-campaigns/${campaignId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      toast({
        title: "Campaign Paused",
        description: "The campaign has been paused"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to pause campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Process an email (for testing/manual processing)
  const processEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/process-email`, { campaignId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
      
      toast({
        title: data.status === "complete" ? "Processing Complete" : "Email Sent",
        description: data.message,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Start campaign mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/email-campaigns/${campaignId}/start`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
      toast({
        title: "Campaign Started",
        description: "The campaign is now running and will send emails based on configured settings"
      });
    },
    onError: (error: any) => {
      // Check if it's a Gmail authentication error
      if (error.status === 400 && error.data?.needsGmailAuth) {
        toast({
          title: "Gmail Authentication Required",
          description: "Please connect your Gmail account to start this campaign",
          variant: "destructive"
        });
        navigate('/gmail-auth');
      } else {
        toast({
          title: "Error",
          description: `Failed to start campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
      }
    }
  });
  
  // Stop campaign mutation
  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/email-campaigns/${campaignId}/stop`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
      toast({
        title: "Campaign Stopped",
        description: "The campaign has been completely stopped"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to stop campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Replay campaign mutation (for completed or stopped campaigns)
  const replayMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/email-campaigns/${campaignId}/replay`);
      
      // Handle potential empty or non-JSON responses
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          // If not JSON, just return success status
          return { success: true };
        }
      } catch (e) {
        console.log('Response parsing error:', e);
        // Return a default response object if JSON parsing fails
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
      toast({
        title: "Campaign Replayed",
        description: "The campaign has been reset and restarted with the same contacts"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to replay campaign: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });
  
  // Handle campaign actions
  const handleResume = () => resumeMutation.mutate();
  const handlePause = () => pauseMutation.mutate();
  const handleStart = () => startMutation.mutate();
  const handleStop = () => stopMutation.mutate();
  const handleProcessEmail = () => processEmailMutation.mutate();
  const handleReplay = () => replayMutation.mutate();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !campaign) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate('/email-campaigns')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load campaign details</CardDescription>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the campaign. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "running":
        return <Badge variant="default">Running</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      case "stopped":
        return <Badge variant="destructive">Stopped</Badge>;
      case "completed":
        return <Badge>Completed</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };
  
  return (
    <div className="container max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/email-campaigns')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            {getStatusBadge(campaign.status)}
          </div>
          <p className="text-muted-foreground mt-1">
            {campaign.scheduledDate 
              ? `Scheduled for ${new Date(campaign.scheduledDate).toLocaleString()}` 
              : "No schedule set"}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col gap-2 items-end">
          <div className="flex flex-wrap gap-2 justify-end">
            {/* New Start button for draft or stopped campaigns */}
            {(campaign.status === 'draft' || campaign.status === 'stopped') && (
              <Button 
                onClick={handleStart} 
                disabled={startMutation.isPending || !(gmailStatus?.authenticated)}
                className="gap-2"
                title={!gmailStatus?.authenticated ? "Gmail authentication required to start campaigns" : ""}
                variant="default"
              >
                {startMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Start Campaign
              </Button>
            )}
            
            {/* Resume button for paused campaigns */}
            {campaign.status === 'paused' && (
              <Button 
                onClick={handleResume} 
                disabled={resumeMutation.isPending || !(gmailStatus?.authenticated)}
                className="gap-2"
                title={!gmailStatus?.authenticated ? "Gmail authentication required to run campaigns" : ""}
              >
                {resumeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Resume
              </Button>
            )}
            
            {/* Pause button for running campaigns */}
            {campaign.status === 'running' && (
              <Button 
                onClick={handlePause} 
                variant="outline" 
                disabled={pauseMutation.isPending}
                className="gap-2"
              >
                {pauseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
                Pause
              </Button>
            )}
            
            {/* Stop button for paused or running campaigns */}
            {(campaign.status === 'paused' || campaign.status === 'running') && (
              <Button 
                onClick={handleStop} 
                variant="destructive" 
                disabled={stopMutation.isPending}
                className="gap-2"
                title="Completely stop this campaign. This action cannot be undone."
              >
                {stopMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
                Stop
              </Button>
            )}
            
            {/* Process next email for running campaigns */}
            {campaign.status === 'running' && (
              <Button 
                onClick={handleProcessEmail}
                variant="secondary"
                disabled={processEmailMutation.isPending || !(gmailStatus?.authenticated)}
                className="gap-2"
                title={!gmailStatus?.authenticated ? "Gmail authentication required to process emails" : ""}
              >
                {processEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Process Next Email
              </Button>
            )}
            
            {/* Replay button for completed or stopped campaigns */}
            {(campaign.status === 'completed' || campaign.status === 'stopped') && (
              <Button 
                onClick={handleReplay}
                variant="secondary"
                disabled={replayMutation.isPending || !(gmailStatus?.authenticated)}
                className="gap-2"
                title={!gmailStatus?.authenticated ? "Gmail authentication required to replay campaigns" : ""}
              >
                {replayMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
                Replay Campaign
              </Button>
            )}
          </div>
          
          {!gmailStatus?.authenticated && (
            <div className="text-xs text-red-500 flex items-center mt-1">
              <span>Gmail authentication required</span>
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 ml-1" 
                onClick={() => navigate('/gmail-auth')}
              >
                Connect Gmail
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Subject</h3>
                    <p className="font-medium">{campaign.subject}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <div className="flex items-center">
                      {getStatusBadge(campaign.status)}
                      <span className="ml-2">{campaign.status}</span>
                    </div>
                  </div>
                  
                  {campaign.scheduledDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled Date</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{new Date(campaign.scheduledDate).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Daily Limit</h3>
                    <p>{campaign.dailyLimit || 400} emails per day</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Content Preview</h3>
                    <div className="mt-2 bg-muted p-4 rounded-md max-h-[300px] overflow-y-auto">
                      <div dangerouslySetInnerHTML={{ __html: campaign.content.replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Sent</p>
                      <p className="text-2xl font-bold">{campaign.sentCount || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Opened</p>
                      <p className="text-2xl font-bold">{campaign.openCount || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.sentCount ? 
                          `${Math.round((campaign.openCount || 0) / campaign.sentCount * 100)}%` 
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Clicked</p>
                      <p className="text-2xl font-bold">{campaign.clickCount || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.openCount ? 
                          `${Math.round((campaign.clickCount || 0) / campaign.openCount * 100)}%` 
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <CampaignProcessingInfo campaignId={campaignId} />
          </div>
        </TabsContent>
        
        <TabsContent value="contacts">
          <div className="space-y-6">
            <ContactsCampaignAssign 
              campaignId={campaignId} 
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'processing-info'] });
                queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns', campaignId, 'contacts'] });
                toast({
                  title: "Contacts assigned",
                  description: "Contacts have been successfully assigned to this campaign"
                });
              }} 
            />
            
            <CampaignContactsList campaignId={campaignId} />
          </div>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>
                Individual emails sent in this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center p-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Email details will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Performance metrics and analytics for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center p-8">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Campaign analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}