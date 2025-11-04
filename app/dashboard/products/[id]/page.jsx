import React from "react";
import ProductDetails from "../ProductDetails";
import { toast } from "@/hooks/use-toast";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export default async function page({ params }) {
  const { id } = await params;
  const cookiesStore = await cookies();

  try {
    const response = await fetch(`${API_BASE}api/admin/product/details/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookiesStore.get("adminToken").value}`,
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    if (!response.ok || data._status === false) {
      return <div>{data._message}</div>;
    }
    return <ProductDetails product={data._data} />;
  } catch (error) {
    console.error("Error loading product:", error);
    return <div>Error loading product {error.message || "Unknown error"}</div>;
  }
}
