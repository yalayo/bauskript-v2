import { useState } from "react";
import { EmailCampaign } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CampaignForm from "./campaign-form";

interface CampaignListProps {
  campaigns: EmailCampaign[];
}

export default function CampaignList({ campaigns }: CampaignListProps) {
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/email-campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      toast({
        title: "Success",
        description: "Campaign status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleEdit = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setIsEditorOpen(true);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch(status) {
      case "active": return "default";
      case "completed": return "success";
      default: return "outline";
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.subject}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(campaign.status)}>
                  {campaign.status || "draft"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(campaign.createdAt)}</TableCell>
              <TableCell>{campaign.sentCount || 0}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <span className="sr-only">Open menu</span>
                      <i className="fas fa-ellipsis-h"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                      <i className="fas fa-edit mr-2"></i> Edit
                    </DropdownMenuItem>
                    {campaign.status === "draft" && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(campaign.id, "active")}
                      >
                        <i className="fas fa-play mr-2"></i> Activate
                      </DropdownMenuItem>
                    )}
                    {campaign.status === "active" && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(campaign.id, "completed")}
                      >
                        <i className="fas fa-check-circle mr-2"></i> Mark as Complete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Campaign</DialogTitle>
          </DialogHeader>
          {editingCampaign && (
            <CampaignForm 
              campaign={editingCampaign} 
              onSuccess={() => setIsEditorOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}