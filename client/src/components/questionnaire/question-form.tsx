import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "../../components/ui/form";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Skeleton } from "../../components/ui/skeleton";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { Progress } from "../../components/ui/progress";

// Types
type SurveyQuestion = {
  id: number;
  question: string;
  category: string | null;
  orderIndex: number;
  active: boolean | null;
};

type Answer = {
  questionId: number;
  answer: boolean;
};

type SurveyFormData = {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  answers: Answer[];
};

// Props
interface QuestionFormProps {
  userEmail: string;
  onComplete: () => void;
}

export default function QuestionForm({ userEmail, onComplete }: QuestionFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    name: "",
    company: "",
    phone: ""
  });
  const { toast } = useToast();

  // Fetch survey questions
  const { data: questions, isLoading } = useQuery<SurveyQuestion[]>({
    queryKey: ['/api/survey-questions'],
    refetchOnWindowFocus: false,
  });

  // Form schema for each question (yes/no)
  const questionSchema = z.object({
    answer: z.enum(['true', 'false'], {
      required_error: "Please select Yes or No",
    }),
  });

  // Form for additional info at the end
  const additionalInfoSchema = z.object({
    name: z.string().optional(),
    company: z.string().optional(),
    phone: z.string().optional(),
  });

  // Form state for current question
  const form = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      answer: undefined,
    },
  });

  // Form state for additional info
  const additionalInfoForm = useForm<z.infer<typeof additionalInfoSchema>>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      name: "",
      company: "",
      phone: "",
    },
  });

  // Calculate progress
  const progress = questions ? (currentQuestionIndex / questions.length) * 100 : 0;
  const isLastQuestion = questions ? currentQuestionIndex === questions.length : false;
  const currentQuestion = questions ? questions[currentQuestionIndex] : null;

  // Submit mutation for the final survey data
  const submitMutation = useMutation({
    mutationFn: async (data: SurveyFormData) => {
      const response = await apiRequest("POST", "/api/survey-responses", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your responses have been successfully submitted.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Handle form submission for each question
  const onQuestionSubmit = (data: z.infer<typeof questionSchema>) => {
    if (!currentQuestion) return;

    // Store the answer
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: data.answer === 'true', // Convert to boolean
    };

    // Update answers array
    setAnswers([...answers, newAnswer]);

    // Reset form for next question
    form.reset({
      answer: undefined,
    });

    // Move to next question
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle additional info submission (final step)
  const onAdditionalInfoSubmit = (data: z.infer<typeof additionalInfoSchema>) => {
    setAdditionalInfo(data);
    setIsSubmitting(true);

    // Prepare final data for submission
    const finalData: SurveyFormData = {
      email: userEmail,
      name: data.name || undefined,
      company: data.company || undefined,
      phone: data.phone || undefined,
      answers: answers,
    };

    // Submit the complete survey
    submitMutation.mutate(finalData);
  };

  // Category grouping for questions
  const getCategoryTitle = (category: string | null): string => {
    if (!category) return "General";
    
    // Format category name (e.g., "budget" -> "Budget")
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/2 mx-auto" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-muted-foreground">No survey questions available at this time.</p>
        <Button 
          className="mt-4"
          onClick={() => onComplete()}
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isLastQuestion ? (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {currentQuestion && (
            <div className="mb-6">
              <div className="text-sm font-medium text-primary mb-2">
                {getCategoryTitle(currentQuestion.category)}
              </div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onQuestionSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="answer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="yes" />
                              <FormLabel htmlFor="yes">Yes</FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="no" />
                              <FormLabel htmlFor="no">No</FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button type="submit">
                      Next Question
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Final Step</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Additional Information (Optional)</h3>
            <Form {...additionalInfoForm}>
              <form onSubmit={additionalInfoForm.handleSubmit(onAdditionalInfoSubmit)} className="space-y-4">
                <FormField
                  control={additionalInfoForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Your name"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={additionalInfoForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Your company"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={additionalInfoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Your phone number"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Skip additional info and submit with just email and answers
                      const finalData: SurveyFormData = {
                        email: userEmail,
                        answers: answers,
                      };
                      setIsSubmitting(true);
                      submitMutation.mutate(finalData);
                    }}
                    disabled={isSubmitting}
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}