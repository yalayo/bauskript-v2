import { DailyReport } from "@shared/schema";

interface RecentReportsProps {
  reports: Array<DailyReport & { 
    projectName: string;
    author: { name: string; avatar: string };
  }>;
}

export const RecentReports = ({ reports }: RecentReportsProps) => {
  // Function to get status badge class
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-dark">Recent Reports</h2>
        <a href="/diary" className="text-primary font-medium text-sm hover:underline">
          View All
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-dark">
                    {report.projectName}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{report.date}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium ${getStatusBadge(
                      report.status
                    )} rounded-full`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <i className="fas fa-user text-xs"></i>
                    </div>
                    <div className="ml-2 text-sm text-gray-900">
                      {report.author.name}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                  <a
                    href={`/diary/${report.id}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
