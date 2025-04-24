import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { Project } from "@shared/schema";

const workerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  position: z.string().optional(),
  hours: z.string().min(1, "Hours is required"),
});

const attendanceSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  date: z.string().min(1, "Date is required"),
  workers: z.array(workerSchema).min(1, "At least one worker must be added"),
});

type WorkerValues = z.infer<typeof workerSchema>;
type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  projects: Project[];
  userId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AttendanceForm({ projects, userId, onSuccess, onCancel }: AttendanceFormProps) {
  const { toast } = useToast();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      projectId: "",
      date: new Date().toISOString().split("T")[0],
      workers: [{ name: "", company: "", position: "", hours: "" }],
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: async (data: AttendanceFormValues) => {
      const response = await apiRequest("POST", "/api/attendance", {
        projectId: parseInt(data.projectId),
        date: data.date,
        workers: data.workers,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Success",
        description: "Attendance record has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create attendance record: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addWorker = () => {
    const currentWorkers = form.getValues().workers;
    form.setValue("workers", [
      ...currentWorkers,
      { name: "", company: "", position: "", hours: "" },
    ]);
  };

  const removeWorker = (index: number) => {
    const currentWorkers = form.getValues().workers;
    if (currentWorkers.length > 1) {
      form.setValue(
        "workers",
        currentWorkers.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = (data: AttendanceFormValues) => {
    attendanceMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="text-md font-medium mb-4">Workers</h3>
          {form.watch("workers").map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 border rounded-md">
              <FormField
                control={form.control}
                name={`workers.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Worker name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`workers.${index}.company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`workers.${index}.position`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Position/Role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`workers.${index}.hours`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input placeholder="Hours worked" {...field} />
                      </FormControl>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeWorker(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addWorker}
            className="mt-2"
          >
            <i className="fas fa-plus mr-2"></i>Add Worker
          </Button>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={attendanceMutation.isPending}
          >
            {attendanceMutation.isPending ? (
              <span className="flex items-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving...
              </span>
            ) : (
              "Save Attendance"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
