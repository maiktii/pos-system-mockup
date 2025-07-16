import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, ArrowLeft } from "lucide-react";
import { getStoredEmployee } from "@/lib/auth";
import type { CartWithDetails } from "@shared/schema";

interface TransactionDetailProps {
  params: { id: string };
}

export default function TransactionDetail({ params }: TransactionDetailProps) {
  const [, setLocation] = useLocation();
  const employee = getStoredEmployee();
  const transactionId = parseInt(params.id);

  const { data: transaction, isLoading } = useQuery<CartWithDetails>({
    queryKey: ["/api/transactions", transactionId],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${transactionId}`);
      if (!response.ok) throw new Error("Failed to fetch transaction");
      return response.json();
    }
  });

  const handleGoBack = () => {
    setLocation("/transactions");
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Success";
      case "rejected":
        return "Cancelled";
      default:
        return status;
    }
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

  if (!transaction) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Transaction not found</h1>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(transaction.total);
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
              <Receipt className="h-5 w-5 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Transaction Details</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Employee: <span className="font-medium">{employee.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Transaction Information</CardTitle>
              <Badge variant={getStatusVariant(transaction.status)}>
                {getStatusLabel(transaction.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Customer Name:</span>
                  <p className="font-medium">{transaction.customer.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone Number:</span>
                  <p className="font-medium">{transaction.customer.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <p className="font-medium">#{transaction.id}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <p className="font-medium">
                    {new Date(transaction.createdAt).toLocaleTimeString([], { 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Items:</span>
                  <p className="font-medium">{transaction.itemCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {transaction.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No items in this transaction</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transaction.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.product.imageUrl || "/placeholder.jpg"} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-foreground">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.price} each</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold text-foreground">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        {transaction.status === "confirmed" && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
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
        )}
      </div>
    </div>
  );
}