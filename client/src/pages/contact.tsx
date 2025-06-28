import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, MapPin, Phone, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen relative">
      <Header />
      {/* Hero Section */}
      <section 
        className="relative h-64 md:h-80 flex items-center justify-center parallax-bg"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800')"
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl">
            Get in touch with Ceiba Cafe Pizzeria
          </p>
        </div>
      </section>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        
        {/* WhatsApp CTA */}
        <div className="text-center mb-16">
          <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto">
            <div className="text-5xl mb-6">📱</div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Order Now via WhatsApp
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              The fastest way to place your order and get instant confirmation
            </p>
            <a 
              href="https://wa.me/18091234567?text=Hi! I'd like to place an order at Ceiba Cafe Pizzeria 🍕"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="whatsapp-gradient text-white px-8 py-4 text-lg rounded-full hover:shadow-xl transition-all">
                <MessageCircle className="mr-2 h-6 w-6" />
                Chat with Us on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="mr-3 h-6 w-6 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Ceiba Cafe Pizzeria</h3>
                  <p className="text-muted-foreground">Perla Marina</p>
                  <p className="text-muted-foreground">Cabarete, Dominican Republic</p>
                </div>
                <div className="pt-4">
                  <a 
                    href="https://goo.gl/maps/example"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-primary" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday</span>
                    <span>11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Friday - Saturday</span>
                    <span>11:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>12:00 PM - 9:00 PM</span>
                  </div>
                  <div className="pt-4 text-sm text-muted-foreground">
                    Kitchen closes 30 minutes before closing time
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Phone className="mr-3 h-6 w-6 text-primary" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Phone</p>
                  <a href="tel:+18091234567" className="text-primary hover:underline">+1 (829) 868-8808</a>
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <a 
                    href="https://wa.me/18091234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >+1 (829) 868-8808</a>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:info@ceibacafepizzeria.com" className="text-primary hover:underline">
                    info@ceibacafepizzeria.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Social Media */}
          <div className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl">Find Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3756.123!2d-70.417!3d19.743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDQ0JzM0LjciTiA3MMKwMjUnMDEuMiJX!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ceiba Cafe Pizzeria Location"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <a 
                    href="https://instagram.com/ceibacafepizzeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a 
                    href="https://facebook.com/ceibacafepizzeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:shadow-lg transition-all"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                  
                </div>
                <div className="mt-6 text-sm text-muted-foreground">
                  <p>Follow us for daily specials, behind-the-scenes content, and the latest updates from our kitchen!</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl">About Our Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Free Delivery</h4>
                    <p className="text-sm text-muted-foreground">Throughout Cabarete and surrounding areas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">Fresh Ingredients</h4>
                    <p className="text-sm text-muted-foreground">Locally sourced and imported Italian specialties</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold">30-45 min Delivery</h4>
                    <p className="text-sm text-muted-foreground">Hot and fresh to your door</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}