import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  status: z.string().default("draft"),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogEditorProps {
  onSuccess: () => void;
}

export default function BlogEditor({ onSuccess }: BlogEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "draft",
    },
  });

  const blogPostMutation = useMutation({
    mutationFn: async (data: BlogPostFormValues) => {
      const response = await apiRequest("POST", "/api/blog", {
        ...data,
        createdBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create blog post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BlogPostFormValues) => {
    blogPostMutation.mutate(data);
  };

  const generateContent = () => {
    // Simplified AI content generation simulation
    setTimeout(() => {
      const title = form.getValues("title");
      if (!title || title.length < 3) {
        toast({
          title: "Error",
          description: "Please enter a meaningful title first",
          variant: "destructive",
        });
        return;
      }

      const aiGeneratedContent = `# ${title}\n\n## Introduction\nThis is an AI-generated draft about ${title}. In a real application, this content would be generated using Google Gemini AI based on the title and specific construction industry context.\n\n## Key Points\n- Point 1: Important information about ${title}\n- Point 2: Best practices related to ${title}\n- Point 3: Industry standards for ${title}\n\n## Conclusion\nImplementing proper ${title} strategies can significantly improve construction site efficiency and safety. For more information, consult industry guidelines.`;
      
      form.setValue("content", aiGeneratedContent);
      
      toast({
        title: "Content Generated",
        description: "AI has created a draft based on your title. You can now edit it.",
      });
    }, 1500);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blog Post Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter an SEO-friendly title" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Content</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={generateContent}
          >
            <i className="fas fa-robot mr-2"></i>Generate with AI
          </Button>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your blog post content or generate with AI"
                  rows={15}
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
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={blogPostMutation.isPending}
          >
            {blogPostMutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </span>
            ) : (
              "Save Post"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
