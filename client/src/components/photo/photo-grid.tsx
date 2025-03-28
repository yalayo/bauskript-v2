import { useState } from "react";
import { Photo, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PhotoGridProps {
  photos: Photo[];
  projects: Project[];
}

export default function PhotoGrid({ photos, projects }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Open photo details
  const openPhotoDetails = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDetailsOpen(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openPhotoDetails(photo)}
          >
            <div className="relative aspect-square">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-medium text-slate-dark text-sm truncate">{photo.title}</h3>
              <p className="text-xs text-gray-500 truncate">{getProjectName(photo.projectId)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-dark">{selectedPhoto.title}</h2>
                  <p className="text-sm text-gray-500">{getProjectName(selectedPhoto.projectId)}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Description:</p>
                  <p className="text-sm">
                    {selectedPhoto.description || "No description provided"}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm">Uploaded:</p>
                  <p className="text-sm">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="border-t pt-4 flex justify-between">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-pencil-alt mr-2"></i>Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <i className="fas fa-download mr-2"></i>Download
                  </Button>
                </div>
                
                {/* Annotation tools would go here in a real app */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Annotation Tools:</p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <i className="fas fa-pen mr-2"></i>Draw
                    </Button>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-font mr-2"></i>Text
                    </Button>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-shapes mr-2"></i>Shapes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
