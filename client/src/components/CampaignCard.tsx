import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Calendar } from "lucide-react";

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    categoryId?: string;
    templateUrl: string;
    creatorName: string;
    creatorAvatar: string;
    viewCount: number;
    isTrending?: boolean;
    createdAt: string;
  };
  variant?: "default" | "trending" | "category";
  onClick: (campaignId: string) => void;
}

export default function CampaignCard({ campaign, variant = "default", onClick }: CampaignCardProps) {
  const getCategoryColor = () => {
    // Simple category color mapping
    const colors = ["bg-primary-blue", "bg-primary-orange", "bg-success-green", "bg-purple-500", "bg-red-500", "bg-yellow-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleClick = () => {
    onClick(campaign.id);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] overflow-hidden"
      onClick={handleClick}
    >
      {/* Campaign Image */}
      <div className="relative">
        <img
          src={campaign.templateUrl || "/api/placeholder/400/200?text=Campaign"}
          alt={campaign.title}
          className="w-full h-48 object-cover"
        />
        {campaign.isTrending && (
          <Badge className="absolute top-3 left-3 bg-primary-orange text-white">
            Trending
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        {/* Category Badge */}
        <Badge className={`mb-3 text-white ${getCategoryColor()}`}>
          Technology
        </Badge>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {variant === "trending" ? (
            <div className="flex items-center space-x-2">
              {/* User Avatars */}
              <div className="flex -space-x-2">
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarImage src="/api/placeholder/24/24?text=U1" />
                  <AvatarFallback className="text-xs">U1</AvatarFallback>
                </Avatar>
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarImage src="/api/placeholder/24/24?text=U2" />
                  <AvatarFallback className="text-xs">U2</AvatarFallback>
                </Avatar>
                <Avatar className="w-6 h-6 border-2 border-white">
                  <AvatarImage src="/api/placeholder/24/24?text=U3" />
                  <AvatarFallback className="text-xs">U3</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Eye className="h-3 w-3" />
                <span>{formatViewCount(campaign.viewCount)} views</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="h-3 w-3" />
              <span>{formatViewCount(campaign.viewCount)} views</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(campaign.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
