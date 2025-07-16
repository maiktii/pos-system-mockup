import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCartCreated: () => void;
  employeeId: number;
}

export function CustomerModal({ isOpen, onClose, onCartCreated, employeeId }: CustomerModalProps) {
  const [, setLocation] = useLocation();
  const [customer, setCustomer] = useState({
    name: "",
    phoneNumber: "",
    isWholesale: false
  });
  const { toast } = useToast();

  const createCartMutation = useMutation({
    mutationFn: async (data: { customer: typeof customer; employeeId: number }) => {
      const response = await apiRequest("POST", "/api/carts", data);
      return response.json();
    },
    onSuccess: (newCart) => {
      toast({
        title: "Cart created",
        description: `New cart created for ${customer.name}`
      });
      onCartCreated();
      setLocation(`/products/${newCart.id}`);
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create cart. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCartMutation.mutate({ customer, employeeId });
  };

  const handleClose = () => {
    setCustomer({ name: "", phoneNumber: "", isWholesale: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Customer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter customer name"
              value={customer.name}
              onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={customer.phoneNumber}
              onChange={(e) => setCustomer(prev => ({ ...prev, phoneNumber: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wholesale"
              checked={customer.isWholesale}
              onCheckedChange={(checked) => setCustomer(prev => ({ ...prev, isWholesale: checked as boolean }))}
            />
            <Label htmlFor="wholesale" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Wholesale?
            </Label>
          </div>
          
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createCartMutation.isPending}>
              {createCartMutation.isPending ? "Creating..." : "Create Cart"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
