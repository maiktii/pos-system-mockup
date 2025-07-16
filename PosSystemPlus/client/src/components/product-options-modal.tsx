import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductWithStock } from "@shared/schema";

interface ProductOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock;
  cartId: number;
}

export function ProductOptionsModal({ isOpen, onClose, product, cartId }: ProductOptionsModalProps) {
  const [retailQuantity, setRetailQuantity] = useState(1);
  const [cartonQuantity, setCartonQuantity] = useState(1);
  const { toast } = useToast();

  const retailPrice = parseFloat(product.price);
  const cartonPrice = parseFloat(product.cartonPrice);
  const pcsPerCarton = product.pcsPerCarton;

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity, isCarton }: { productId: number; quantity: number; isCarton: boolean }) => {
      const response = await apiRequest("POST", `/api/carts/${cartId}/items`, {
        productId,
        quantity,
        isCarton
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carts", cartId] });
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Item added",
        description: "Product added to cart successfully"
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive"
      });
    }
  });

  const handleAddRetail = () => {
    addToCartMutation.mutate({ 
      productId: product.id, 
      quantity: retailQuantity, 
      isCarton: false 
    });
  };

  const handleAddCarton = () => {
    addToCartMutation.mutate({ 
      productId: product.id, 
      quantity: cartonQuantity, 
      isCarton: true 
    });
  };

  const handleClose = () => {
    setRetailQuantity(1);
    setCartonQuantity(1);
    onClose();
  };

  const adjustQuantity = (type: 'retail' | 'carton', delta: number) => {
    if (type === 'retail') {
      setRetailQuantity(Math.max(1, retailQuantity + delta));
    } else {
      setCartonQuantity(Math.max(1, cartonQuantity + delta));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4">
            <img 
              src={product.imageUrl || "/placeholder.jpg"} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-bold text-primary">${product.price}</span>
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.stock} in stock
                </Badge>
              </div>
            </div>
          </div>

          {/* Retail Option */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-medium">Retail: 1 pcs ${retailPrice.toFixed(2)}</h4>
              </div>
              <Badge variant="outline">Per piece</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity('retail', -1)}
                  disabled={retailQuantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{retailQuantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity('retail', 1)}
                  disabled={retailQuantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">of {product.stock} pcs</span>
              </div>
              
              <Button
                onClick={handleAddRetail}
                disabled={addToCartMutation.isPending || !product.inStock}
                className="ml-4"
              >
                Add ${(retailPrice * retailQuantity).toFixed(2)}
              </Button>
            </div>
          </div>

          {/* Carton Option */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="font-medium">Carton: {pcsPerCarton} pcs ${cartonPrice.toFixed(2)}</h4>
              </div>
              <Badge variant="outline">Per carton</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity('carton', -1)}
                  disabled={cartonQuantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{cartonQuantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity('carton', 1)}
                  disabled={cartonQuantity * pcsPerCarton >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">of {Math.floor(product.stock / pcsPerCarton)} cartons</span>
              </div>
              
              <Button
                onClick={handleAddCarton}
                disabled={addToCartMutation.isPending || !product.inStock || cartonQuantity * pcsPerCarton > product.stock}
                className="ml-4"
              >
                Add ${(cartonPrice * cartonQuantity).toFixed(2)}
              </Button>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}