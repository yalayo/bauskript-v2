import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import QuestionForm from "@/components/questionnaire/question-form";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState<"email" | "questions" | "complete">("email");
  const [userEmail, setUserEmail] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const emailMutation = useMutation({
    mutationFn: async (data: EmailFormValues) => {
      // In a real app, you might want to validate or register the email first
      return data;
    },
    onSuccess: (data) => {
      setUserEmail(data.email);
      setCurrentStep("questions");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error processing your email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = (data: EmailFormValues) => {
    emailMutation.mutate(data);
  };

  const handleQuestionnaireComplete = () => {
    setCurrentStep("complete");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-white mr-3">
            <i className="fas fa-hard-hat"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-dark">ConstructPro</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {currentStep === "email" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to ConstructPro</CardTitle>
                <CardDescription>
                  Help us understand your construction management needs by answering a few questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEmailSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={emailMutation.isPending}>
                      {emailMutation.isPending ? (
                        <span className="flex items-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Processing...
                        </span>
                      ) : (
                        "Continue to Questionnaire"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {currentStep === "questions" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Construction Management Questionnaire</CardTitle>
                <CardDescription>
                  Please answer the following questions to help us understand your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionForm 
                  userEmail={userEmail} 
                  onComplete={handleQuestionnaireComplete}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === "complete" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Thank You!</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                  <i className="fas fa-check-circle text-2xl"></i>
                </div>
                <p className="text-lg mb-4">
                  We've received your responses and you've been added to our waiting list.
                </p>
                <p className="text-gray-500 mb-8">
                  Our team will analyze your needs and get back to you shortly with more information about how ConstructPro can help your business.
                </p>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/")}
                  >
                    Go to Home Page
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => setLocation("/checkout")}
                  >
                    Explore Pricing Options
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setLocation("/survey-analytics")}
                    >
                      <i className="fas fa-chart-pie mr-2"></i>
                      View Survey Analytics
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
