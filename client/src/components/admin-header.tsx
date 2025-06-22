import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Settings, LogOut } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Ceiba Admin</h1>
                  <p className="text-xs text-gray-600">Menu Management</p>
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}