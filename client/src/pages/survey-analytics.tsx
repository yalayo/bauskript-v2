import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import SurveyAnalytics from "@/components/survey/survey-analytics";
import { Loader2 } from "lucide-react";

// Define type for analytics data to match component expectations
type QuestionAnalytic = {
  questionId: number;
  question: string;
  category: string;
  totalResponses: number;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
  noPercentage: number;
};

type AnalyticsData = {
  totalResponses: number;
  responsesByDate: Record<string, number>;
  questionAnalytics: QuestionAnalytic[];
};

export default function SurveyAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Default empty data structure
  const defaultAnalyticsData: AnalyticsData = {
    totalResponses: 0,
    responsesByDate: {},
    questionAnalytics: []
  };

  const { data: analyticsData = defaultAnalyticsData, isLoading: dataLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/survey/analytics"],
    enabled: !!user && user.role === "admin",
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to view this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, authLoading, setLocation, toast]);

  if (authLoading || dataLoading) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Survey Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze customer survey responses
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm">
          <span className="text-primary font-medium mr-1">{analyticsData.totalResponses}</span>
          Total Responses
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Responses by Date</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Responses</CardTitle>
                <CardDescription>All-time survey responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.totalResponses}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Response Rate</CardTitle>
                <CardDescription>Completion percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round((analyticsData.totalResponses / (analyticsData.totalResponses + 12)) * 100)}%
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Based on estimated visits
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Categories</CardTitle>
                <CardDescription>Survey question categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.questionAnalytics.length > 0 
                    ? (
                        // Extract unique categories
                        (() => {
                          const categories = analyticsData.questionAnalytics.map(q => q.category);
                          const uniqueCategories = Array.from(new Set(categories));
                          return uniqueCategories.map((category: string) => (
                            <Badge key={category} variant="secondary">{category}</Badge>
                          ));
                        })()
                      )
                    : <span className="text-muted-foreground">No categories available</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Responses over Time</CardTitle>
              <CardDescription>
                Survey completion trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Response timeline chart will be rendered by SurveyAnalytics component */}
              <SurveyAnalytics data={analyticsData} chartType="timeline" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>
                Breakdown of responses by question
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Question analysis will be rendered by SurveyAnalytics component */}
              <SurveyAnalytics data={analyticsData} chartType="questions" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}