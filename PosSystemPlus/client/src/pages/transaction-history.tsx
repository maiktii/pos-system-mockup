import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ArrowLeft, Eye } from "lucide-react";
import { getStoredEmployee } from "@/lib/auth";
import type { CartWithDetails } from "@shared/schema";

export default function TransactionHistory() {
  const [, setLocation] = useLocation();
  const employee = getStoredEmployee();

  const { data: transactions, isLoading } = useQuery<CartWithDetails[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?employeeId=${employee?.id}`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
    enabled: !!employee
  });

  const handleGoBack = () => {
    setLocation("/carts");
  };

  const handleViewTransaction = (transactionId: number) => {
    setLocation(`/transaction/${transactionId}`);
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
              <History className="h-5 w-5 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Transaction History</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Employee: <span className="font-medium">{employee.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transactions List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/3 mb-4"></div>
                    </div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground">{transaction.customer.name}</h3>
                        <Badge variant={getStatusVariant(transaction.status)}>
                          {getStatusLabel(transaction.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{transaction.customer.phoneNumber}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTransaction(transaction.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <span className="ml-2 font-medium">{transaction.itemCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="ml-2 font-medium text-primary">${transaction.total}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2 font-medium">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-2 font-medium">
                        {new Date(transaction.createdAt).toLocaleTimeString([], { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && transactions?.length === 0 && (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No transactions found</h3>
            <p className="text-muted-foreground">Completed and cancelled transactions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}