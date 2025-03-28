import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { EmailCampaign } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, PauseCircle, PlayCircle, Calendar } from "lucide-react";
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

  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
    retry: false,
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

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
    setSelectedCampaign(null);
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
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
                  {(campaign.status === "paused" || campaign.status === "draft") && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleStatusChange(campaign.id, "running")}
                      title="Start Campaign"
                    >
                      <PlayCircle className="h-4 w-4" />
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