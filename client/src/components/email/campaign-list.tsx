import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { EmailCampaign } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Trash2, PauseCircle, PlayCircle, Calendar, ExternalLink, Eye, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function CampaignList() {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
    retry: false,
    onSuccess: (data) => {
      console.log("Campaigns fetched:", data);
      // Log each campaign status to inspect what might be wrong
      data?.forEach(campaign => {
        console.log(`Campaign ID ${campaign.id}: ${campaign.name} - Status: ${campaign.status}`);
      });
    }
  });
  
  // Define the response type for Gmail status
  type GmailStatusResponse = {
    authenticated: boolean;
    email: string;
  };
  
  // Check Gmail authorization status
  const { data: gmailStatus } = useQuery<GmailStatusResponse>({
    queryKey: ["/api/gmail/status"],
    queryFn: getQueryFn<GmailStatusResponse>({ on401: "returnNull" }),
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/email-campaigns/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Campaign deleted",
        description: "The email campaign has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/email-campaigns/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign updated",
        description: "The email campaign status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Start campaign mutation
  const startCampaignMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/email-campaigns/${id}/start`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign Started",
        description: "The campaign is now running and will send emails based on configured settings"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
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

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setSelectedCampaign(null);
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  const handleStartCampaign = (id: number) => {
    startCampaignMutation.mutate(id);
  };

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

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return <div>No email campaigns found. Create your first campaign.</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Opens</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>{campaign.sentCount || 0}</TableCell>
              <TableCell>{campaign.openCount || 0}</TableCell>
              <TableCell>{campaign.clickCount || 0}</TableCell>
              <TableCell>
                {campaign.scheduledDate
                  ? new Date(campaign.scheduledDate).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/campaign-detail/${campaign.id}`)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {campaign.status === "running" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleStatusChange(campaign.id, "paused")}
                      title="Pause Campaign"
                    >
                      <PauseCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Resume button for paused campaigns */}
                  {campaign.status === "paused" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleStatusChange(campaign.id, "running")}
                      title="Resume Campaign"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Start button for draft campaigns */}
                  {campaign.status === "draft" && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleStartCampaign(campaign.id)}
                      disabled={startCampaignMutation.isPending || !gmailStatus?.authenticated}
                      title={!gmailStatus?.authenticated ? 
                        "Gmail authentication required to start campaigns" : 
                        "Start Campaign"}
                    >
                      {startCampaignMutation.isPending ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <PlayCircle className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  
                  {/* Start button for stopped campaigns - Uses proper start endpoint */}
                  {campaign.status === "stopped" && (
                    <Button
                      variant={startCampaignMutation.isPending ? "secondary" : "outline"}
                      size="icon"
                      onClick={() => handleStartCampaign(campaign.id)}
                      disabled={startCampaignMutation.isPending || !gmailStatus?.authenticated}
                      title={!gmailStatus?.authenticated ? 
                        "Gmail authentication required to start campaigns" : 
                        "Start Campaign"}
                    >
                      {startCampaignMutation.isPending ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <PlayCircle className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  
                  {campaign.status === "draft" && !campaign.scheduledDate && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Navigate to edit page or open modal to set schedule
                      }}
                      title="Schedule Campaign"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}
                  <AlertDialog open={selectedCampaign === campaign.id} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedCampaign(campaign.id)}
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the email campaign "{campaign.name}".
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(campaign.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}