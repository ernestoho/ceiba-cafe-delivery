import { Button } from "@/components/ui/button";
import { Home, UtensilsCrossed, ShoppingCart, Phone } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { path: "/order", icon: ShoppingCart, label: "Order" },
    { path: "/contact", icon: Phone, label: "Contact" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card backdrop-blur-md border-t border-white/20 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant="ghost"
                className={`flex flex-col items-center h-auto py-2 px-4 rounded-2xl transition-all ${
                  isActive 
                    ? "text-white tropical-gradient shadow-lg" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
