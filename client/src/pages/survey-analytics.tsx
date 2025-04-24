import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SurveyQuestion, SurveyResponse } from "@shared/schema";
import { Loader2, Calendar, User, Building, Phone, Mail, Check, X } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

export default function SurveyAnalytics() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Query survey questions
  const { 
    data: questions = [], 
    isLoading: isLoadingQuestions 
  } = useQuery<SurveyQuestion[]>({ 
    queryKey: ["/api/survey-questions"],
  });
  
  // Query survey responses
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics 
  } = useQuery<any>({ 
    queryKey: ["/api/survey-analytics"],
    enabled: !isLoading && !!user && user.role === "admin"
  });
  
  // Group questions by category
  const questionsByCategory = questions.reduce((acc, question) => {
    if (!question.category) return acc;
    
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);
  
  const categories = Object.keys(questionsByCategory);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    toast({
      title: "Access Denied",
      description: "You must be an admin to view this page",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }
  
  if (isLoadingQuestions || isLoadingAnalytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Analytics</CardTitle>
            <CardDescription>Loading analytics data...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Survey Analytics</CardTitle>
            <CardDescription>No survey data available yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No survey responses have been submitted yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFF"];
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Survey Analytics Dashboard</CardTitle>
          <CardDescription>
            Analysis of survey responses from potential construction site management customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center">{analytics.totalResponses}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Companies Represented</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center">{analytics.uniqueCompanies}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Latest Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-center">
                  {analytics.latestResponseDate 
                    ? new Date(analytics.latestResponseDate).toLocaleDateString()
                    : "No responses yet"
                  }
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Temporal charts */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">Response Trends</h3>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Object.entries(analytics.responsesByDate).map(([date, count]) => ({
                    date,
                    count,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Responses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Question-specific analysis */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Question Analysis</h3>
            
            <Tabs defaultValue={categories[0]} onValueChange={setActiveCategory}>
              <TabsList className="mb-4">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {questionsByCategory[category].map((question) => {
                      const questionData = analytics.questionAnalytics.find(
                        (q: any) => q.questionId === question.id
                      );
                      
                      if (!questionData) return null;
                      
                      const data = [
                        { name: 'Yes', value: questionData.yesCount },
                        { name: 'No', value: questionData.noCount },
                      ];
                      
                      return (
                        <Card key={question.id} className="h-full">
                          <CardHeader>
                            <CardTitle className="text-md font-medium">
                              {question.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center">
                            <div className="h-60 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? "#4CAF50" : "#F44336"} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 w-full mt-2">
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-[#4CAF50] mr-2"></div>
                                <span className="text-sm">Yes: {questionData.yesCount}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-[#F44336] mr-2"></div>
                                <span className="text-sm">No: {questionData.noCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent submissions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>The most recent survey responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.recentResponses?.map((response: SurveyResponse) => (
              <Card key={response.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{response.name || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {typeof response.createdAt === 'string' 
                          ? new Date(response.createdAt).toLocaleDateString() 
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {response.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{response.email}</span>
                      </div>
                    )}
                    {response.company && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{response.company}</span>
                      </div>
                    )}
                    {response.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{response.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Answers:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.isArray(response.answers) && response.answers.map((answer: any) => {
                        const question = questions.find(q => q.id === answer.questionId);
                        return question ? (
                          <div key={answer.questionId} className="flex items-start space-x-2">
                            {answer.answer ? (
                              <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mt-0.5" />
                            )}
                            <span className="text-sm">{question.question}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!analytics.recentResponses || analytics.recentResponses.length === 0) && (
              <div className="text-center py-10 text-muted-foreground">
                No responses yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}