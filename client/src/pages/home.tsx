import Header from "@/components/header";
import CartModal from "@/components/cart-modal";
import FloatingCartButton from "@/components/floating-cart-button";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Header />
      
      <main className="pb-24">
        {/* Hero Section with Video Background */}
        <section 
          className="relative h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="/uploads/hero-video-optimized.mp4"
            onError={(e) => {
              console.log('Video failed to load, using fallback background');
              e.currentTarget.style.display = 'none';
            }}
            onLoadStart={() => {
              console.log('Video loading started');
            }}
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="relative text-center text-white z-20 max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Authentic Italian Pizza
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Experience the perfect fusion of authentic Italian cuisine with island flavors 
              in the heart of Perla Marina, Cabarete
            </p>
            <div className="flex justify-center">
              <Link href="/menu">
                <Button size="lg" className="tropical-gradient text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
                  Order Now 🍕
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Welcome to Ceiba Cafe Pizzeria
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Where traditional Italian recipes meet the vibrant spirit of the Caribbean. 
                Located in the beautiful Perla Marina of Cabarete, we bring you authentic 
                wood-fired pizzas, fresh pasta, and tropical cocktails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="relative text-center glass-card p-8 rounded-3xl overflow-hidden group hover:scale-105 transition-transform">
                <div 
                  className="absolute inset-0 opacity-20 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                  }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🍕</div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Authentic Pizza</h3>
                  <p className="text-muted-foreground">
                    Wood-fired pizzas made with imported Italian ingredients and fresh local toppings
                  </p>
                </div>
              </div>
              
              <div className="relative text-center glass-card p-8 rounded-3xl overflow-hidden group hover:scale-105 transition-transform">
                <div 
                  className="absolute inset-0 opacity-20 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                  }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🌴</div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Island Fusion</h3>
                  <p className="text-muted-foreground">
                    Unique Caribbean twists on classic Italian dishes with tropical ingredients
                  </p>
                </div>
              </div>
              
              <div className="relative text-center glass-card p-8 rounded-3xl overflow-hidden group hover:scale-105 transition-transform">
                <div 
                  className="absolute inset-0 opacity-20 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600')"
                  }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-4">🚚</div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Free Delivery</h3>
                  <p className="text-muted-foreground">
                    Fresh, hot delivery throughout Cabarete and surrounding areas
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/menu">
                <Button size="lg" className="tropical-gradient text-white px-8 py-4 text-lg rounded-full mr-4">
                  View Menu
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="glass-card px-8 py-4 text-lg rounded-full">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Hours & Location */}
        <section 
          className="relative py-20 px-6 mx-6 rounded-3xl overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-4xl mx-auto text-center text-white z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Visit Us Today
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">Opening Hours</h3>
                <div className="space-y-3 text-lg">
                  <div className="flex justify-between">
                    <span>Monday - Thursday</span>
                    <span>11:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friday - Saturday</span>
                    <span>11:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12:00 PM - 9:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-6">Location</h3>
                <div className="text-lg space-y-3">
                  <p>Perla Marina</p>
                  <p>Cabarete, Dominican Republic</p>
                  <p className="pt-4">
                    <a 
                      href="https://wa.me/18298688808" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-gradient text-white px-6 py-3 rounded-full inline-flex items-center gap-2 font-semibold hover:shadow-lg transition-all"
                    >
                      📱 WhatsApp Us
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CartModal />
      <FloatingCartButton />
      <BottomNavigation />
    </div>
  );
}
