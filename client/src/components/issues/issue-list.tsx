import { useMutation } from "@tanstack/react-query";
import { Issue, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface IssueListProps {
  issues: Issue[];
  projects: Project[];
}

export default function IssueList({ issues, projects }: IssueListProps) {
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Function to get priority badge class
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get severity icon
  const getSeverityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-error bg-opacity-10 text-error";
      case "medium":
        return "bg-warning bg-opacity-10 text-warning-dark";
      case "low":
        return "bg-secondary bg-opacity-10 text-secondary";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Update issue status mutation
  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/issues/${id}`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: "Success",
        description: "Issue status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update issue: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateIssueMutation.mutate({ id, status });
  };

  const viewIssueDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div key={issue.id} className="border rounded-md p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`mt-1 flex items-center justify-center w-8 h-8 rounded-full ${getSeverityIcon(
                  issue.priority
                )}`}
              >
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div>
                <h3 className="font-medium text-slate-dark text-base mb-1">
                  {issue.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {getProjectName(issue.projectId)} • {new Date(issue.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs font-medium ${getPriorityBadge(
                issue.priority
              )} rounded-full`}
            >
              {issue.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
            {issue.description}
          </p>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <i className="fas fa-user text-xs"></i>
              </div>
              <select
                className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                value={issue.status}
                onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                disabled={updateIssueMutation.isPending}
              >
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary font-medium"
              onClick={() => viewIssueDetails(issue)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}

      {/* Issue Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedIssue.title}</h2>
                <span
                  className={`px-2 py-1 text-xs font-medium ${getPriorityBadge(
                    selectedIssue.priority
                  )} rounded-full`}
                >
                  {selectedIssue.priority}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Project</p>
                  <p className="font-medium">{getProjectName(selectedIssue.projectId)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium capitalize">{selectedIssue.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created By</p>
                  <p className="font-medium">User #{selectedIssue.createdBy}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-2">Description</p>
                <div className="bg-gray-50 p-4 rounded-md text-sm">
                  {selectedIssue.description}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  value={selectedIssue.status}
                  onChange={(e) => handleStatusChange(selectedIssue.id, e.target.value)}
                  disabled={updateIssueMutation.isPending}
                >
                  <option value="open">Open</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
