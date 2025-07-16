import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BarChart3, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for admin authentication status in localStorage on component mount
    const storedAdminAuth = localStorage.getItem("adminAuthenticated");
    if (storedAdminAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo admin credentials
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true"); // Store authentication status
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard!"
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid admin credentials. Please try again.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleGoBack = () => {
    setLocation("/carts");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setCredentials({ username: "", password: "" });
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin dashboard."
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
            <CardDescription>Internal Access Only</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" onClick={handleGoBack} className="text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to POS System
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Demo credentials: Username: <code className="bg-muted px-2 py-1 rounded">admin</code> | Password: <code className="bg-muted px-2 py-1 rounded">admin123</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      {/* Navigation Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={handleGoBack} className="text-white hover:bg-white/20 mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Shield className="h-6 w-6 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-white border-white/20 hover:bg-white/20">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Welcome to Admin Dashboard</h2>
          <p className="text-xl text-white/80">Manage your POS system with advanced tools</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Analytics Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setLocation("/admin/analytics")}>
            <CardHeader className="text-center">
              <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-10 w-10 text-blue-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Analytics</CardTitle>
              <CardDescription className="text-white/70">
                View sales analytics, transaction summaries, and performance charts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Product Management Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors cursor-pointer" onClick={() => setLocation("/admin/products")}>
            <CardHeader className="text-center">
              <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-green-300" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Product Management</CardTitle>
              <CardDescription className="text-white/70">
                Manage products, inventory, pricing, and add new items
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Manage Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}