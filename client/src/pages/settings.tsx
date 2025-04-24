import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { useToast } from "../hooks/use-toast";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      company: "",
      jobTitle: "",
    },
  });

  const onProfileSubmit = (data: ProfileFormValues) => {
    // In a real app, you would update the user's profile
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSecuritySubmit = (data: SecurityFormValues) => {
    // In a real app, you would update the user's password
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    securityForm.reset();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-dark mb-1">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your company"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Site Manager"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form
                  onSubmit={securityForm.handleSubmit(onSecuritySubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Update Password</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-dark">Current Plan</h3>
                    <p className="text-sm text-gray-500">You are currently on the Basic plan</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary text-white text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Basic Plan</span>
                    <span className="font-bold text-primary">€35/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    "Done For You" - Our team manages your construction site documentation
                  </p>
                  <div className="border-t pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <i className="fas fa-check text-success mr-2"></i>
                        Daily reports management
                      </li>
                      <li className="flex items-center text-sm">
                        <i className="fas fa-check text-success mr-2"></i>
                        Worker attendance tracking
                      </li>
                      <li className="flex items-center text-sm">
                        <i className="fas fa-check text-success mr-2"></i>
                        Basic issue tracking
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">Cancel Subscription</Button>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>

              <h3 className="font-medium text-lg mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Done With You</h4>
                    <span className="font-bold text-primary">€2,700</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">One-time payment</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm">
                      <i className="fas fa-check text-success mr-2"></i>
                      Collaborative setup
                    </li>
                    <li className="flex items-center text-sm">
                      <i className="fas fa-check text-success mr-2"></i>
                      Training & support
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = "/checkout"}>
                    Select Plan
                  </Button>
                </div>

                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Done By You</h4>
                    <span className="font-bold text-primary">€950</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">+ hourly support</p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm">
                      <i className="fas fa-check text-success mr-2"></i>
                      Installation & configuration
                    </li>
                    <li className="flex items-center text-sm">
                      <i className="fas fa-check text-success mr-2"></i>
                      On-demand support
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = "/checkout"}>
                    Select Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Daily Report Summaries</h3>
                    <p className="text-sm text-gray-500">Receive a daily summary of reports</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only" id="toggle-1" defaultChecked />
                    <div className="h-6 bg-gray-200 border-2 border-gray-200 rounded-full w-11 cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Issue Alerts</h3>
                    <p className="text-sm text-gray-500">Receive alerts for new issues</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only" id="toggle-2" defaultChecked />
                    <div className="h-6 bg-gray-200 border-2 border-gray-200 rounded-full w-11 cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weather Alerts</h3>
                    <p className="text-sm text-gray-500">Receive alerts for severe weather</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only" id="toggle-3" />
                    <div className="h-6 bg-gray-200 border-2 border-gray-200 rounded-full w-11 cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Marketing Updates</h3>
                    <p className="text-sm text-gray-500">Receive product updates and announcements</p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input type="checkbox" className="sr-only" id="toggle-4" defaultChecked />
                    <div className="h-6 bg-gray-200 border-2 border-gray-200 rounded-full w-11 cursor-pointer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
