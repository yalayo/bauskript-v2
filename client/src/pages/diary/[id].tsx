import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, Camera, Clipboard, Edit, Save, X, Wind, Thermometer, Cloud, Sun, CloudRain } from "lucide-react";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { DailyReport, insertDailyReportSchema, Project, Photo } from "@shared/schema";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth } from "../../hooks/use-auth";

// Extend the report schema for editing
const reportEditSchema = insertDailyReportSchema.extend({
  notes: z.string().optional(),
  materials: z.string().optional(),
  equipment: z.string().optional(),
  safety: z.string().optional(),
});

type ReportEditValues = z.infer<typeof reportEditSchema>;

// Weather icon mapping
const WeatherIcon = ({ condition }: { condition: string }) => {
  switch (condition?.toLowerCase()) {
    case 'sunny':
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case 'cloudy':
      return <Cloud className="h-6 w-6 text-gray-500" />;
    case 'rainy':
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    case 'windy':
      return <Wind className="h-6 w-6 text-blue-300" />;
    default:
      return <Thermometer className="h-6 w-6 text-gray-500" />;
  }
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch the report by ID
  const { data: report, isLoading, error } = useQuery<DailyReport>({
    queryKey: ['/api/daily-reports', parseInt(id)],
    queryFn: () => fetch(`/api/daily-reports/${id}`).then(res => res.json()),
  });

  // Fetch projects for dropdown
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: () => fetch('/api/projects').then(res => res.json()),
  });

  // Fetch photos associated with this report
  const { data: photos } = useQuery<Photo[]>({
    queryKey: ['/api/photos', { reportId: parseInt(id) }],
    queryFn: () => fetch(`/api/photos?reportId=${id}`).then(res => res.json()),
  });

  // Form setup for editing
  const form = useForm<ReportEditValues>({
    resolver: zodResolver(reportEditSchema),
    defaultValues: {
      date: "",
      projectId: 0,
      progress: "",
      status: "",
      notes: "",
      materials: "",
      equipment: "",
      safety: "",
    },
  });

  // Update form values when report data is loaded
  useEffect(() => {
    if (report) {
      form.reset({
        date: report.date,
        projectId: report.projectId,
        progress: report.progress || "",
        status: report.status || "",
        notes: report.notes || "",
        materials: report.materials || "",
        equipment: report.equipment || "",
        safety: report.safety || "",
      });
    }
  }, [report, form]);

  // Update report mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ReportEditValues) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/daily-reports/${id}`, 
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report updated",
        description: "Your report has been updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/daily-reports', parseInt(id)] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ReportEditValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">Failed to load report. Please try again.</p>
        <Button asChild className="mt-4">
          <Link href="/diary">Back to Diary</Link>
        </Button>
      </div>
    );
  }

  const projectName = projects?.find(p => p.id === report.projectId)?.name || 'Unknown Project';
  const weatherData = report.weather ? JSON.parse(JSON.stringify(report.weather)) : {};
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/diary">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Diary
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-grow">Daily Report Details</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Report
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Report</CardTitle>
                <CardDescription>Make changes to the daily report</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projects?.map((project) => (
                                  <SelectItem key={project.id} value={project.id.toString()}>
                                    {project.name}
                                  </SelectItem>
                                ))}
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
                        name="progress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Progress</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 75% complete" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
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
                                <SelectItem value="On Schedule">On Schedule</SelectItem>
                                <SelectItem value="Behind Schedule">Behind Schedule</SelectItem>
                                <SelectItem value="Ahead of Schedule">Ahead of Schedule</SelectItem>
                                <SelectItem value="Paused">Paused</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter details about today's work"
                              className="min-h-[120px]"
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
                        name="materials"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Materials Used</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List materials used today"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment Used</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List equipment used today"
                                className="min-h-[80px]"
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
                      name="safety"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Safety Observations</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Note any safety concerns or observations"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{new Date(report.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                        <CardDescription>{projectName}</CardDescription>
                      </div>
                      <Badge variant={report.status === 'On Schedule' ? 'default' : report.status === 'Behind Schedule' ? 'destructive' : 'outline'}>
                        {report.status || 'No Status'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                        <p>{report.progress || 'No progress reported'}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                        <p className="whitespace-pre-line">{report.notes || 'No notes available'}</p>
                      </div>
                      
                      {weatherData && Object.keys(weatherData).length > 0 && (
                        <>
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Weather Conditions</h3>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <WeatherIcon condition={weatherData.condition || 'unknown'} />
                                <span>{weatherData.condition || 'Unknown'}</span>
                              </div>
                              
                              {weatherData.temperature && (
                                <div className="flex items-center space-x-2">
                                  <Thermometer className="h-5 w-5 text-orange-500" />
                                  <span>{weatherData.temperature}°C</span>
                                </div>
                              )}
                              
                              {weatherData.wind && (
                                <div className="flex items-center space-x-2">
                                  <Wind className="h-5 w-5 text-blue-400" />
                                  <span>{weatherData.wind} km/h</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">
                      Created on {new Date(report.createdAt || Date.now()).toLocaleDateString()} by {user?.username || 'Unknown User'}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Materials Used</h3>
                        <p className="whitespace-pre-line">{report.materials || 'No materials listed'}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Equipment Used</h3>
                        <p className="whitespace-pre-line">{report.equipment || 'No equipment listed'}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Safety Observations</h3>
                        <p className="whitespace-pre-line">{report.safety || 'No safety observations recorded'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Photos</CardTitle>
                    <CardDescription>Photos taken on this date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {photos && photos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((photo) => (
                          <div key={photo.id} className="overflow-hidden rounded-md border">
                            <img 
                              src={photo.imageUrl}
                              alt={photo.title || 'Site photo'}
                              className="h-40 w-full object-cover"
                            />
                            <div className="p-2">
                              <h4 className="font-medium truncate">{photo.title || 'Untitled'}</h4>
                              {photo.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {photo.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="font-medium mb-2">No photos available</h3>
                        <p className="text-sm text-muted-foreground">
                          No photos have been attached to this report.
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/photos">
                            Manage Photos
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd>{report.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                  <dd>{new Date(report.date).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Project</dt>
                  <dd>{projectName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={report.status === 'On Schedule' ? 'default' : report.status === 'Behind Schedule' ? 'destructive' : 'outline'}>
                      {report.status || 'No Status'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                  <dd>{user?.username || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created On</dt>
                  <dd>{new Date(report.createdAt || Date.now()).toLocaleString()}</dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col space-y-2 w-full">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/diary">
                    <Clipboard className="mr-2 h-4 w-4" />
                    All Reports
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/photos">
                    <Camera className="mr-2 h-4 w-4" />
                    Manage Photos
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent changes to this report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-1 h-1 mt-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm font-medium">Report created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.createdAt || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
                {report.updatedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-1 h-1 mt-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm font-medium">Report updated</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}