import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Printer, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoredEmployee } from "@/lib/auth";
import type { Order, CartWithDetails } from "@shared/schema";

interface PaymentConfirmationProps {
  params: { orderId: string };
}

export default function PaymentConfirmation({ params }: PaymentConfirmationProps) {
  const [, setLocation] = useLocation();
  const employee = getStoredEmployee();
  const { toast } = useToast();
  const orderId = parseInt(params.orderId);

  const { data: orderData, isLoading } = useQuery<{ order: Order; cart: CartWithDetails }>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Order not found");
      return response.json();
    },
    retry: false
  });

  const handlePrintReceipt = () => {
    toast({
      title: "Print Receipt",
      description: "Receipt printing functionality would be implemented here"
    });
  };

  const handleNewOrder = () => {
    setLocation("/carts");
  };

  const handleGoToDashboard = () => {
    setLocation("/carts");
  };

  if (!employee) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for demonstration since we don't have the actual order
  const mockOrder = {
    id: orderId,
    orderNumber: `POS-${Date.now()}-${orderId}`,
    total: "15.64",
    subtotal: "14.45",
    tax: "1.19",
    paymentMethod: "cash",
    createdAt: new Date().toISOString()
  };

  const mockCart = {
    customer: { name: "Demo Customer", phoneNumber: "+1 (555) 123-4567" },
    items: [
      { product: { name: "Coca Cola" }, quantity: 2, price: "1.99" },
      { product: { name: "Potato Chips" }, quantity: 1, price: "2.49" },
      { product: { name: "Red Apples" }, quantity: 2, price: "3.99" }
    ]
  };

  return (
    <div className="min-h-screen bg-neutral">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Payment Confirmed!</h1>
              <p className="text-muted-foreground">Your order has been successfully processed</p>
            </div>

            {/* Order Details */}
            <div className="bg-muted rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{mockOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{mockCart.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{mockCart.customer.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-foreground">Total Amount:</span>
                    <span className="text-lg font-bold text-primary">${mockOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-muted rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">$</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Cash Payment</p>
                  <p className="text-sm text-muted-foreground">Paid in full</p>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-muted rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Items Purchased</h2>
              <div className="space-y-2">
                {mockCart.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span className="font-medium">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button onClick={handlePrintReceipt} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button onClick={handleNewOrder} variant="secondary" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">Thank you for your business!</p>
              <Button variant="link" onClick={handleGoToDashboard} className="mt-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
