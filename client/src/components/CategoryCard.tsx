interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    iconClass: string;
    bannerCount: number;
  };
  onClick: (categoryId: string) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const getCategoryColor = () => {
    const colorMap: Record<string, string> = {
      Business: "bg-primary-blue",
      Technology: "bg-indigo-500",
      Music: "bg-primary-orange",
      Food: "bg-red-500",
      Sports: "bg-success-green",
      Education: "bg-purple-500",
      Art: "bg-pink-500",
    };
    return colorMap[category.name] || "bg-gray-500";
  };

  const handleClick = () => {
    onClick(category.id);
  };

  return (
    <div 
      className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
      onClick={handleClick}
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 text-center">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 ${getCategoryColor()} rounded-full flex items-center justify-center`}>
          <i className={`${category.iconClass} text-2xl text-white`}></i>
        </div>
        
        {/* Category Name */}
        <h3 className="font-semibold text-gray-900 mb-1">
          {category.name}
        </h3>
        
        {/* Banner Count */}
        <p className="text-sm text-gray-500">
          {category.bannerCount} banners
        </p>
      </div>
    </div>
  );
}
