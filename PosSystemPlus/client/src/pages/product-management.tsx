
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Package, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  cartonPrice: number;
  stock: number;
  pcsPerCarton: number;
  imageUrl?: string;
  inStock: boolean;
}

export default function ProductManagement() {
  const [, setLocation] = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "drinks",
    price: "",
    cartonPrice: "",
    stock: "",
    pcsPerCarton: "",
    imageUrl: "",
    unit: "piece"
  });
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "drinks", name: "Drinks" },
    { id: "snacks", name: "Snacks" },
    { id: "canned", name: "Canned Foods" },
    { id: "fresh", name: "Fresh Foods" },
    { id: "dairy", name: "Dairy" }
  ];

  const handleGoBack = () => {
    setLocation("/admin");
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate adding product
    toast({
      title: "Product added successfully",
      description: `${newProduct.name} has been added to the inventory.`
    });
    
    setIsAddModalOpen(false);
    setNewProduct({
      name: "",
      category: "drinks",
      price: "",
      cartonPrice: "",
      stock: "",
      pcsPerCarton: "",
      imageUrl: "",
      unit: "piece"
    });
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    // Simulate deletion
    toast({
      title: "Product deleted",
      description: `${productName} has been removed from inventory.`,
      variant: "destructive"
    });
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
              <Package className="h-6 w-6 text-white mr-3" />
              <h1 className="text-xl font-semibold text-white">Product Management</h1>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new product below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drinks">Drinks</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="canned">Canned Foods</SelectItem>
                        <SelectItem value="fresh">Fresh Foods</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Unit Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="piece"
                          checked={newProduct.unit.includes("piece")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("piece")) units.push("piece");
                            } else {
                              const index = units.indexOf("piece");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="piece">Piece</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="bottle"
                          checked={newProduct.unit.includes("bottle")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("bottle")) units.push("bottle");
                            } else {
                              const index = units.indexOf("bottle");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="bottle">Bottle/Carton</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="can"
                          checked={newProduct.unit.includes("can")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("can")) units.push("can");
                            } else {
                              const index = units.indexOf("can");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="can">Can/Pack</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="box"
                          checked={newProduct.unit.includes("box")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("box")) units.push("box");
                            } else {
                              const index = units.indexOf("box");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="box">Box/Bulk</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="bag"
                          checked={newProduct.unit.includes("bag")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("bag")) units.push("bag");
                            } else {
                              const index = units.indexOf("bag");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="bag">Bag/Sack</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="pack"
                          checked={newProduct.unit.includes("pack")}
                          onChange={(e) => {
                            const units = newProduct.unit.split(",").filter(u => u);
                            if (e.target.checked) {
                              if (!units.includes("pack")) units.push("pack");
                            } else {
                              const index = units.indexOf("pack");
                              if (index > -1) units.splice(index, 1);
                            }
                            setNewProduct(prev => ({ ...prev, unit: units.join(",") }));
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="pack">Pack/Bundle</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {newProduct.unit.split(",").filter(u => u).map((unitType, index) => (
                      <div key={unitType} className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium capitalize">{unitType} Pricing</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`price-${unitType}`}>
                              {unitType === "piece" ? "Price ($)" : 
                               unitType === "bottle" ? "Bottle Price ($)" :
                               unitType === "can" ? "Can Price ($)" :
                               unitType === "box" ? "Box Price ($)" :
                               unitType === "bag" ? "Bag Price ($)" : "Pack Price ($)"}
                            </Label>
                            <Input
                              id={`price-${unitType}`}
                              type="number"
                              step="0.01"
                              value={index === 0 ? newProduct.price : newProduct.cartonPrice}
                              onChange={(e) => {
                                if (index === 0) {
                                  setNewProduct(prev => ({ ...prev, price: e.target.value }));
                                } else {
                                  setNewProduct(prev => ({ ...prev, cartonPrice: e.target.value }));
                                }
                              }}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          
                          {unitType !== "piece" && (
                            <div className="space-y-2">
                              <Label htmlFor={`qty-${unitType}`}>
                                {unitType === "bottle" ? "Bottles per Carton" :
                                 unitType === "can" ? "Cans per Pack" :
                                 unitType === "box" ? "Items per Box" :
                                 unitType === "bag" ? "Items per Bag" : "Items per Pack"}
                              </Label>
                              <Input
                                id={`qty-${unitType}`}
                                type="number"
                                value={newProduct.pcsPerCarton}
                                onChange={(e) => setNewProduct(prev => ({ ...prev, pcsPerCarton: e.target.value }))}
                                placeholder="0"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Product</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    <div className="h-4 bg-white/20 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts?.map((product) => (
              <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{product.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-300 hover:bg-red-500/20"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Price:</span>
                      <span className="text-white font-medium">${product.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Carton Price:</span>
                      <span className="text-white font-medium">${product.cartonPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Stock:</span>
                      <span className={`font-medium ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                        {product.stock}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Per Carton:</span>
                      <span className="text-white font-medium">{product.pcsPerCarton} pcs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-white/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
            <p className="text-white/70">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
