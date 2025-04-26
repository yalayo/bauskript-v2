import React from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { SurveyQuestion, insertSurveyResponseSchema } from "@shared/schema";

export default function LandingPage(props) {
  const questions = props.questions;
  const currentQuestion = props.currentQuestion;
  const isLoading = props.isLoading;

  const currentStep = props.currentStep;
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [contactInfo, setContactInfo] = useState({
    email: "",
    name: "",
    company: "",
    phone: "",
  });
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Fetch survey questions
  /*const { data: questions = [], isLoading } = useQuery<SurveyQuestion[]>({
    queryKey: ["/api/survey-questions"],
  });*/

  const progress = currentQuestion / questions.length * 100;
  
  // Handle answer selection for current question
  const handleAnswer = props.handleAnswer;
  /*const handleAnswer = (answer: boolean) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep("contact");
    }
  };*/
  
  // Handle contact info form submission
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      z.string().email().parse(contactInfo.email);
    } catch (error) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Transform answers to expected format
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: parseInt(questionId),
      answer,
    }));
    
    try {
      // Submit survey response
      await apiRequest("POST", "/api/survey-responses", {
        ...contactInfo,
        answers: formattedAnswers,
      });
      
      setCurrentStep("thanks");
    } catch (error) {
      toast({
        title: "Error submitting survey",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle continue to payment page
  const handleContinueToPayment = () => {
    navigate("/checkout");
  };
  
  // Show intro screen
  if (currentStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Construction Site Management Survey</CardTitle>
            <CardDescription className="text-lg mt-2">
              Answer 20 simple yes/no questions to help us understand your construction management needs
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <img 
              src="/construction-icon.svg" 
              alt="Construction Management" 
              className="w-40 h-40 mb-6"
              onError={(e) => {
                //e.currentTarget.src = "https://via.placeholder.com/160x160?text=Construction";
              }}
            />
            <div className="text-center mb-6">
              <p className="mb-4">This quick survey will help us identify the key challenges in your construction operations and recommend the best solutions for your business.</p>
              <p>It takes just 2 minutes to complete!</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={() => setCurrentStep("survey")}>
              Start Survey
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show survey questions
  if (currentStep === "survey") {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Loading survey questions...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (questions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Survey Unavailable</CardTitle>
              <CardDescription>
                We're sorry, but the survey questions are currently unavailable. Please try again later.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    const currentQuestionData = questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</span>
              <span className="text-sm font-medium bg-muted px-2 py-1 rounded-full">
                {currentQuestionData.category}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle className="text-2xl">{currentQuestionData.question}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 h-20 text-lg border-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                onClick={() => handleAnswer(true)}
              >
                Yes
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 h-20 text-lg border-2 hover:bg-red-50 hover:border-red-500 hover:text-red-700"
                onClick={() => handleAnswer(false)}
              >
                No
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              disabled={currentQuestion === 0}
              onClick={props.handlePrevious}
            >
              Previous
            </Button>
            <Button 
              variant="ghost"
              disabled={currentQuestion === questions.length}
              onClick={props.handleNext}
            >
              Next
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Show contact information form
  if (currentStep === "contact") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Almost Done!</CardTitle>
            <CardDescription>
              Please provide your contact information to receive your personalized construction management assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full p-2 border rounded-md"
                  defaultValue={props.email}
                  onBlur={props.onChangeEmail}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  defaultValue={props.name}
                  onBlur={props.onChangeName}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  defaultValue={props.company}
                  onBlur={props.onChangeCompany}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  defaultValue={props.phone}
                  onBlur={props.onChangePhone}
                />
              </div>
              
              <Button type="submit" className="w-full mt-6">
                Submit Survey
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show thank you page with waiting list and payment option
  if (currentStep === "thanks") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
            <CardDescription className="text-lg mt-2">
              You've been added to our waiting list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center mb-4">
              <p className="mb-4">We're currently processing your responses and preparing a personalized assessment of your construction management needs.</p>
              
              <div className="bg-muted p-6 rounded-lg mt-8 text-center">
                <h3 className="text-xl font-bold mb-2">Fast-Track Your Access!</h3>
                <p className="mb-4">Skip the waiting list and get immediate access to our construction management platform with a one-time development contribution.</p>
                
                <div className="bg-primary/10 p-4 rounded-lg mb-4">
                  <h4 className="text-lg font-semibold">Development Package</h4>
                  <p className="text-2xl font-bold">€950</p>
                  <p className="text-sm text-muted-foreground">One-time payment for lifetime access</p>
                </div>
                
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Immediate platform access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lifetime updates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Early access to new features</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              size="lg" 
              className="w-full mb-4"
              onClick={handleContinueToPayment}
            >
              Get Immediate Access
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => navigate("/auth")}
            >
              No thanks, I'll wait
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return null;
}