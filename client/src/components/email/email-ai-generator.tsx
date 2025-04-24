import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsContent,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { Loader2, Wand2 } from "lucide-react";

interface EmailAiGeneratorProps {
  onContentGenerated: (subject: string, content: string) => void;
}

export default function EmailAiGenerator({ onContentGenerated }: EmailAiGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("template");
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState("introduction");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const templateOptions = [
    { id: "introduction", name: "Introduction Email" },
    { id: "follow-up", name: "Follow-up Email" },
    { id: "proposal", name: "Proposal/Offer" },
    { id: "newsletter", name: "Newsletter" },
    { id: "reminder", name: "Reminder" },
    { id: "thank-you", name: "Thank You Email" },
    { id: "invitation", name: "Invitation" }
  ];

  const generateContent = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    setGeneratedSubject("");
    
    try {
      let endpoint, requestData;
      
      if (activeTab === "template") {
        if (!subject) {
          toast({
            title: "Missing Information",
            description: "Please enter a subject for your email",
            variant: "destructive"
          });
          setIsGenerating(false);
          return;
        }
        
        endpoint = "/api/emails/generate-from-template";
        requestData = {
          templateType,
          subject
        };
      } else {
        if (!prompt) {
          toast({
            title: "Missing Information",
            description: "Please enter a custom prompt",
            variant: "destructive"
          });
          setIsGenerating(false);
          return;
        }
        
        endpoint = "/api/emails/generate-from-prompt";
        requestData = {
          prompt
        };
      }
      
      const response = await apiRequest("POST", endpoint, requestData);
      
      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setGeneratedSubject(data.subject);
      setGeneratedContent(data.content);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleApplyContent = () => {
    onContentGenerated(generatedSubject, generatedContent);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Email Generator
        </CardTitle>
        <CardDescription>
          Generate professional email content using AI based on a template or custom prompt
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="template" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="template">Use Email Template</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-type">Email Type</Label>
                <select
                  id="template-type"
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {templateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the type of email you want to generate
                </p>
              </div>
              
              <div>
                <Label htmlFor="subject">Email Subject or Topic</Label>
                <Input
                  id="subject"
                  placeholder="e.g., 'Introduction to our construction services'"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a subject or brief description of what this email should be about
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-prompt">Custom Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="e.g., 'Write a professional email to a potential client explaining our construction services...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Be specific about the tone, purpose, and content of the email you want to generate
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {generatedContent && (
          <div className="mt-8 space-y-4">
            <div>
              <Label>Generated Subject</Label>
              <div className="p-3 bg-muted rounded-md">
                {generatedSubject}
              </div>
            </div>
            
            <div>
              <Label>Generated Content</Label>
              <div className="p-3 bg-muted rounded-md whitespace-pre-wrap min-h-[200px] max-h-[400px] overflow-y-auto">
                {generatedContent}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setGeneratedContent("");
          setGeneratedSubject("");
        }}>
          Clear
        </Button>
        
        <div className="flex gap-2">
          {generatedContent && (
            <Button onClick={handleApplyContent}>
              Apply to Email Campaign
            </Button>
          )}
          
          <Button onClick={generateContent} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}