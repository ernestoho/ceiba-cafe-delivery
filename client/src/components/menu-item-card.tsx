import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import type { MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [selectedSize, setSelectedSize] = useState<'regular' | 'big'>('regular');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addItem } = useCart();

  const getPrice = () => {
    if (item.hasSizeOptions) {
      return selectedSize === 'regular' ? item.regularPrice : item.bigPrice;
    }
    return item.price;
  };

  const getPriceDisplay = () => {
    if (item.hasSizeOptions && item.regularPrice && item.bigPrice) {
      return `$${item.regularPrice} / $${item.bigPrice}`;
    }
    return `$${item.price}`;
  };

  const handleAddToCart = () => {
    addItem(item, item.hasSizeOptions ? selectedSize : undefined);
    setIsDialogOpen(false);
  };

  const handleQuickAdd = () => {
    if (item.hasSizeOptions) {
      setIsDialogOpen(true);
    } else {
      addItem(item);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20">
        <CardContent className="p-4">
          <div className="aspect-square mb-3 overflow-hidden rounded-lg">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                {item.name}
              </h3>
              {item.hasSizeOptions && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  Size Options
                </Badge>
              )}
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {item.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-600">
                {getPriceDisplay()}
              </span>

              <Button
                size="sm"
                onClick={handleQuickAdd}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/20">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Choose Size - {item.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {item.description}
            </p>

            <div className="space-y-3">
              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSize === 'regular' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSize('regular')}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Regular Size</span>
                  <span className="font-bold text-orange-600">${item.regularPrice}</span>
                </div>
              </div>

              <div 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedSize === 'big' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSize('big')}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Big Size</span>
                  <span className="font-bold text-orange-600">${item.bigPrice}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add to Cart - ${getPrice()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}