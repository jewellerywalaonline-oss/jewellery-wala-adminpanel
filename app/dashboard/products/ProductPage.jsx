"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { Drawer } from "@/components/drawer";
import { ExportButtons } from "@/components/export-buttons";
import { AlertDialogUse } from "@/components/alert-dialog";
import { Cloud, IndianRupee, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NewMultiSelect from "../../../components/NewMultiSelect";
import Cookies from "js-cookie";
import Image from "next/image";
import ProductDetails from "./ProductDetails";
import { useRouter } from "next/navigation";

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  purity: "",
  code: "",
  price: "",
  discount_price: "",
  stock: "",
  estimated_delivery_time: "",
  status: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isTopRated: false,
  isUpsell: false,
  isOnSale: false,
  isPersonalized: false,
  isGift: false,
  order: 0,
  mainImage: null,
  additionalImages: [null, null, null, null, null],
  mainImagePreview: "",
  additionalImagePreviews: ["", "", "", "", ""],
};

export default function ProductsPage() {
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [removeImagesUrl, setRemoveImagesUrl] = useState([]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const { toast } = useToast();
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${Cookies.get("adminToken")}`,
  });

  const loadColors = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/color/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setColors(data._data || []);
      }
    } catch (error) {
      console.error("Error loading colors:", error);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/material/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setMaterials(data._data || []);
      }
    } catch (error) {
      console.error("Error loading materials:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/category/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data._data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadSubCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/subCategory/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setSubCategories(data._data || []);
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  };

  const loadSubSubCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}api/admin/subSubCategory/view`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        setSubSubCategories(Array.isArray(data?._data) ? data._data : []);
      }
    } catch (error) {
      console.error("Error loading sub-subcategories:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}api/admin/product/view?showDeleted=true`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      setProducts(data._data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast({ title: "Error loading products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
    loadMaterials();
    loadCategories();
    loadSubCategories();
    loadSubSubCategories();
    loadProducts();
  }, []);

  const handleEdit = (product) => {
    // Set default values for any potentially undefined properties
    const defaultProduct = {
      name: "",
      price: 0,
      stock: 0,
      purity: "",
      code: "",
      discount_price: 0,
      description: "",

      estimated_delivery_time: "",
      status: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isTopRated: false,
      isUpsell: false,
      isOnSale: false,
      isPersonalized: false,
      isGift: false,
      order: 0,
      image: "",
      images: [],
      category: [],
      subCategory: [],
      subSubCategory: [],
      colors: [],
      materials: [],
      ...product, // Spread the actual product data to override defaults
    };

    setEditingProduct(defaultProduct);

    setFormData({
      name: defaultProduct.name,
      price: defaultProduct.price,
      stock: defaultProduct.stock,
      purity: defaultProduct.purity,
      code: defaultProduct.code,
      discount_price: defaultProduct.discount_price,
      description: defaultProduct.description,
      estimated_delivery_time: defaultProduct.estimated_delivery_time,
      status: defaultProduct.status,
      isFeatured: defaultProduct.isFeatured,
      isNewArrival: defaultProduct.isNewArrival,
      isBestSeller: defaultProduct.isBestSeller,
      isTopRated: defaultProduct.isTopRated,
      isUpsell: defaultProduct.isUpsell,
      isOnSale: defaultProduct.isOnSale,
      isPersonalized: defaultProduct.isPersonalized,
      isGift: defaultProduct.isGift,
      order: defaultProduct.order,
      mainImagePreview: defaultProduct.image || "",
      additionalImagePreviews: Array.isArray(defaultProduct.images)
        ? [
            ...defaultProduct.images,
            ...Array(5 - defaultProduct.images.length).fill(""),
          ]
        : ["", "", "", "", ""],
      additionalImages: Array(5).fill(null), // Initialize with nulls for file inputs
    });

    // Safely handle array properties
    setSelectedCategory(
      Array.isArray(defaultProduct.category)
        ? defaultProduct.category
            .map((item) => item._id || item)
            .filter(Boolean)
        : []
    );
    setSelectedSubCategory(
      Array.isArray(defaultProduct.subCategory)
        ? defaultProduct.subCategory
            .map((item) => item._id || item)
            .filter(Boolean)
        : []
    );
    setSelectedSubSubCategory(
      Array.isArray(defaultProduct.subSubCategory)
        ? defaultProduct.subSubCategory
            .map((item) => item._id || item)
            .filter(Boolean)
        : []
    );
    setSelectedColors(
      Array.isArray(defaultProduct.colors)
        ? defaultProduct.colors.map((item) => item._id || item).filter(Boolean)
        : []
    );
    setSelectedMaterials(
      Array.isArray(defaultProduct.material)
        ? defaultProduct.material
            .map((item) => item._id || item)
            .filter(Boolean)
        : []
    );

    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setAlertOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE}api/admin/product/delete/${deleteId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: deleteId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || errorData.error || "Failed to delete product";
        throw new Error(errorMessage);
      }

      toast({ title: "Product deleted successfully" });
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage =
        error.message ||
        "An unexpected error occurred while deleting the product";
      toast({
        title: "Error deleting product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAlertOpen(false);
      setDeleteId(null);
    }
  };

  function generateCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Add text fields
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("purity", formData.purity);

    formDataToSend.append(
      "code",
      formData.code ? formData.code : generateCode()
    );

    formDataToSend.append("price", formData.price);
    formDataToSend.append("discount_price", formData.discount_price);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append(
      "estimated_delivery_time",
      formData.estimated_delivery_time
    );
    formDataToSend.append("order", formData.order);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("isFeatured", formData.isFeatured);
    formDataToSend.append("isNewArrival", formData.isNewArrival);
    formDataToSend.append("isPersonalized", formData.isPersonalized);
    formDataToSend.append("isGift", formData.isGift);
    formDataToSend.append("isBestSeller", formData.isBestSeller);
    formDataToSend.append("isTopRated", formData.isTopRated);
    formDataToSend.append("isUpsell", formData.isUpsell);
    formDataToSend.append("isOnSale", formData.isOnSale);

    // Add categories
    if (selectedCategory.length > 0) {
      selectedCategory.forEach((cat) =>
        formDataToSend.append("category[]", cat)
      );
    }
    if (selectedSubCategory.length > 0) {
      selectedSubCategory.forEach((subCat) =>
        formDataToSend.append("subCategory[]", subCat)
      );
    }
    if (selectedSubSubCategory.length > 0) {
      selectedSubSubCategory.forEach((subSubCat) =>
        formDataToSend.append("subSubCategory[]", subSubCat)
      );
    }
    if (selectedColors.length > 0) {
      selectedColors.forEach((color) =>
        formDataToSend.append("colors[]", color)
      );
    }
    if (selectedMaterials.length > 0) {
      selectedMaterials.forEach((material) =>
        formDataToSend.append("material[]", material)
      );
    }
    // Add main image file
    if (formData.mainImage) {
      formDataToSend.append("image", formData.mainImage);
    }

    // Add additional image files
    formData.additionalImages?.forEach((file, index) => {
      if (file) {
        formDataToSend.append(`images`, file);
      }
    });

    if (removeImagesUrl.length > 0) {
      removeImagesUrl.forEach((url) => {
        formDataToSend.append("removeImagesUrl[]", url);
      });
    }

    setBtnLoading(true);
    try {
      const url = editingProduct
        ? `${API_BASE}api/admin/product/update/${editingProduct._id}`
        : `${API_BASE}api/admin/product/create`;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          `Failed to ${editingProduct ? "update" : "create"} product`;
        throw new Error(errorMessage);
      }

      toast({
        title: `Product ${editingProduct ? "updated" : "created"} successfully`,
      });
      closeDrawer();
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage =
        error.message ||
        "An unexpected error occurred while saving the product";
      toast({
        title: "Error saving product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setBtnLoading(false);
    }
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingProduct(null);
    setSelectedCategory([]);
    setSelectedSubCategory([]);
    setSelectedSubSubCategory([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData({
      ...formData,
      mainImage: file,
      mainImagePreview: URL.createObjectURL(file),
    });
  };

  const handleAdditionalImageChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newImages = [...formData.additionalImages];
    const newPreviews = [...formData.additionalImagePreviews];

    newImages[index] = file;
    newPreviews[index] = URL.createObjectURL(file);

    setFormData({
      ...formData,
      additionalImages: newImages,
      additionalImagePreviews: newPreviews,
    });
  };

  const removeMainImage = () => {
    if (
      formData.mainImagePreview &&
      formData.mainImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.mainImagePreview);
    }
    setFormData({
      ...formData,
      mainImage: null,
      mainImagePreview: "",
    });
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...formData.additionalImages];
    const newPreviews = [...formData.additionalImagePreviews];

    if (newPreviews[index].startsWith("blob:")) {
      URL.revokeObjectURL(newPreviews[index]);
    }

    newImages[index] = null;
    newPreviews[index] = "";

    setFormData({
      ...formData,
      additionalImages: newImages,
      additionalImagePreviews: newPreviews,
    });
  };
  const router = useRouter();

  const showDetails = (item) => {
    router.push(`/dashboard/products/${item._id}`);
  };

  const handleStatusChange = async (item) => {
    setBtnLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}api/admin/product/change-status/${item._id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to update status");
      toast({
        title: `${item.status ? "Deactivated" : "Activated"} successfully`,
      });
      loadProducts();
    } catch (error) {
      console.error("Error updating product status:", error);
      toast({ title: "Error updating product status", variant: "destructive" });
    } finally {
      setBtnLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            <Image
              onClick={() => showDetails(item)}
              width={64}
              height={64}
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover cursor-pointer"
            />
          </div>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (item) => (
        <span className="font-semibold flex items-center ">
          <IndianRupee size={16} />
          {item.price}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (item) => (
        <Badge
          variant={item.stock > 0 ? "default" : "destructive"}
          className="font-mono"
        >
          {item.stock}
        </Badge>
      ),
    },
    {
      key: "Discount Price",
      label: "Discount Price",
      render: (item) => (
        <span className=" flex items-center">
          <IndianRupee size={16} />
          {item.discount_price}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Button
          disabled={btnLoading}
          variant={item.status ? "default" : "destructive"}
          className="font-mono cursor-pointer"
          onClick={() => handleStatusChange(item)}
        >
          {btnLoading ? "Changing.." : item.status ? "Active" : "Inactive"}
        </Button>
      ),
    },
  ];

  const toggleRemoveImagesUrl = (url) => {
    if (removeImagesUrl.includes(url)) {
      setRemoveImagesUrl(removeImagesUrl.filter((u) => u !== url));
    } else {
      setRemoveImagesUrl([...removeImagesUrl, url]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={products} filename="products" />
          <Button
            onClick={() => {
              closeDrawer();
              setDrawerOpen(true);
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <DataTable
        data={products}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search products..."
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        className="!w-[60vw] !max-w-[1800px]"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              {/* price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {/* discount price */}
              <div className="space-y-2">
                <Label htmlFor="discount_price">Discount Price *</Label>
                <Input
                  type="number"
                  id="discount_price"
                  value={formData.discount_price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_price: e.target.value,
                    })
                  }
                  placeholder="Enter discount price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter full description"
                  required
                />
              </div>
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Categories & Tags</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <NewMultiSelect
                  category={categories}
                  categoryId={selectedCategory}
                  setCategoryId={setSelectedCategory}
                  placeholder="Select categories..."
                />
              </div>
              {/* Subcategory */}
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <NewMultiSelect
                  category={subCategories}
                  categoryId={selectedSubCategory}
                  setCategoryId={setSelectedSubCategory}
                  placeholder="Select subcategories..."
                  disabled={selectedCategory.length === 0}
                />
              </div>
              {/* Sub-subcategory */}
              <div className="space-y-2">
                <Label>Sub-subcategory</Label>
                <NewMultiSelect
                  category={subSubCategories}
                  categoryId={selectedSubSubCategory}
                  setCategoryId={setSelectedSubSubCategory}
                  placeholder="Select sub-subcategories..."
                  disabled={selectedSubCategory.length === 0}
                />
              </div>
              {/* Colors */}
              <div className="space-y-2">
                <Label>Colors</Label>
                <NewMultiSelect
                  category={colors}
                  categoryId={selectedColors}
                  setCategoryId={setSelectedColors}
                  placeholder="Select colors..."
                />
              </div>
              {/* Materials */}
              <div className="space-y-2">
                <Label>Materials</Label>
                <NewMultiSelect
                  category={materials}
                  categoryId={selectedMaterials}
                  setCategoryId={setSelectedMaterials}
                  placeholder="Select materials..."
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Purity */}
              <div className="space-y-2">
                <Label htmlFor="purity">Purity *</Label>
                <Input
                  id="purity"
                  value={formData.purity}
                  onChange={(e) =>
                    setFormData({ ...formData, purity: e.target.value })
                  }
                  placeholder="e.g. 80%"
                  required
                />
              </div>
              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  type="number"
                  id="stock"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="Enter available stock"
                  min="0"
                  required
                />
              </div>
              {/* Estimated Delivery Time */}
              <div className="space-y-2">
                <Label htmlFor="estimated_delivery_time">
                  Estimated Delivery Time *
                </Label>
                <Input
                  id="estimated_delivery_time"
                  value={formData.estimated_delivery_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimated_delivery_time: e.target.value,
                    })
                  }
                  placeholder="e.g., 3-5 business days"
                  required
                />
              </div>
              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  type="number"
                  id="order"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: e.target.value })
                  }
                  placeholder="Enter display order"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Product Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: "isFeatured", label: "Featured" },
                { id: "isNewArrival", label: "New Arrival" },
                { id: "isBestSeller", label: "Best Seller" },
                { id: "isTopRated", label: "Top Rated" },
                { id: "isUpsell", label: "Upsell" },
                { id: "isOnSale", label: "On Sale" },
                { id: "isPersonalized", label: "Personalized" },
                { id: "isGift", label: "Gift" },
              ].map((toggle) => (
                <div key={toggle.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={toggle.id}
                    checked={formData[toggle.id]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [toggle.id]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <Label htmlFor={toggle.id} className="cursor-pointer">
                    {toggle.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Images</h3>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Main Image *</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Cloud />
                    <p className="mb-2 text-sm text-gray-500">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                </label>
              </div>
              {formData.mainImagePreview && (
                <div className="relative w-20 h-20">
                  <img
                    src={formData.mainImagePreview}
                    alt="Main"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {/* Additional Images */}
            <div className="space-y-2">
              <Label>Additional Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {formData.additionalImages?.map((src, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex flex-col items-center justify-center">
                        <Cloud />
                        <p className="text-xs text-gray-500 mt-1">
                          Image {index + 1}
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleAdditionalImageChange(e, index)}
                      />
                    </label>
                    {formData.additionalImagePreviews[index] && (
                      <div className="relative w-16 h-16">
                        <img
                          src={formData.additionalImagePreviews[index]}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Images Url To Remove</h3>
            <div className="flex flex-col space-y-2">
              {formData.additionalImagePreviews?.map(
                (url, index) =>
                  url &&
                  url.startsWith(
                    "https://pub-50951b7722e041bebc7b86688a160a35.r2.dev/"
                  ) && (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={url}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => toggleRemoveImagesUrl(url)}
                        className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                      >
                        {removeImagesUrl.includes(url) ? "Undo" : "Remove"}
                      </button>
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button disabled={btnLoading} type="submit">
              {btnLoading
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </Drawer>

      <AlertDialogUse
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
