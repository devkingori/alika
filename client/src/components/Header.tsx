import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface HeaderProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Header({ onLogin, onLogout }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: "DISCOVER", href: "#" },
    { label: "BROWSE CATEGORIES", href: "#categories" },
    { label: "CREATE DP BANNER", href: "#" },
    { label: "MY DP BANNERS", href: "#" },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold primary-blue">GetDP</div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith("#")) {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }
                }}
                className="text-gray-700 hover:text-[hsl(207,90%,54%)] transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          {/* Auth Button & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button 
                onClick={onLogout}
                className="bg-success-green hover:bg-green-600 text-white px-6 py-2 font-medium"
              >
                LOGOUT
              </Button>
            ) : (
              <Button 
                onClick={onLogin}
                className="bg-success-green hover:bg-green-600 text-white px-6 py-2 font-medium"
              >
                LOGIN
              </Button>
            )}
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.startsWith("#")) {
                          e.preventDefault();
                          handleNavClick(item.href);
                        }
                      }}
                      className="text-gray-700 hover:text-[hsl(207,90%,54%)] transition-colors duration-200 font-medium py-2"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
