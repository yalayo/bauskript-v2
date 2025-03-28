import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { CalendarIcon, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { InsertEmailCampaign, insertEmailCampaignSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EmailAiGenerator from "./email-ai-generator";

const formSchema = insertEmailCampaignSchema.extend({
  scheduledDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CampaignForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      dailyLimit: 400,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: InsertEmailCampaign) => {
      const res = await apiRequest("POST", "/api/email-campaigns", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "Email campaign has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email-campaigns"] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    createMutation.mutate(values);
  }
  
  const handleAiContentGenerated = (subject: string, content: string) => {
    form.setValue("subject", subject);
    form.setValue("content", content);
    setActiveTab("manual");
    toast({
      title: "AI Content Applied",
      description: "AI-generated content has been added to your campaign",
    });
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "manual" | "ai")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="manual">Manual Editor</TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          AI Content Generator
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="manual">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject line" {...field} />
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
                  <FormLabel>Email Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter email content"
                      className="h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    You can use placeholders like {"{firstName}"} that will be replaced with contact details.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Schedule Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Leave empty to save as draft.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailyLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Email Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      placeholder="400"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 400 : parseInt(value, 10));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of emails to send per day (default: 400)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveTab("ai")}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Use AI Generator
              </Button>
              
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      
      <TabsContent value="ai">
        <EmailAiGenerator onContentGenerated={handleAiContentGenerated} />
      </TabsContent>
    </Tabs>
  );
}