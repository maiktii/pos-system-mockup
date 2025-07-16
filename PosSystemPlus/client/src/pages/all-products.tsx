import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, ArrowLeft } from "lucide-react";
import { getStoredEmployee } from "@/lib/auth";
import type { ProductWithStock } from "@shared/schema";

const categories = [
  { id: "all", name: "All Products" },
  { id: "drinks", name: "Drinks" },
  { id: "snacks", name: "Snacks" },
  { id: "canned", name: "Canned Foods" },
  { id: "fresh", name: "Fresh Foods" },
  { id: "dairy", name: "Dairy" }
];

export default function AllProducts() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const employee = getStoredEmployee();

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithStock[]>({
    queryKey: ["/api/products", selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/products?category=${selectedCategory}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
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
              <h1 className="text-xl font-semibold text-foreground">All Products</h1>
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
              <Card key={i} className="animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={product.imageUrl || "/placeholder.jpg"} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Stock</div>
                      <div className={`font-medium ${product.inStock ? 'text-secondary' : 'text-destructive'}`}>
                        {product.stock}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
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