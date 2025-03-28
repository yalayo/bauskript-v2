import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Issue, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IssueForm from "@/components/issues/issue-form";
import IssueList from "@/components/issues/issue-list";

export default function IssuesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  // Fetch projects data
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch issues data
  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  const isLoading = projectsLoading || issuesLoading;

  // Filter issues based on selected project
  const filteredIssues = issues.filter((issue) => {
    if (selectedProject === "all") return true;
    return issue.projectId.toString() === selectedProject;
  });

  // Further filter issues based on active tab
  const tabFilteredIssues = filteredIssues.filter((issue) => {
    if (activeTab === "all") return true;
    return issue.priority.toLowerCase() === activeTab.toLowerCase();
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
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Issue Tracking</h1>
          <p className="text-gray-500">
            Manage and track issues and risks on your construction sites
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Dialog
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>New Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Issue</DialogTitle>
              </DialogHeader>
              <IssueForm 
                projects={projects}
                onSuccess={() => setIsFormDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Issues</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="high">High Priority</TabsTrigger>
              <TabsTrigger value="medium">Medium Priority</TabsTrigger>
              <TabsTrigger value="low">Low Priority</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {tabFilteredIssues.length > 0 ? (
                <IssueList issues={tabFilteredIssues} projects={projects} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <i className="fas fa-exclamation-triangle text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No issues found</h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === "all"
                      ? "You haven't created any issues yet."
                      : `No ${activeTab} priority issues found.`}
                  </p>
                  <Button
                    onClick={() => setIsFormDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <i className="fas fa-plus mr-2"></i>Create New Issue
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
