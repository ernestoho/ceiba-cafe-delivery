import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingCart, Menu } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { openCart, getTotalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 glass-card backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">🌳</span>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-bold tropical-gradient bg-clip-text text-transparent">
                  Ceiba Cafe
                </div>
                <div className="text-sm font-medium text-orange-600">
                  Pizzeria
                </div>
              </div>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center text-sm text-muted-foreground glass-card px-3 py-1 rounded-full">
            <MapPin className="mr-1 h-4 w-4" />
            <span>Perla Marina, Cabarete</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={openCart} className="relative glass-card">
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs tropical-gradient">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
