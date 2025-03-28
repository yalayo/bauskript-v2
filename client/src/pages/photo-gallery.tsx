import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Photo, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PhotoUploader from "@/components/photo/photo-uploader";
import PhotoGrid from "@/components/photo/photo-grid";

export default function PhotoGalleryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Fetch projects data
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch photos data
  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const isLoading = projectsLoading || photosLoading;

  // Filter photos based on selected project
  const filteredPhotos = photos.filter((photo) => {
    if (selectedProject === "all") return true;
    return photo.projectId.toString() === selectedProject;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-dark mb-1">Site Photos</h1>
          <p className="text-gray-500">
            Manage and organize construction site photos
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-upload mr-2"></i>Upload Photos
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Site Photos</DialogTitle>
              </DialogHeader>
              <PhotoUploader 
                projects={projects}
                onSuccess={() => setIsUploadDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Photo Gallery</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Photos</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="annotated">Annotated</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredPhotos.length > 0 ? (
                <PhotoGrid photos={filteredPhotos} projects={projects} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <i className="fas fa-images text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No photos found</h3>
                  <p className="text-gray-500 mb-4">Upload some photos to get started</p>
                  <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <i className="fas fa-upload mr-2"></i>Upload Photos
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
