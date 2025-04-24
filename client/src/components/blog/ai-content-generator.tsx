import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { Loader2, Wand2 } from "lucide-react";

interface AiContentGeneratorProps {
  onContentGenerated: (title: string, content: string) => void;
}

export default function AiContentGenerator({ onContentGenerated }: AiContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("topic");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [topicType, setTopicType] = useState("construction-tips");
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const topicOptions = [
    { id: "construction-tips", name: "Construction Tips & Techniques" },
    { id: "industry-trends", name: "Industry Trends" },
    { id: "project-management", name: "Project Management" },
    { id: "safety-guide", name: "Safety Guides" },
    { id: "sustainability", name: "Sustainability" },
    { id: "cost-saving", name: "Cost Saving Strategies" },
    { id: "client-guide", name: "Client Guide" }
  ];

  const generateContent = async () => {
    setIsGenerating(true);
    setGeneratedContent("");

    try {
      // Determine which type of generation to perform based on the active tab
      const endpoint = activeTab === "topic" 
        ? "/api/blog/generate-from-topic" 
        : "/api/blog/generate-from-prompt";
      
      const payload = activeTab === "topic"
        ? { topicType, title }
        : { prompt };
      
      const response = await apiRequest("POST", endpoint, payload);
      
      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      
      const data = await response.json();
      
      if (data.title && data.content) {
        setTitle(data.title);
        setGeneratedContent(data.content);
      }
      
      toast({
        title: "Content Generated",
        description: "AI has successfully generated blog content for you!",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate content: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyContent = () => {
    onContentGenerated(title, generatedContent);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Content Generator
        </CardTitle>
        <CardDescription>
          Generate blog post content using AI based on a topic or custom prompt
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="topic" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="topic">Use Topic Template</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topic">
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic-type">Topic Type</Label>
                <select
                  id="topic-type"
                  value={topicType}
                  onChange={(e) => setTopicType(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {topicOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="title">Title or Main Topic</Label>
                <Input
                  id="title"
                  placeholder="e.g., '10 Essential Safety Tips for Construction Sites'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">Custom Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Write a detailed prompt for the AI to generate blog content..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {generatedContent && (
          <div className="mt-6">
            <Label>Generated Content Preview</Label>
            <div className="p-4 border rounded-md bg-slate-50 mt-2 max-h-[300px] overflow-y-auto">
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <div className="whitespace-pre-line">
                {generatedContent}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => {
          setPrompt("");
          setTitle("");
          setGeneratedContent("");
        }}>
          Clear
        </Button>
        
        <div className="flex gap-2">
          {generatedContent && (
            <Button onClick={handleApplyContent}>
              Apply to Blog Post
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