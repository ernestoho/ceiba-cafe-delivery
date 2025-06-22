import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminStats from "@/components/admin-stats";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import { FOOD_CATEGORIES } from "@/lib/constants";

interface MenuItemFormData extends Omit<InsertMenuItem, 'restaurantId'> {
  id?: number;
  regularPrice: string;
  bigPrice: string;
  hasSizeOptions: boolean;
}

export default function Admin() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    regularPrice: "",
    bigPrice: "",
    image: "",
    category: "pizza",
    hasSizeOptions: false,
    isAvailable: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", 1, "menu", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/restaurants/1/menu${params}`);
      if (!response.ok) throw new Error("Failed to fetch menu items");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      return await apiRequest("POST", `/api/admin/menu-items`, { ...data, restaurantId: 1 });
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", 1, "menu"] });
      toast({ title: "Menu item created successfully", variant: "default" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create menu item", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: MenuItemFormData & { id: number }) => {
      return await apiRequest("PUT", `/api/admin/menu-items/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure real-time updates including images
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", 1, "menu"] });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({ title: "Menu item updated successfully", variant: "default" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update menu item", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/menu-items/${id}`);
    },
    onSuccess: () => {
      // Invalidate all relevant queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", 1, "menu"] });
      toast({ title: "Menu item deleted successfully", variant: "default" });
    },
    onError: () => {
      toast({ title: "Failed to delete menu item", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      regularPrice: "",
      bigPrice: "",
      image: "",
      category: "pizza",
      hasSizeOptions: false,
      isAvailable: true,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      regularPrice: item.regularPrice || "",
      bigPrice: item.bigPrice || "",
      image: item.image,
      category: item.category,
      hasSizeOptions: item.hasSizeOptions ?? false,
      isAvailable: item.isAvailable,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ ...formData, id: editingItem.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData_upload = new FormData();
      formData_upload.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData_upload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      
      // Update form data with new image URL
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
      // If editing an existing item, immediately update it to show the new image
      if (editingItem) {
        const updatedData = { ...formData, image: imageUrl };
        try {
          await apiRequest("PUT", `/api/admin/menu-items/${editingItem.id}`, updatedData);
          
          // Invalidate queries to refresh the UI immediately
          queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
          queryClient.invalidateQueries({ queryKey: ["/api/restaurants", 1, "menu"] });
          queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
          
          toast({ title: "Image updated successfully", variant: "default" });
        } catch (updateError) {
          console.error('Error updating menu item with new image:', updateError);
          toast({ title: "Image uploaded but failed to update menu item", variant: "destructive" });
        }
      } else {
        toast({ title: "Image uploaded successfully", variant: "default" });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const groupedItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Ceiba Cafe Pizzeria Menu Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                ← Back to Site
              </a>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => resetForm()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/20 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FOOD_CATEGORIES.filter(cat => cat.id !== "all").map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasSizeOptions"
                      checked={Boolean(formData.hasSizeOptions)}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSizeOptions: checked })}
                    />
                    <Label htmlFor="hasSizeOptions">Has Size Options (Regular/Big)</Label>
                  </div>

                  {formData.hasSizeOptions ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="regularPrice">Regular Price (DOP)</Label>
                        <Input
                          id="regularPrice"
                          value={formData.regularPrice ?? ""}
                          onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                          placeholder="475"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="bigPrice">Big Price (DOP)</Label>
                        <Input
                          id="bigPrice"
                          value={formData.bigPrice ?? ""}
                          onChange={(e) => setFormData({ ...formData, bigPrice: e.target.value })}
                          placeholder="825"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="price">Price (DOP)</Label>
                      <Input
                        id="price"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="650"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="image">Image</Label>
                    <div className="space-y-3">
                      <Input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                        disabled={uploadingImage}
                      />
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">or</span>
                        <Input
                          id="image-url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Enter image URL"
                          className="flex-1"
                          disabled={uploadingImage}
                        />
                      </div>
                      {uploadingImage && (
                        <div className="text-sm text-orange-600 flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                          <span>Uploading image...</span>
                        </div>
                      )}
                      {formData.image && (
                        <div className="mt-2">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                    />
                    <Label htmlFor="isAvailable">Available</Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={createMutation.isPending || updateMutation.isPending || uploadingImage}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {uploadingImage ? "Uploading..." : editingItem ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-white/20 backdrop-blur-md border-white/30 p-1 rounded-full">
            {FOOD_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-full px-4 py-2"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminStats />
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Card key={j} className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardContent className="p-4">
                        <Skeleton className="aspect-video mb-4 rounded-lg" />
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full mb-3" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(groupedItems).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 capitalize">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-transparent ml-6" />
                  <Badge variant="secondary" className="ml-4 bg-orange-100 text-orange-800">
                    {items.length} items
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {item.hasSizeOptions && (
                                <Badge variant="outline" className="text-xs">
                                  Sizes
                                </Badge>
                              )}
                              <Badge 
                                variant={item.isAvailable ? "default" : "secondary"}
                                className={item.isAvailable ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                              >
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-orange-600">
                              {item.hasSizeOptions ? (
                                <span>DOP {item.regularPrice} / {item.bigPrice}</span>
                              ) : (
                                <span>DOP {item.price}</span>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🍕</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No menu items found
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory === "all" 
                ? "Start by adding your first menu item" 
                : `No items in the ${selectedCategory} category`}
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}