import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

interface ProjectProgressProps {
  projects: Project[];
}

export const ProjectProgress = ({ projects }: ProjectProgressProps) => {
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const getStatusColor = (progress: number) => {
    if (progress >= 80) return "text-success";
    if (progress >= 40) return "text-warning-dark";
    return "text-secondary";
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 40) return "bg-warning";
    return "bg-secondary";
  };

  // Filter projects based on selection
  const filteredProjects =
    selectedProject === "all"
      ? projects
      : projects.filter((project) => project.id.toString() === selectedProject);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-dark">Project Progress</h2>
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id.toString()}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.map((project) => (
        <div key={project.id} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium text-slate-dark">{project.name}</h3>
              <p className="text-xs text-gray-500">Due: {project.dueDate}</p>
            </div>
            <span
              className={`text-sm font-medium ${getStatusColor(
                project.progress
              )}`}
            >
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getProgressBarColor(
                project.progress
              )} h-2 rounded-full`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
