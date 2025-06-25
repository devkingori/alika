import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [, setLocation] = useLocation();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: [`/api/campaigns/category/${categoryId}`],
    enabled: !!categoryId,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const currentCategory = categories.find((cat: any) => cat.id === categoryId);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleCampaignClick = (campaignId: string) => {
    setLocation(`/campaign/${campaignId}`);
  };

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onLogout={handleLogout} />
      
      {/* Category Hero */}
      <section className="py-16 neutral-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            
            {currentCategory ? (
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-primary-blue rounded-full flex items-center justify-center">
                  <i className={`${currentCategory.iconClass} text-3xl text-white`}></i>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {currentCategory.name}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {currentCategory.description}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Skeleton className="w-24 h-24 mx-auto mb-6 rounded-full" />
                <Skeleton className="h-10 w-64 mx-auto mb-4" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {currentCategory?.name} Campaigns
            </h2>
            <div className="text-sm text-gray-500">
              {campaigns.length} campaigns found
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <Skeleton className="w-full h-40" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-600 mb-8">
                There are no campaigns in this category yet. Be the first to create one!
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-primary-blue hover:bg-blue-600 text-white"
              >
                Browse Other Categories
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant="default"
                  onClick={handleCampaignClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
