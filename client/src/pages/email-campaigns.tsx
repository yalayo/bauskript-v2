import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmailCampaign } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignForm from "@/components/email/campaign-form";
import CampaignList from "@/components/email/campaign-list";

export default function EmailCampaignsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  // Fetch email campaigns data
  const { data: campaigns = [], isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/email-campaigns"],
  });

  // Filter campaigns based on active tab
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === "all") return true;
    return campaign.status.toLowerCase() === activeTab.toLowerCase();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Email Campaigns</h1>
          <p className="text-gray-500">
            Create and manage email marketing campaigns
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Dialog
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Email Campaign</DialogTitle>
              </DialogHeader>
              <CampaignForm 
                onSuccess={() => setIsFormDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Campaigns</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary bg-opacity-10 text-primary">
              <i className="fas fa-envelope"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">{campaigns.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Emails Sent</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary bg-opacity-10 text-secondary">
              <i className="fas fa-paper-plane"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">
            {campaigns.reduce((total, campaign) => total + (campaign.sentCount || 0), 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Active Campaigns</h3>
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success bg-opacity-10 text-success">
              <i className="fas fa-chart-line"></i>
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-dark">
            {campaigns.filter(campaign => campaign.status === "active").length}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Campaigns</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredCampaigns.length > 0 ? (
                <CampaignList campaigns={filteredCampaigns} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <i className="fas fa-envelope text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === "all"
                      ? "You haven't created any email campaigns yet."
                      : `No ${activeTab} campaigns found.`}
                  </p>
                  <Button
                    onClick={() => setIsFormDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>Create New Campaign
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
