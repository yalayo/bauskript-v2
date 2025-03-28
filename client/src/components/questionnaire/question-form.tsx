import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Plus, X, Check } from "lucide-react";

type QuestionType = 'text' | 'multipleChoice' | 'checkbox' | 'longText';

interface Question {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  required: boolean;
}

interface QuestionFormProps {
  onComplete: (responses: Record<string, any>) => void;
  email: string;
}

export default function QuestionForm({ onComplete, email }: QuestionFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Sample questions about construction projects
  const questions: Question[] = [
    {
      id: 1,
      type: 'text',
      question: 'What type of construction project are you managing?',
      required: true,
    },
    {
      id: 2,
      type: 'multipleChoice',
      question: 'What is the approximate size of your construction site?',
      options: ['Small (less than 500 sq m)', 'Medium (500-2000 sq m)', 'Large (2000-10000 sq m)', 'Very large (10000+ sq m)'],
      required: true,
    },
    {
      id: 3,
      type: 'multipleChoice',
      question: 'How many workers do you typically have on site?',
      options: ['1-5', '6-15', '16-30', '31-50', '50+'],
      required: true,
    },
    {
      id: 4,
      type: 'checkbox',
      question: 'What features are you most interested in? (Select all that apply)',
      options: [
        'Daily reporting',
        'Photo documentation',
        'Attendance tracking',
        'Issue management',
        'Weather tracking',
        'Material inventory',
        'Equipment management',
        'Communication tools',
      ],
      required: true,
    },
    {
      id: 5,
      type: 'longText',
      question: 'What are your biggest challenges in managing construction sites?',
      required: false,
    },
  ];
  
  const currentQuestion = questions[currentStep];
  
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit all responses
      onComplete({ ...responses, email });
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleTextChange = (value: string) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value
    });
  };
  
  const handleMultipleChoiceChange = (value: string) => {
    setResponses({
      ...responses,
      [currentQuestion.id]: value
    });
  };
  
  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentSelections = responses[currentQuestion.id] || [];
    let newSelections;
    
    if (checked) {
      newSelections = [...currentSelections, option];
    } else {
      newSelections = currentSelections.filter((item: string) => item !== option);
    }
    
    setResponses({
      ...responses,
      [currentQuestion.id]: newSelections
    });
  };
  
  const isNextDisabled = () => {
    if (!currentQuestion.required) return false;
    
    const response = responses[currentQuestion.id];
    
    if (currentQuestion.type === 'checkbox') {
      return !response || (Array.isArray(response) && response.length === 0);
    }
    
    return !response;
  };
  
  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <Input
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here"
            className="w-full"
          />
        );
      
      case 'longText':
        return (
          <Textarea
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here"
            className="w-full min-h-[150px]"
          />
        );
      
      case 'multipleChoice':
        return (
          <RadioGroup
            value={responses[currentQuestion.id] || ''}
            onValueChange={handleMultipleChoiceChange}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const currentSelections = responses[currentQuestion.id] || [];
              const isChecked = Array.isArray(currentSelections) && currentSelections.includes(option);
              
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Project Questionnaire</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {questions.length}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentQuestion.required ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-green-500">(Optional)</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">{currentQuestion.question}</h3>
          {renderQuestionInput()}
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full mt-6">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isNextDisabled()}
        >
          {currentStep === questions.length - 1 ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Submit
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}