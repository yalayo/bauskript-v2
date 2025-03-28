import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Types
type AnalyticsData = {
  totalResponses: number;
  responsesByDate: Record<string, number>;
  questionAnalytics: QuestionAnalytic[];
};

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

// Constants
const COLORS = ["#4caf50", "#f44336"];
const CATEGORIES = ["All", "Budget", "Management", "Safety", "Communication", "Resources", "General"];

type SurveyAnalyticsProps = {
  data: AnalyticsData;
  chartType?: "timeline" | "questions" | "overview";
}

export default function SurveyAnalytics({ data, chartType = "overview" }: SurveyAnalyticsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<string>(chartType);

  // Filter questions by category
  const filteredQuestions = data.questionAnalytics.filter(q => 
    selectedCategory === "All" || q.category === selectedCategory
  ) || [];

  // Sort by response count (highest first)
  const sortedQuestions = [...filteredQuestions].sort((a, b) => b.totalResponses - a.totalResponses);

  // Prepare data for Charts
  const prepareBarChartData = () => {
    return sortedQuestions.map(q => ({
      name: shortenQuestion(q.question),
      fullQuestion: q.question,
      Yes: q.yesPercentage,
      No: q.noPercentage,
    }));
  };

  const prepareResponseByDateData = () => {
    if (!data.responsesByDate) return [];
    
    return Object.entries(data.responsesByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const prepareCategoryData = () => {
    if (!data.questionAnalytics) return [];
    
    const categoryData: Record<string, { category: string, yesCount: number, noCount: number, total: number }> = {};
    
    data.questionAnalytics.forEach(q => {
      const category = q.category || "General";
      
      if (!categoryData[category]) {
        categoryData[category] = {
          category,
          yesCount: 0,
          noCount: 0,
          total: 0
        };
      }
      
      categoryData[category].yesCount += q.yesCount;
      categoryData[category].noCount += q.noCount;
      categoryData[category].total += q.totalResponses;
    });
    
    return Object.values(categoryData).map(c => ({
      category: c.category,
      yesPercentage: c.total ? Math.round((c.yesCount / c.total) * 100) : 0,
      noPercentage: c.total ? Math.round((c.noCount / c.total) * 100) : 0,
    }));
  };

  // Helper to shorten long questions for charts
  const shortenQuestion = (question: string) => {
    return question.length > 35 ? question.substring(0, 32) + "..." : question;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Survey Analytics</h2>
          <p className="text-muted-foreground">
            Analyze responses from {data.totalResponses} survey participants
          </p>
        </div>
        
        <div className="w-full md:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Responses by Category</CardTitle>
                <CardDescription>Average positive responses by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareCategoryData()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Yes Rate']} />
                    <Legend />
                    <Bar dataKey="yesPercentage" name="Yes Rate" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Timeline</CardTitle>
                <CardDescription>Responses received over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {prepareResponseByDateData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareResponseByDateData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Responses" fill="#1e88e5" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No timeline data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Summary of survey findings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{data.totalResponses}</div>
                  <div className="text-sm text-muted-foreground">Total Responses</div>
                </div>
                
                {sortedQuestions.length > 0 && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {sortedQuestions.reduce((max, q) => Math.max(max, q.yesPercentage), 0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Highest Yes Rate</div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-red-500">
                        {sortedQuestions.reduce((max, q) => Math.max(max, q.noPercentage), 0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Highest No Rate</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Response Rates</CardTitle>
              <CardDescription>Percentage of yes/no responses per question</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareBarChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.fullQuestion;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Yes" fill="#4caf50" />
                    <Bar dataKey="No" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedQuestions.map((q) => (
              <Card key={q.questionId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{q.question}</CardTitle>
                  <CardDescription>{q.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="text-center">
                      <div className="h-24 w-24 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Yes", value: q.yesPercentage },
                                { name: "No", value: q.noPercentage },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={40}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[0, 1].map((index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {q.totalResponses} responses
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="mb-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm">Yes: {q.yesPercentage}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {q.yesCount} responses
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          <span className="text-sm">No: {q.noPercentage}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {q.noCount} responses
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Timeline</CardTitle>
              <CardDescription>Responses received over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {prepareResponseByDateData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareResponseByDateData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Responses" fill="#1e88e5" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No timeline data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Summary</CardTitle>
              <CardDescription>Key metrics from survey responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{data.totalResponses}</div>
                  <div className="text-sm text-muted-foreground">Total Responses</div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {Object.keys(data.responsesByDate).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Days with Responses</div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {prepareResponseByDateData().length > 0
                      ? Math.max(...prepareResponseByDateData().map(d => d.count))
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Max Responses in One Day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}