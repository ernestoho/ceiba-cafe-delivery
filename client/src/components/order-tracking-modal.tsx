import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Check, Phone, MapPin, Package, Bike, Clock } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

interface OrderTrackingModalProps {
  order: OrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderTrackingModal({ order, isOpen, onClose }: OrderTrackingModalProps) {
  if (!isOpen || !order) return null;

  const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return <Check className="h-4 w-4 text-green-600" />;
    if (isActive) return <Clock className="h-4 w-4 text-primary animate-pulse" />;
    return <div className="h-3 w-3 bg-gray-300 rounded-full" />;
  };

  const getStatusColor = (status: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return "bg-green-600";
    if (isActive) return "bg-primary animate-pulse";
    return "bg-gray-300";
  };

  const trackingSteps = [
    { id: "confirmed", label: "Order Confirmed", time: "2:30 PM", icon: Check },
    { id: "preparing", label: "Preparing", time: "2:45 PM", icon: Package },
    { id: "out_for_delivery", label: "Out for Delivery", time: "3:10 PM", icon: Bike },
    { id: "delivered", label: "Delivered", time: "Estimated 3:25 PM", icon: Package },
  ];

  const currentStepIndex = trackingSteps.findIndex(step => step.id === order.status);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 bg-white rounded-2xl shadow-xl">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle className="text-xl">Order Tracking</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <img 
                src="https://images.unsplash.com/photo-1605600659908-0ef719419d41?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80" 
                alt="Delivery driver"
                className="w-20 h-20 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg text-foreground">
                {order.status === "delivered" ? "Delivered!" : "On the way!"}
              </h3>
              <p className="text-muted-foreground">{order.estimatedDeliveryTime}</p>
            </div>
            
            <div className="space-y-4">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isActive = index === currentStepIndex;
                const isLast = index === trackingSteps.length - 1;
                
                return (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(step.id, isActive, isCompleted)}`} />
                    <div className="flex-1">
                      <p className={`font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.time}</p>
                    </div>
                    {getStatusIcon(step.id, isActive, isCompleted)}
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-3 pt-4">
              <Button className="w-full" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call Driver
              </Button>
              <Button className="w-full" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
