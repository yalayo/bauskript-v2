import { Issue } from "@shared/schema";

interface RecentIssuesProps {
  issues: Array<Issue & { 
    projectName: string;
    author: { name: string; avatar: string };
  }>;
}

export const RecentIssues = ({ issues }: RecentIssuesProps) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-dark">Recent Issues</h2>
        <a href="/issues" className="text-primary font-medium text-sm hover:underline">
          View All
        </a>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="border rounded-md p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-1 flex items-center justify-center w-6 h-6 rounded-full ${getSeverityIcon(
                    issue.priority
                  )}`}
                >
                  <i className="fas fa-exclamation-circle text-xs"></i>
                </div>
                <div>
                  <h3 className="font-medium text-slate-dark text-sm">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {issue.projectName} • {new Date(issue.createdAt).toLocaleDateString()}
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
            <p className="text-sm text-gray-600 mt-2">{issue.description}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <i className="fas fa-user text-xs"></i>
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  {issue.author.name}
                </span>
              </div>
              <a
                href={`/issues/${issue.id}`}
                className="text-xs text-primary font-medium hover:underline"
              >
                Respond
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
