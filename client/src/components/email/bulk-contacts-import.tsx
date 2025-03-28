import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileArchive, AlertCircle, CheckCircle2, FileUp } from "lucide-react";

interface BulkImportStats {
  total: number;
  imported: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

interface BulkContactsImportProps {
  onImportComplete?: (stats: BulkImportStats) => void;
}

export default function BulkContactsImport({ onImportComplete }: BulkContactsImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStats, setImportStats] = useState<BulkImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setImportStats(null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    
    // Validate file type
    if (droppedFile && !/\.(xlsx|xls)$/i.test(droppedFile.name)) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    
    setFile(droppedFile);
    setError(null);
    setImportStats(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    // Validate file type
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : 90;
        });
      }, 300);

      const response = await apiRequest("POST", "/api/contacts/import", formData, "multipart/form-data");
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import contacts");
      }

      const data = await response.json();
      setImportStats(data.stats);
      
      // Call the callback if provided
      if (onImportComplete) {
        onImportComplete(data.stats);
      }

      toast({
        title: "Import Completed",
        description: data.message || `Successfully imported ${data.stats.imported} contacts`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import contacts");
      toast({
        title: "Import Failed",
        description: err instanceof Error ? err.message : "Failed to import contacts",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5" />
          Bulk Contacts Import
        </CardTitle>
        <CardDescription>
          Upload an Excel file with contacts to import them in bulk (supports up to 100,000 contacts)
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isUploading ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
          onClick={!isUploading ? triggerFileInput : undefined}
          style={{ cursor: isUploading ? "default" : "pointer" }}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".xlsx,.xls" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-primary animate-pulse" />
              <div>
                <p className="text-lg font-medium">Uploading and processing file...</p>
                <p className="text-sm text-muted-foreground">This may take a while for large files</p>
              </div>
              <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
            </div>
          ) : file ? (
            <div className="space-y-2">
              <FileUp className="mx-auto h-12 w-12 text-primary" />
              <p className="text-lg font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs">Click to change file or drag a new file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Drag and drop an Excel file</p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs">
                The file should contain emails in column B, categories in column A, and organizations in column C
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {importStats && (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Import Results</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                <div>Total contacts processed:</div>
                <div className="font-medium">{importStats.total}</div>
                
                <div>Successfully imported:</div>
                <div className="font-medium text-green-600">{importStats.imported}</div>
                
                <div>Duplicate contacts skipped:</div>
                <div className="font-medium text-amber-600">{importStats.duplicates}</div>
                
                <div>Invalid email format:</div>
                <div className="font-medium text-red-600">{importStats.invalid}</div>
                
                {importStats.errors.length > 0 && (
                  <>
                    <div className="col-span-2 mt-2 font-medium">Errors:</div>
                    <div className="col-span-2 text-sm text-red-600 max-h-40 overflow-y-auto border border-red-200 p-2 rounded">
                      {importStats.errors.map((err, index) => (
                        <div key={index} className="mb-1">{err}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          variant="default" 
          disabled={!file || isUploading}
          onClick={handleUpload}
          className="flex gap-2 items-center"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Import Contacts
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}