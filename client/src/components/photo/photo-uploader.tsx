import { useState } from "react";
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
import { Project } from "@shared/schema";

const photoSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"), // In a real app, this would handle file uploads
});

type PhotoFormValues = z.infer<typeof photoSchema>;

interface PhotoUploaderProps {
  projects: Project[];
  onSuccess: () => void;
}

export default function PhotoUploader({ projects, onSuccess }: PhotoUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState("");

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      imageUrl: "",
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (data: PhotoFormValues) => {
      const response = await apiRequest("POST", "/api/photos", {
        ...data,
        projectId: parseInt(data.projectId),
        createdBy: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      toast({
        title: "Success",
        description: "Photo has been uploaded successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to upload photo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PhotoFormValues) => {
    photoMutation.mutate(data);
  };

  // This is a simplified version for demo purposes
  // In a real app, you would use a proper file upload component
  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setPreviewUrl(url);
  };

  // Sample images for demo purposes
  const sampleImages = [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29uc3RydWN0aW9uJTIwc2l0ZXxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNvbnN0cnVjdGlvbiUyMHNpdGV8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1508450859948-4e04fabaa4ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGNvbnN0cnVjdGlvbiUyMHNpdGV8ZW58MHx8MHx8fDA%3D",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id.toString()}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter photo title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a description for this photo"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            {sampleImages.map((url, index) => (
              <div
                key={index}
                className={`border rounded-md cursor-pointer overflow-hidden ${
                  form.watch("imageUrl") === url
                    ? "ring-2 ring-primary"
                    : "hover:opacity-90"
                }`}
                onClick={() => handleImageUrlChange(url)}
              >
                <img src={url} alt={`Sample ${index + 1}`} className="w-full h-24 object-cover" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Note: In a real application, you would upload your own photos.
          </p>
          <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
        </div>

        {previewUrl && (
          <div className="border rounded-md p-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-48 object-contain rounded"
            />
          </div>
        )}

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
            disabled={photoMutation.isPending}
          >
            {photoMutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Uploading...
              </span>
            ) : (
              "Upload Photo"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
