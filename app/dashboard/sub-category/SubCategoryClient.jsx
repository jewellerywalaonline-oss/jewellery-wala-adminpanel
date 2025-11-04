"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer } from "@/components/drawer";
import { ExportButtons } from "@/components/export-buttons";
import { AlertDialogUse } from "@/components/alert-dialog";
import { Plus, Edit, Trash2, FolderTree, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import NewMultiSelect from "../../../components/NewMultiSelect";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${Cookies.get("adminToken")}`,
});

const getAuthHeadersFormData = () => ({
  Authorization: `Bearer ${Cookies.get("adminToken")}`,
});

export default function SubCategoriesClient({
  initialSubCategories,
  initialCategories,
}) {
  const [subCategories, setSubCategories] = useState(initialSubCategories);
  const [categories, setCategories] = useState(initialCategories);
  const [categoryId, setCategoryId] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/category/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await response.json();
      setCategories(data._data || data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({ title: "Error loading categories", variant: "destructive" });
    }
  };

  const loadSubCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}api/admin/subCategory/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to load sub categories");
      }

      const data = await response.json();
      setSubCategories(
        Array.isArray(data?._data)
          ? data._data
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error("Error loading sub categories:", error);
      toast({ title: "Error loading sub categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image,
    });
    console.log(category);
    // Set the category IDs for editing
    setCategoryId(
      Array.isArray(category.category)
        ? category.category.map((cat) => cat._id || cat)
        : []
    );
    setImagePreview(category.image || null);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setBtnLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}api/admin/subCategory/delete/${categoryToDelete}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: categoryToDelete }),
        }
      );

      const data = await response.json();

      if (!response.ok || data._status === false) {
        throw new Error(data._message || "Error deleting sub category");
      }

      toast({ title: "Sub category deleted successfully" });
      await loadSubCategories();
    } catch (error) {
      console.error("Error deleting sub category:", error);
      toast({
        title: error.message || "Error deleting sub category",
        variant: "destructive",
      });
    } finally {
      setBtnLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Sub category name is required",
        variant: "destructive",
      });
      return;
    }

    if (categoryId.length === 0) {
      toast({
        title: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    setBtnLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      if (formData.image instanceof File) {
        submitData.append("image", formData.image);
      }
      categoryId.forEach((id) => submitData.append("category[]", id));

      let response;

      if (editingCategory) {
        response = await fetch(
          `${API_BASE}api/admin/subCategory/update/${editingCategory._id}`,
          {
            method: "PUT",
            headers: getAuthHeadersFormData(),
            body: submitData,
          }
        );
      } else {
        response = await fetch(`${API_BASE}api/admin/subCategory/create`, {
          method: "POST",
          headers: getAuthHeadersFormData(),
          body: submitData,
        });
      }

      const data = await response.json();

      if (!response.ok || data._status === false) {
        throw new Error(
          data._message || data.message || "Error saving sub category"
        );
      }

      toast({
        title: editingCategory
          ? "Sub category updated successfully"
          : "Sub category created successfully",
      });

      setDrawerOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", image: null });
      setImagePreview(null);
      setCategoryId([]);

      await loadSubCategories();
    } catch (error) {
      console.error("Error saving sub category:", error);
      toast({
        title: error.message || "Error saving sub category",
        variant: "destructive",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleChangeStatus = async (category) => {
    setBtnLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}api/admin/subCategory/change-status/${category._id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: category._id }),
        }
      );

      const data = await response.json();

      if (!response.ok || data._status === false) {
        throw new Error(data._message || "Error changing status");
      }

      toast({
        title: `Sub category ${
          category.status ? "deactivated" : "activated"
        } successfully`,
      });
      await loadSubCategories();
    } catch (error) {
      console.error("Error changing status:", error);
      toast({
        title: error.message || "Error changing status",
        variant: "destructive",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sub Categories</h1>
          <p className="text-muted-foreground">
            Organize your products into sub categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={subCategories} filename="sub-categories" />
          <Button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", image: null });
              setImagePreview(null);
              setCategoryId([]);
              setDrawerOpen(true);
            }}
            className="transition-all duration-200 hover:scale-105"
            disabled={btnLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub Category
          </Button>
        </div>
      </div>

      {subCategories.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <FolderTree className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No sub categories yet</h3>
              <p className="text-muted-foreground">
                Create your first sub category to get started
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: "", image: null });
                setImagePreview(null);
                setCategoryId([]);
                setDrawerOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub Category
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subCategories.map((category, index) => (
            <Card
              key={category._id}
              className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-card/80 backdrop-blur-sm flex items-center justify-center">
                        <FolderTree className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={category.status ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {category.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="flex-1 transition-all duration-200 hover:scale-105"
                        disabled={btnLoading}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
                        className="flex-1 transition-all duration-200 hover:scale-105 text-destructive hover:text-destructive"
                        disabled={btnLoading}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <Button
                      variant={category.status ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleChangeStatus(category)}
                      className="w-full transition-all duration-200"
                      disabled={btnLoading}
                    >
                      {btnLoading ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      ) : null}
                      {category.status ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          if (!btnLoading) {
            setDrawerOpen(false);
            setEditingCategory(null);
            setFormData({ name: "", image: null });
            setImagePreview(null);
            setCategoryId([]);
          }
        }}
        title={editingCategory ? "Edit Sub Category" : "Add Sub Category"}
      >
        <div className="space-y-4">
          <div className="space-y-2 animate-in slide-in-from-right duration-300">
            <Label htmlFor="name">Sub Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={btnLoading}
              placeholder="Enter sub category name"
            />
          </div>
          <div className="space-y-2 animate-in slide-in-from-right duration-300 delay-150">
            <Label htmlFor="image">Sub Category Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={btnLoading}
            />
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-muted mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: null });
                  }}
                  className="absolute top-2 right-2 rounded-full h-6 w-6 p-0"
                  disabled={btnLoading}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2 animate-in slide-in-from-right duration-300 delay-75">
            <Label htmlFor="category">Parent Category</Label>
            <NewMultiSelect
              category={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              disabled={btnLoading}
            />

            <Button
              onClick={handleSubmit}
              className="w-full animate-in slide-in-from-bottom duration-300 delay-150"
              disabled={btnLoading}
            >
              {btnLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingCategory ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editingCategory
                    ? "Update Sub Category"
                    : "Create Sub Category"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Drawer>

      <AlertDialogUse
        isOpen={deleteDialogOpen}
        onClose={() => {
          if (!btnLoading) {
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        title="Delete Sub Category"
        description="Are you sure you want to delete this sub category? This action cannot be undone."
        confirmText={btnLoading ? "Deleting..." : "Delete"}
        confirmDisabled={btnLoading}
      />
    </div>
  );
}
