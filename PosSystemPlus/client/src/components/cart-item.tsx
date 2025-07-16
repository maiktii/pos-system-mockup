import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItem as CartItemType, Product } from "@shared/schema";

interface CartItemProps {
  item: CartItemType & { product: Product };
  cartId: number;
  onUpdate: () => void;
}

export function CartItem({ item, cartId, onUpdate }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const { toast } = useToast();

  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const response = await apiRequest(
        "PUT",
        `/api/carts/${cartId}/items/${item.productId}`,
        { quantity: newQuantity }
      );
      return response.json();
    },
    onSuccess: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Quantity updated",
        description: "Item quantity has been updated"
      });
    },
    onError: () => {
      setQuantity(item.quantity); // Reset to original quantity
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "DELETE",
        `/api/carts/${cartId}/items/${item.productId}`
      );
      return response.json();
    },
    onSuccess: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/carts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from cart"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    updateQuantityMutation.mutate(newQuantity);
  };

  const handleRemoveItem = () => {
    removeItemMutation.mutate();
  };

  const itemTotal = parseFloat(item.price) * quantity;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={updateQuantityMutation.isPending}
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 0;
              setQuantity(newQuantity);
            }}
            onBlur={() => {
              if (quantity !== item.quantity) {
                updateQuantityMutation.mutate(quantity);
              }
            }}
            className="w-16 text-center"
            min="0"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={updateQuantityMutation.isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-right min-w-[80px]">
          <p className="font-semibold text-foreground">${itemTotal.toFixed(2)}</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveItem}
          disabled={removeItemMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
