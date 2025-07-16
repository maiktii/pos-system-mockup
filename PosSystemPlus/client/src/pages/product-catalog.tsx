import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, ArrowLeft, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStoredEmployee } from "@/lib/auth";
import { ProductCard } from "@/components/product-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductWithStock, CartWithDetails } from "@shared/schema";

interface ProductCatalogProps {
  params: { cartId: string };
}

const categories = [
  { id: "all", name: "All Products" },
  { id: "drinks", name: "Drinks" },
  { id: "snacks", name: "Snacks" },
  { id: "canned", name: "Canned Foods" },
  { id: "fresh", name: "Fresh Foods" },
  { id: "dairy", name: "Dairy" }
];

export default function ProductCatalog({ params }: ProductCatalogProps) {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const employee = getStoredEmployee();
  const { toast } = useToast();
  const cartId = parseInt(params.cartId);

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithStock[]>({
    queryKey: ["/api/products", selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/products?category=${selectedCategory}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  const { data: cart } = useQuery<CartWithDetails>({
    queryKey: ["/api/carts", cartId],
    queryFn: async () => {
      const response = await fetch(`/api/carts/${cartId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    refetchInterval: 1000 // Refresh every second for real-time updates
  });



  const handleGoBack = () => {
    setLocation("/carts");
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
              <Store className="h-5 w-5 text-primary mr-3" />
              <h1 className="text-xl font-semibold text-foreground">Product Catalog</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="cart-count" data-count={cart?.itemCount || 0}>
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Customer: <span className="font-medium">{cart?.customer.name}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="text-sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartId={cartId}
              />
            ))}
          </div>
        )}

        {!productsLoading && products?.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}
