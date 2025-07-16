import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, LogOut, Package, History, User, Calendar, DollarSign, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoredEmployee, clearStoredEmployee } from "@/lib/auth";
import { CustomerModal } from "@/components/customer-modal";
import type { CartWithDetails } from "@shared/schema";

export default function CartList() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState(getStoredEmployee());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!employee) {
      setLocation("/login");
      return;
    }
  }, [employee, setLocation]);

  const { data: carts, isLoading, refetch } = useQuery<CartWithDetails[]>({
    queryKey: ["/api/carts"],
    queryFn: async () => {
      const response = await fetch(`/api/carts?employeeId=${employee?.id}`);
      if (!response.ok) throw new Error("Failed to fetch carts");
      return response.json();
    },
    enabled: !!employee,
    refetchInterval: 2000 // Refresh every 2 seconds
  });

  const handleLogout = () => {
    clearStoredEmployee();
    setEmployee(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  const handleCartCreated = () => {
    refetch();
    setIsModalOpen(false);
  };

  const handleViewCart = (cartId: number) => {
    setLocation(`/cart/${cartId}`);
  };

  const handleAddItems = (cartId: number) => {
    setLocation(`/products/${cartId}`);
  };

  if (!employee) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Shopping Carts</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Employee: <span className="font-medium">{employee.name}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Active Carts</h2>
            <p className="text-muted-foreground mt-1">Manage customer shopping carts</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setLocation("/all-products")}>
              <Package className="h-4 w-4 mr-2" />
              All Products
            </Button>
            <Button variant="outline" onClick={() => setLocation("/transactions")}>
              <History className="h-4 w-4 mr-2" />
              Transactions
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create New Cart
            </Button>
          </div>
        </div>

        {/* Cart Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-muted rounded flex-1"></div>
                    <div className="h-8 bg-muted rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carts?.map((cart) => (
              <Card key={cart.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{cart.customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{cart.customer.phoneNumber}</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">{cart.itemCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium text-primary">${cart.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-muted-foreground">
                        {new Date(cart.createdAt).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAddItems(cart.id)}
                    >
                      Add Items
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewCart(cart.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && carts?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No active carts</h3>
            <p className="text-muted-foreground mb-4">Create a new cart to get started</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Cart
            </Button>
          </div>
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCartCreated={handleCartCreated}
        employeeId={employee.id}
      />
    </div>
  );
}