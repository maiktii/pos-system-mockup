import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { ProductOptionsModal } from "@/components/product-options-modal";
import type { ProductWithStock } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithStock;
  cartId: number;
  isLoading?: boolean;
}

export function ProductCard({ product, cartId, isLoading }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
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
          <h3 className="font-semibold text-foreground mb-2">{product.name}</h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-primary">${product.price}</span>
            <div className="text-right text-sm">
              <div className="text-muted-foreground">Stock</div>
              <div className={`font-medium ${product.inStock ? 'text-secondary' : 'text-destructive'}`}>
                {product.stock}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            disabled={!product.inStock || isLoading}
            className="w-full"
            variant="secondary"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Product Options
          </Button>
        </CardContent>
      </Card>

      <ProductOptionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        cartId={cartId}
      />
    </>
  );
}
