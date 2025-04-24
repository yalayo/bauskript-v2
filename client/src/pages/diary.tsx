import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { DailyReport, Project } from "@shared/schema";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Link } from "wouter";

const reportSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  date: z.string().min(1, "Date is required"),
  progress: z.string().min(1, "Progress description is required"),
  weather: z.object({
    temperature: z.string().optional(),
    condition: z.string().optional(),
    humidity: z.string().optional(),
    windSpeed: z.string().optional(),
  }).optional(),
  status: z.string().default("draft"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function DiaryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [isNewReportDialogOpen, setIsNewReportDialogOpen] = useState(false);

  // Fetch projects data
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch reports data
  const { data: reports = [], isLoading } = useQuery<DailyReport[]>({
    queryKey: ["/api/reports"],
  });

  // New report form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      projectId: "",
      date: new Date().toISOString().split("T")[0],
      progress: "",
      weather: {
        temperature: "",
        condition: "",
        humidity: "",
        windSpeed: "",
      },
      status: "draft",
    },
  });

  // Create new report mutation
  const createReportMutation = useMutation({
    mutationFn: async (data: ReportFormValues) => {
      const response = await apiRequest("POST", "/api/reports", {
        ...data,
        projectId: parseInt(data.projectId),
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsNewReportDialogOpen(false);
      form.reset();
      toast({
        title: "Report created",
        description: "Your daily report has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ReportFormValues) => {
    createReportMutation.mutate(data);
  };

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Filter reports based on selected tab
  const filteredReports = reports.filter((report) => {
    if (selectedTab === "all") return true;
    return report.status === selectedTab;
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
          <h1 className="text-2xl font-bold text-slate-dark mb-1">
            Construction Diary
          </h1>
          <p className="text-gray-500">
            Create and manage daily reports for your construction projects
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline">
            <i className="fas fa-download mr-2"></i>Export PDF
          </Button>
          <Dialog
            open={isNewReportDialogOpen}
            onOpenChange={setIsNewReportDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Daily Report</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem
                                  key={project.id}
                                  value={project.id.toString()}
                                >
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Progress Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe today's progress and activities"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weather.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g. 18"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weather.condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weather Condition</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sunny">Sunny</SelectItem>
                              <SelectItem value="partly_cloudy">
                                Partly Cloudy
                              </SelectItem>
                              <SelectItem value="cloudy">Cloudy</SelectItem>
                              <SelectItem value="rainy">Rainy</SelectItem>
                              <SelectItem value="stormy">Stormy</SelectItem>
                              <SelectItem value="snowy">Snowy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weather.humidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Humidity (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g. 65"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weather.windSpeed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wind Speed (km/h)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="e.g. 12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsNewReportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createReportMutation.isPending}
                    >
                      {createReportMutation.isPending ? (
                        <span className="flex items-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </span>
                      ) : (
                        "Save Report"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="in progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {getProjectName(report.projectId)}
                      </CardTitle>
                      <div
                        className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${
                            report.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : report.status === "in progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : report.status === "reviewed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {report.status}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">{report.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {report.progress}
                    </p>
                    {report.weather && (
                      <div className="flex items-center mt-4 text-xs text-gray-500">
                        <i className="fas fa-cloud-sun mr-1"></i>
                        <span>
                          {report.weather.temperature && (
                            <>{report.weather.temperature}°C, </>
                          )}
                          {report.weather.condition}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mt-4">
                      <Link
                        to={`/diary/${report.id}`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        View Details
                      </Link>
                      <div className="flex items-center text-xs text-gray-500">
                        <i className="fas fa-user mr-1"></i>
                        <span>You</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                  <i className="fas fa-book text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No reports found
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  {selectedTab === "all"
                    ? "You haven't created any reports yet."
                    : `You don't have any ${selectedTab} reports.`}
                </p>
                <Button
                  onClick={() => setIsNewReportDialogOpen(true)}
                >
                  <i className="fas fa-plus mr-2"></i>Create New Report
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
