import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/app/survey-analytics");
      } else {
        navigate("/app");
      }
    }
  }, [user, navigate]);

  // Login form handling
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Register form handling
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
    },
  });

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Column: Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-white mr-3">
              <i className="fas fa-hard-hat"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-dark">ConstructPro</h1>
          </div>

          <Tabs
            defaultValue="login"
            value={authTab}
            onValueChange={(v) => setAuthTab(v as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <span className="flex items-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Logging in...
                          </span>
                        ) : (
                          "Log In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <span className="flex items-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Creating account...
                          </span>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column: Hero Image/Content */}
      <div className="hidden lg:flex w-1/2 bg-secondary p-12 text-white items-center justify-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Streamline Your Construction Site Management
          </h2>
          <p className="text-lg mb-8">
            ConstructPro helps you manage construction projects efficiently with
            digital diaries, attendance tracking, issue management, and more.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mr-4">
                <i className="fas fa-clipboard-check text-xl"></i>
              </div>
              <span>Track daily progress and create detailed reports</span>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mr-4">
                <i className="fas fa-user-hard-hat text-xl"></i>
              </div>
              <span>Monitor worker attendance and subcontractor activities</span>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mr-4">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <span>Identify and resolve issues quickly</span>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-white bg-opacity-20 p-2 mr-4">
                <i className="fas fa-cloud-sun text-xl"></i>
              </div>
              <span>Stay updated with weather conditions for your sites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
