import { useState } from "react";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Order() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  const { 
    state, 
    updateQuantity, 
    removeItem, 
    getSubtotal, 
    getTax, 
    getTotal,
    clearCart
  } = useCart();
  
  const { toast } = useToast();

  const generateWhatsAppMessage = () => {
    const orderSummary = state.items.map(item => 
      `${item.quantity}x ${item.menuItem.name} - $${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}`
    ).join('\n');

    const message = `🍕 *Ceiba Cafe Pizzeria - New Order*

👤 *Customer Details:*
Name: ${customerName}
Phone: ${customerPhone}
${deliveryAddress ? `Address: ${deliveryAddress}` : 'Pickup Order'}

🛒 *Order Summary:*
${orderSummary}

💰 *Total Breakdown:*
Subtotal: $${getSubtotal().toFixed(2)}
Tax: $${getTax().toFixed(2)}
${deliveryAddress ? 'Delivery: Free' : ''}
*Total: $${getTotal().toFixed(2)}*

${specialInstructions ? `📝 *Special Instructions:*\n${specialInstructions}` : ''}

Thank you for choosing Ceiba Cafe Pizzeria! 🌴`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    if (!customerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!customerPhone.trim()) {
      toast({
        title: "Phone required", 
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart first",
        variant: "destructive"
      });
      return;
    }

    const whatsappUrl = `https://wa.me/18091234567?text=${generateWhatsAppMessage()}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Order sent via WhatsApp!",
      description: "We'll confirm your order shortly",
    });
    
    clearCart();
  };

  return (
    <div className="min-h-screen relative">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Order
          </h1>
          <p className="text-xl text-muted-foreground">
            Review your items and complete your order via WhatsApp
          </p>
        </div>

        {state.items.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Your cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Add some delicious items from our menu to get started!
              </p>
              <Link href="/menu">
                <Button className="tropical-gradient text-white px-8 py-3 rounded-full">
                  Browse Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center space-x-4 p-4 glass-card rounded-2xl">
                      <img 
                        src={item.menuItem.image} 
                        alt={item.menuItem.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.menuItem.name}</h3>
                        <p className="text-sm text-muted-foreground">${item.menuItem.price} each</p>
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
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.menuItem.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-lg font-bold tropical-gradient bg-clip-text text-transparent">
                        ${(parseFloat(item.menuItem.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your full name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+1 (809) 123-4567"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address (Optional)</Label>
                    <Input
                      id="address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter delivery address or leave blank for pickup"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Any special requests or dietary requirements..."
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="glass-card sticky top-24">
                <CardHeader>
                  <CardTitle className="text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>${getTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="tropical-gradient bg-clip-text text-transparent">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleWhatsAppOrder}
                    className="w-full whatsapp-gradient text-white py-4 text-lg font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Order via WhatsApp
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    You'll be redirected to WhatsApp to complete your order
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}