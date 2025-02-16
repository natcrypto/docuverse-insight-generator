
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Upload, File } from "lucide-react";
import { Card } from "@/components/ui/card";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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

  const handleFiles = (files: File[]) => {
    // TODO: Implement file processing
    toast({
      title: "Files received",
      description: `Processing ${files.length} files...`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div
        className={`file-drop-area ${isDragging ? "active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Drag and drop your documents
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Or click to select files to upload
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Select Files
          </label>
        </div>
      </div>
    </Card>
  );
};
