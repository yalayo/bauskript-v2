import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceForm from "@/components/attendance/attendance-form";
import AttendanceList from "@/components/attendance/attendance-list";

export default function AttendancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("records");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
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
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Attendance Tracking</h1>
          <p className="text-gray-500">
            Monitor worker attendance and subcontractor activities
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline">
            <i className="fas fa-download mr-2"></i>Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <i className="fas fa-plus mr-2"></i>New Record
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="records"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          {isFormOpen ? (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <AttendanceForm
                  projects={projects}
                  userId={user?.id || 0}
                  onSuccess={() => {
                    setIsFormOpen(false);
                  }}
                  onCancel={() => setIsFormOpen(false)}
                />
              </CardContent>
            </Card>
          ) : null}

          <AttendanceList projects={projects} />
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium text-sm">Total Workers Today</h3>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary bg-opacity-10 text-primary">
                      <i className="fas fa-user-hard-hat"></i>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-dark">47</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-error flex items-center">
                      <i className="fas fa-arrow-down mr-1"></i>3%
                    </span>
                    <span className="text-gray-500 ml-2">vs yesterday</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium text-sm">Subcontractors</h3>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary bg-opacity-10 text-secondary">
                      <i className="fas fa-building"></i>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-dark">8</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-success flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>2%
                    </span>
                    <span className="text-gray-500 ml-2">vs last week</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium text-sm">Avg. Hours</h3>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent bg-opacity-10 text-accent-dark">
                      <i className="fas fa-clock"></i>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-slate-dark">7.5</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-success flex items-center">
                      <i className="fas fa-arrow-up mr-1"></i>0.5
                    </span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-bold text-slate-dark mb-4">Attendance Trends</h3>
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Attendance charts and trends will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
