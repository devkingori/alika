import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const { data: trendingCampaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/trending"],
  });

  const { data: latestCampaigns = [] } = useQuery({
    queryKey: ["/api/campaigns/latest"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onLogin={handleLogin} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[hsl(207,90%,54%)] to-blue-700 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Get people connected to your brand
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light max-w-3xl mx-auto">
            Promoting your event or organization has never been easier
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-blue text-white hover:bg-blue-600 px-8 py-4 text-lg"
              onClick={() => window.location.href = "#categories"}
            >
              Browse Categories
            </Button>
            <Button 
              size="lg" 
              className="bg-primary-orange text-white hover:bg-orange-600 px-8 py-4 text-lg"
              onClick={handleLogin}
            >
              Create Banner
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Banners Section */}
      <section className="py-16 neutral-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Trending Banners</h2>
            <a href="#" className="primary-blue hover:text-blue-700 font-medium flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trendingCampaigns.map((campaign: any) => (
              <CampaignCard 
                key={campaign.id}
                campaign={campaign}
                variant="trending"
                onClick={() => handleLogin()}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Banners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Banners</h2>
            <a href="#" className="primary-blue hover:text-blue-700 font-medium flex items-center">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestCampaigns.slice(0, 5).map((campaign: any) => (
              <CampaignCard 
                key={campaign.id}
                campaign={campaign}
                variant="default"
                onClick={() => handleLogin()}
              />
            ))}
            
            {/* Promotional Banner */}
            <div className="bg-gradient-to-br from-[hsl(207,90%,54%)] to-blue-700 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden text-white">
              <div className="p-6 text-center">
                <div className="text-4xl mb-4 text-blue-200">+</div>
                <h3 className="text-lg font-bold mb-2">Create Your Banner</h3>
                <p className="text-blue-100 text-sm mb-4">Join thousands creating amazing promotional content</p>
                <Button 
                  className="bg-white text-primary-blue hover:bg-gray-100 text-sm font-semibold"
                  onClick={handleLogin}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section id="categories" className="py-16 neutral-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Browse by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category: any) => (
              <CategoryCard 
                key={category.id}
                category={category}
                onClick={() => handleLogin()}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
