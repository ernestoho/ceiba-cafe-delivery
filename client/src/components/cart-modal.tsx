import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Minus, MessageCircle, MapPin } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState } from "react";

export default function CartModal() {
  const { 
    state, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getSubtotal, 
    getTax, 
    getTotal
  } = useCart();
  const { toast } = useToast();
  const [deliveryLocation, setDeliveryLocation] = useState("perla-marina");

  const getDeliveryFee = () => {
    switch (deliveryLocation) {
      case "perla-marina":
        return 0;
      case "cabarete":
        return 100;
      case "sosua":
        return 150;
      default:
        return 0;
    }
  };

  const getFinalTotal = () => {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    console.log('Subtotal:', subtotal, 'Delivery Fee:', deliveryFee);
    return subtotal + deliveryFee;
  };

  const handleQuickOrder = () => {
    if (state.items.length === 0) return;

    const orderSummary = state.items.map(item => 
      `${item.quantity}x ${item.menuItem.name} - RD$${((parseFloat(item.menuItem.price) / 100) * item.quantity).toFixed(2)}`
    ).join('\n');

    const deliveryFee = getDeliveryFee();
    const locationName = deliveryLocation === "perla-marina" ? "Perla Marina" : 
                        deliveryLocation === "cabarete" ? "Cabarete" : "Sosua";
    
    const message = `🍕 *Quick Order - Ceiba Cafe Pizzeria*

🛒 *Items:*
${orderSummary}

📍 *Delivery Location:* ${locationName}
💰 *Subtotal: RD$${getSubtotal().toFixed(2)}*
🚚 *Delivery Fee: ${deliveryFee === 0 ? 'FREE' : 'RD$' + deliveryFee.toFixed(2)}*
💰 *Total: RD$${getFinalTotal().toFixed(2)}*

I'd like to place this order for delivery to ${locationName}.`;

    const whatsappUrl = `https://wa.me/18091234567?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Redirecting to WhatsApp",
      description: "Complete your order details there",
    });
  };

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCart} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md glass-card shadow-2xl">
        <div className="flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/20">
            <CardTitle className="text-xl">Your Cart 🛒</CardTitle>
            <Button variant="ghost" size="icon" onClick={closeCart} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-4xl mb-4">🍕</div>
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add some delicious items to get started!
                </p>
                <Link href="/menu">
                  <Button className="tropical-gradient text-white mt-4 rounded-full">
                    Browse Menu
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.menuItem.id} className="flex items-center space-x-3 glass-card rounded-2xl p-4">
                    <img 
                      src={item.menuItem.image} 
                      alt={item.menuItem.name}
                      className="w-12 h-12 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{item.menuItem.name}</h3>
                      <p className="text-sm text-muted-foreground">RD${(parseFloat(item.menuItem.price) / 100).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {state.items.length > 0 && (
            <div className="border-t border-white/20 p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Delivery Location:</span>
                </div>
                <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                  <SelectTrigger className="glass-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perla-marina">Perla Marina (FREE)</SelectItem>
                    <SelectItem value="cabarete">Cabarete (RD$100)</SelectItem>
                    <SelectItem value="sosua">Sosua (RD$150)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>RD${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span className={getDeliveryFee() === 0 ? "text-green-600 font-semibold" : ""}>
                    {getDeliveryFee() === 0 ? "FREE" : `RD$${getDeliveryFee().toFixed(2)}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-foreground font-bold">
                    RD${getFinalTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full whatsapp-gradient text-white rounded-full py-3"
                  onClick={handleQuickOrder}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Quick Order via WhatsApp
                </Button>
                <Link href="/order">
                  <Button 
                    variant="outline"
                    className="w-full glass-card rounded-full py-3"
                    onClick={closeCart}
                  >
                    Complete Order Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
