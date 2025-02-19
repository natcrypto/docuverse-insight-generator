import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload documents",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Check authentication again before upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Session expired",
        description: "Please sign in again to upload documents",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsUploading(true);
    const file = files[0]; // Handle one file at a time

    try {
      // Prepare form data for the edge function
      const formData = new FormData();
      formData.append('file', file);

      // Call the edge function to process the document using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Document uploaded successfully",
        description: "Your document has been processed and is ready for analysis.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isAuthenticated === false) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div
        className={`file-drop-area p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {isUploading ? (
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          )}
          <h3 className="text-lg font-semibold mb-2">
            {isUploading ? "Processing document..." : "Drag and drop your documents"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isUploading
              ? "Please wait while we analyze your document"
              : "Or click to select files to upload"}
          </p>
          <input
            type="file"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor="file-input"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            } transition-colors duration-200`}
          >
            Select Files
          </label>
        </div>
      </div>
    </Card>
  );
};
