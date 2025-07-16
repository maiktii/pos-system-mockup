import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Trash2, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoredEmployee } from "@/lib/auth";
import { CartItem } from "@/components/cart-item";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartWithDetails } from "@shared/schema";

interface CartDetailProps {
  params: { id: string };
}

export default function CartDetail({ params }: CartDetailProps) {
  const [, setLocation] = useLocation();
  const employee = getStoredEmployee();
  const { toast } = useToast();
  const cartId = parseInt(params.id);

  const { data: cart, isLoading } = useQuery<CartWithDetails>({
    queryKey: ["/api/carts", cartId],
    queryFn: async () => {
      const response = await fetch(`/api/carts/${cartId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    }
  });

  const confirmCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/carts/${cartId}/confirm`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Order confirmed",
        description: `Order ${data.order.orderNumber} has been confirmed`
      });
      setLocation(`/payment/${data.order.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm order",
        variant: "destructive"
      });
    }
  });

  const rejectCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/carts/${cartId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Cart rejected",
        description: "Cart has been rejected and stock restored"
      });
      setLocation("/carts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject cart",
        variant: "destructive"
      });
    }
  });

  const handleGoBack = () => {
    setLocation("/carts");
  };

  const handleAddMoreItems = () => {
    setLocation(`/products/${cartId}`);
  };

  const handleConfirmCart = () => {
    if (cart?.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to the cart before confirming",
        variant: "destructive"
      });
      return;
    }
    confirmCartMutation.mutate();
  };

  const handleRejectCart = () => {
    rejectCartMutation.mutate();
  };

  if (!employee) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Cart not found</h1>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(cart.total);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-neutral">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="mr-3">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <ShoppingCart className="h-5 w-5 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Cart Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Customer: <span className="font-medium">{cart.customer.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customer Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground">
                  Name: <span className="font-medium text-foreground">{cart.customer.name}</span>
                </p>
                <p className="text-muted-foreground">
                  Phone: <span className="font-medium text-foreground">{cart.customer.phoneNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  Created: <span className="font-medium text-foreground">
                    {new Date(cart.createdAt).toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-primary">{cart.itemCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items in Cart</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items in cart</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    cartId={cartId}
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["/api/carts", cartId] })}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8.25%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            variant="destructive" 
            onClick={handleRejectCart}
            disabled={rejectCartMutation.isPending}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {rejectCartMutation.isPending ? "Rejecting..." : "Reject Cart"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleAddMoreItems}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add More Items
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleConfirmCart}
            disabled={confirmCartMutation.isPending || cart.items.length === 0}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            {confirmCartMutation.isPending ? "Confirming..." : "Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
