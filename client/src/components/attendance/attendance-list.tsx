import { useQuery } from "@tanstack/react-query";
import { Attendance, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AttendanceListProps {
  projects: Project[];
}

export default function AttendanceList({ projects }: AttendanceListProps) {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", selectedProject !== "all" ? { projectId: selectedProject } : {}],
  });

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Filter records based on selected date
  const filteredRecords = selectedDate
    ? attendanceRecords.filter((record) => record.date === selectedDate)
    : attendanceRecords;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get unique dates from records for filtering
  const uniqueDates = [...new Set(attendanceRecords.map((record) => record.date))].sort().reverse();

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Project:
          </label>
          <Select
            value={selectedProject}
            onValueChange={(value) => setSelectedProject(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
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

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Date:
          </label>
          <Select
            value={selectedDate}
            onValueChange={setSelectedDate}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Dates</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <div>
                  <h3 className="text-lg font-medium text-slate-dark">
                    {getProjectName(record.projectId)}
                  </h3>
                  <p className="text-sm text-gray-500">Date: {record.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-download mr-2"></i>Export
                  </Button>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-ellipsis-v"></i>
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Array.isArray(record.workers) ? (
                        record.workers.map((worker: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {worker.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {worker.company}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {worker.position || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {worker.hours}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm text-gray-500">
                            No worker data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-right">
                          Total Hours:
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {Array.isArray(record.workers)
                            ? record.workers.reduce(
                                (sum: number, worker: any) => sum + parseFloat(worker.hours || 0),
                                0
                              )
                            : 0}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border rounded-lg">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <i className="fas fa-users text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records found</h3>
          <p className="text-gray-500 mb-4">
            {selectedProject === "all" && !selectedDate
              ? "No attendance records have been created yet."
              : "No records match your current filters."}
          </p>
          {selectedProject !== "all" || selectedDate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProject("all");
                setSelectedDate("");
              }}
            >
              Clear Filters
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
