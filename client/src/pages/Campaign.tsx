import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhotoUpload from "@/components/PhotoUpload";
import BannerPreview from "@/components/BannerPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Eye, Users, Calendar, Download } from "lucide-react";

export default function Campaign() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: [`/api/campaigns/${id}`],
    enabled: !!id,
  });

  // Increment view count on page load
  useEffect(() => {
    if (id) {
      apiRequest("POST", `/api/campaigns/${id}/view`).catch(console.error);
    }
  }, [id]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/campaigns/${id}/generate`, {
        userName,
        userPhotoUrl: userPhoto,
        isPublic,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Banner Generated Successfully!",
        description: "Your personalized banner is ready for download.",
      });
      
      // Download the generated banner
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = `${campaign?.title || "banner"}-${userName}.png`;
      link.click();
      
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate banner. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleGenerate = () => {
    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to generate the banner.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-24 w-full mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white">
        <Header onLogout={handleLogout} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
            <p className="text-gray-600 mb-8">The campaign you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")}>
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Badge className="mb-4 bg-primary-blue text-white">
                  Technology
                </Badge>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h1>
                
                {/* Creator Info */}
                <div className="flex items-center space-x-3 mb-6">
                  <Avatar>
                    <AvatarImage src={campaign.creatorAvatar} />
                    <AvatarFallback>
                      {campaign.creatorName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">
                      {campaign.creatorName}
                    </div>
                    <div className="text-sm text-gray-500">Creator</div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>{campaign.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Download className="h-4 w-4" />
                    <span>{campaign.downloadCount || 0} downloads</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>2.4k users</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {campaign.description}
                  </p>
                </div>
                
                {/* Social Sharing */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Share</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm">
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Main Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Banner Preview */}
                <div className="mb-6">
                  <BannerPreview
                    campaign={campaign}
                    userName={userName}
                    userPhoto={userPhoto}
                  />
                </div>
                
                {/* Photo Upload */}
                <div className="mb-6">
                  <PhotoUpload
                    onPhotoSelect={setUserPhoto}
                    selectedPhoto={userPhoto}
                  />
                </div>
                
                {/* Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your name
                  </label>
                  <Input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>
                
                {/* Generate Button */}
                <div className="mb-6">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !userName.trim()}
                    className="w-full bg-success-green hover:bg-green-600 text-white py-3 text-lg font-semibold"
                  >
                    {isGenerating ? "Generating..." : "Generate my DP"}
                  </Button>
                </div>
                
                {/* Public Display Checkbox */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="public"
                      checked={isPublic}
                      onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                    />
                    <label
                      htmlFor="public"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Display my name and campaign publicly
                    </label>
                  </div>
                </div>
                
                {/* Help Text */}
                <p className="text-xs text-gray-500">
                  Not sure how to create your personalized DP?{" "}
                  <a href="#" className="primary-blue hover:underline">
                    Learn more
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
