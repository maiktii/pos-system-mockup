
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Filter, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { CartWithDetails } from "@shared/schema";

// Dummy data
const dailySales = [
  { day: "Mon", sales: 4500, transactions: 45 },
  { day: "Tue", sales: 5200, transactions: 52 },
  { day: "Wed", sales: 4800, transactions: 48 },
  { day: "Thu", sales: 6100, transactions: 61 },
  { day: "Fri", sales: 7500, transactions: 75 },
  { day: "Sat", sales: 8200, transactions: 82 },
  { day: "Sun", sales: 6800, transactions: 68 }
];

const categoryData = [
  { name: "Drinks", value: 35, color: "#3B82F6" },
  { name: "Snacks", value: 25, color: "#10B981" },
  { name: "Canned Foods", value: 20, color: "#F59E0B" },
  { name: "Fresh Foods", value: 15, color: "#EF4444" },
  { name: "Dairy", value: 5, color: "#8B5CF6" }
];

const monthlyTrend = [
  { month: "Jan", revenue: 125000 },
  { month: "Feb", revenue: 138000 },
  { month: "Mar", revenue: 145000 },
  { month: "Apr", revenue: 152000 },
  { month: "May", revenue: 148000 },
  { month: "Jun", revenue: 165000 }
];

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch transactions data
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<CartWithDetails[]>({
    queryKey: ["/api/all-transactions"],
    queryFn: async () => {
      const response = await fetch("/api/all-transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    }
  });

  const handleGoBack = () => {
    setLocation("/admin");
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

  // Filter transactions by date range
  const filteredTransactions = transactions?.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null; // Include the entire day
    
    if (fromDate && transactionDate < fromDate) return false;
    if (toDate && transactionDate > toDate) return false;
    return true;
  });

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
              <TrendingUp className="h-6 w-6 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">Analytics Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-white/20 text-white">
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$165,234</div>
              <p className="text-xs text-green-400">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Transactions</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,563</div>
              <p className="text-xs text-blue-400">+8.2% from last week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Average Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$45.67</div>
              <p className="text-xs text-purple-400">+3.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Customers</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">892</div>
              <p className="text-xs text-orange-400">+15.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Sales Chart */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Daily Sales</CardTitle>
              <CardDescription className="text-white/70">Sales performance for this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Sales by Category</CardTitle>
              <CardDescription className="text-white/70">Product category breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Revenue Trend */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly Revenue Trend</CardTitle>
            <CardDescription className="text-white/70">Revenue growth over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }} 
                />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Date Filter Controls */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filter Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Date From:</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/70">Date To:</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="border-white/20 text-white hover:bg-white/20"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">All Transactions</CardTitle>
                <CardDescription className="text-white/70">
                  {filteredTransactions?.length || 0} transactions found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-white/5 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/3 mb-4"></div>
                          </div>
                          <div className="h-6 bg-white/10 rounded w-20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="h-3 bg-white/10 rounded"></div>
                          <div className="h-3 bg-white/10 rounded"></div>
                          <div className="h-3 bg-white/10 rounded"></div>
                          <div className="h-3 bg-white/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredTransactions?.map((transaction) => (
                      <div key={transaction.id} className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-white">{transaction.customer.name}</h3>
                              <Badge variant={getStatusVariant(transaction.status)}>
                                {getStatusLabel(transaction.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-white/70">{transaction.customer.phoneNumber}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction.id)}
                            className="border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-white/70">Items:</span>
                            <span className="ml-2 font-medium text-white">{transaction.itemCount}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Total:</span>
                            <span className="ml-2 font-medium text-green-400">${transaction.total}</span>
                          </div>
                          <div>
                            <span className="text-white/70">Date:</span>
                            <span className="ml-2 font-medium text-white">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/70">Time:</span>
                            <span className="ml-2 font-medium text-white">
                              {new Date(transaction.createdAt).toLocaleTimeString([], { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoadingTransactions && filteredTransactions?.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                    <p className="text-white/70">Try adjusting your date filters or check back later</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
