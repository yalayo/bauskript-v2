import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { BlogPost } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import AiContentGenerator from "./ai-content-generator";
import { Wand2 } from "lucide-react";

// Form validation schema
const blogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  status: z.enum(["draft", "published"])
});

type BlogFormValues = z.infer<typeof blogPostSchema>;

interface BlogEditorProps {
  onSuccess?: () => void;
  blogPost?: BlogPost;
}

export default function BlogEditor({ onSuccess, blogPost }: BlogEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("editor");
  const { toast } = useToast();
  
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: blogPost?.title || "",
      content: blogPost?.content || "",
      status: (blogPost?.status as "draft" | "published") || "draft"
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const response = await apiRequest(
        "POST", 
        "/api/blog", 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create blog post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const response = await apiRequest(
        "PATCH", 
        `/api/blog/${blogPost?.id}`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update blog post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: BlogFormValues) => {
    setIsSubmitting(true);
    if (blogPost) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
    setIsSubmitting(false);
  };

  const handleContentGenerated = (title: string, content: string) => {
    form.setValue("title", title);
    form.setValue("content", content);
    setActiveTab("editor");
    
    toast({
      title: "Content Applied",
      description: "AI-generated content has been applied to the editor",
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="editor">Manual Editor</TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          AI Content Generator
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="editor">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your blog post content here..."
                      className="min-h-[300px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setActiveTab("ai")}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Use AI Generator
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                    {blogPost ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  blogPost ? "Update Post" : "Create Post"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="ai">
        <AiContentGenerator onContentGenerated={handleContentGenerated} />
      </TabsContent>
    </Tabs>
  );
}