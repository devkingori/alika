import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus } from "lucide-react";

interface PhotoUploadProps {
  onPhotoSelect: (photoUrl: string | null) => void;
  selectedPhoto: string | null;
}

export default function PhotoUpload({ onPhotoSelect, selectedPhoto }: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      onPhotoSelect(data.url);
      toast({
        title: "Photo uploaded successfully!",
        description: "Your photo has been uploaded and is ready to use.",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoSelect(null);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Your photo
      </label>
      
      {selectedPhoto ? (
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            <img
              src={selectedPhoto}
              alt="Selected photo"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
            onClick={handleRemovePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`w-32 h-32 rounded-full border-4 border-dashed cursor-pointer transition-colors duration-200 flex items-center justify-center ${
            isDragOver
              ? "border-primary-blue bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploadMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!uploadMutation.isPending ? handleClick : undefined}
        >
          {uploadMutation.isPending ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          ) : (
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Add Photo</div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedPhoto && (
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={uploadMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Browse Files</span>
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Drag and drop or click to upload. JPEG, PNG, or WebP. Max 5MB.
          </p>
        </div>
      )}
    </div>
  );
}
