import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { StatsCard } from "../components/dashboard/stats-card";
import { ProjectProgress } from "../components/dashboard/project-progress";
import { WeatherWidget } from "../components/dashboard/weather-widget";
import { RecentReports } from "../components/dashboard/recent-reports";
import { RecentIssues } from "../components/dashboard/recent-issues";

export default function Dashboard() {
  // Fetch projects data
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Sample weather data - in a real app, this would come from an API
  const weatherData = {
    location: "Riverfront Tower",
    date: "Today, Oct 4",
    current: {
      temp: 18,
      condition: "Partly Cloudy",
      icon: "cloud-sun",
      humidity: 58,
      windSpeed: 12,
      rainChance: 20,
    },
    forecast: [
      {
        day: "Tomorrow",
        condition: "Sunny",
        icon: "sun",
        tempMin: 14,
        tempMax: 21,
      },
      {
        day: "Oct 6",
        condition: "Rainy",
        icon: "cloud-rain",
        tempMin: 12,
        tempMax: 17,
      },
      {
        day: "Oct 7",
        condition: "Cloudy",
        icon: "cloud",
        tempMin: 13,
        tempMax: 19,
      },
    ],
  };

  // Sample reports data - in a real app, this would come from an API
  const reports = [
    {
      id: 1,
      projectId: 1,
      projectName: "Riverfront Tower",
      userId: 1,
      date: "Oct 3, 2023",
      status: "Completed",
      author: {
        name: "John Doe",
        avatar: "",
      },
      createdAt: new Date(),
    },
    {
      id: 2,
      projectId: 2,
      projectName: "Metro Plaza",
      userId: 2,
      date: "Oct 2, 2023",
      status: "In Progress",
      author: {
        name: "Sarah Johnson",
        avatar: "",
      },
      createdAt: new Date(),
    },
    {
      id: 3,
      projectId: 3,
      projectName: "Harbor Office",
      userId: 3,
      date: "Oct 1, 2023",
      status: "Reviewed",
      author: {
        name: "Michael Thompson",
        avatar: "",
      },
      createdAt: new Date(),
    },
    {
      id: 4,
      projectId: 4,
      projectName: "Suburban Residence",
      userId: 4,
      date: "Sep 30, 2023",
      status: "Delayed",
      author: {
        name: "Emily Rodriguez",
        avatar: "",
      },
      createdAt: new Date(),
    },
  ];

  // Sample issues data - in a real app, this would come from an API
  const issues = [
    {
      id: 1,
      projectId: 1,
      projectName: "Riverfront Tower",
      title: "Material delay - Steel beams",
      description:
        "Delivery of steel beams delayed by 3 days. May impact schedule if not resolved.",
      priority: "High",
      status: "open",
      createdBy: 1,
      author: {
        name: "John Doe",
        avatar: "",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      projectId: 2,
      projectName: "Metro Plaza",
      title: "Concrete quality issues",
      description:
        "Recent batch of concrete shows inconsistent quality. Testing required.",
      priority: "Medium",
      status: "open",
      createdBy: 2,
      author: {
        name: "Sarah Johnson",
        avatar: "",
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      projectId: 4,
      projectName: "Suburban Residence",
      title: "Permit review pending",
      description:
        "Still waiting on city approval for extension. Follow up needed.",
      priority: "Low",
      status: "open",
      createdBy: 4,
      author: {
        name: "Emily Rodriguez",
        avatar: "",
      },
      createdAt: new Date().toISOString(),
    },
  ];

  if (projectsLoading) {
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
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening at your sites.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-slate-dark font-medium text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
            <i className="fas fa-download mr-2"></i>Export
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
            <i className="fas fa-plus mr-2"></i>New Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Projects"
          value={projects.length}
          icon="fas fa-building"
          iconBgClass="bg-primary bg-opacity-10"
          iconColor="text-primary"
          trend={{
            value: "12%",
            isPositive: true,
            text: "vs last month",
          }}
        />

        <StatsCard
          title="Today's Attendance"
          value="47"
          icon="fas fa-user-hard-hat"
          iconBgClass="bg-secondary bg-opacity-10"
          iconColor="text-secondary"
          trend={{
            value: "3%",
            isPositive: false,
            text: "vs yesterday",
          }}
        />

        <StatsCard
          title="Open Issues"
          value={issues.length}
          icon="fas fa-exclamation-triangle"
          iconBgClass="bg-warning bg-opacity-10"
          iconColor="text-warning-dark"
          trend={{
            value: "5%",
            isPositive: true,
            text: "vs last week",
          }}
        />

        <StatsCard
          title="Completed Tasks"
          value="85"
          icon="fas fa-check-circle"
          iconBgClass="bg-success bg-opacity-10"
          iconColor="text-success"
          trend={{
            value: "8%",
            isPositive: true,
            text: "vs last week",
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <ProjectProgress projects={projects} />

        {/* Weather Widget */}
        <WeatherWidget weatherData={weatherData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Reports */}
        <RecentReports reports={reports} />

        {/* Recent Issues */}
        <RecentIssues issues={issues} />
      </div>
    </div>
  );
}
