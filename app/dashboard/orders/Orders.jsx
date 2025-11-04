"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { ExportButtons } from "@/components/export-buttons";
import { OrderReceipt } from "@/components/order-receipt";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Printer,
  IndianRupee,
} from "lucide-react";
import { Drawer } from "@/components/drawer";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import Image from "next/image";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const token = Cookies.get("adminToken");
    const data = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "api/website/orders/all",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      }
    );
    const response = await data.json();
    if (response.ok || response.success) {
      setOrders(response.data);
    } else {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEdit = (order) => {
    setDrawerOpen(true);
    setSelectedOrder(order);
  };

  const handleMarkToShipped = async (order) => {
    try {
      const token = Cookies.get("adminToken");
      const data = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "api/website/orders/mark-to-shipped",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId: order.orderId }),
        }
      );
      const response = await data.json();
      if (response.ok || response.success) {
        toast({
          title: "Success",
          description: "Order marked to shipped successfully",
        });
        loadOrders();
      } else {
        throw new Error(response.message || "Failed to mark order to shipped");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark order to shipped",
        variant: "destructive",
      });
    }
  };

  const handlePrint = (order) => {
    setSelectedOrder(order);
    setReceiptOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      default:
        return "secondary";
    }
  };

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (item) => (
        <span className="font-mono font-semibold">#{item.orderId}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (item) => (
        <span className="font-medium">
          {item?.shippingAddress?.fullName || ""}
        </span>
      ),
    },
    {
      key: "items",
      label: "Total Items",
      render: (item) => (
        <Badge variant="secondary" className="font-mono">
          {item?.items?.length}
        </Badge>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (item) => (
        <span className="font-semibold flex items-center">
          <IndianRupee size={12} />
          {item.pricing.total.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Badge
          variant={getStatusColor(item.status)}
          className="capitalize gap-1"
        >
          {getStatusIcon(item.status)}
          {item.status}
        </Badge>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item?.payment?.status}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.createdAt).toDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePrint(item)}
          className="transition-all duration-200 hover:scale-105"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      ),
    },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders
          </p>
        </div>
        <ExportButtons data={orders} filename="orders" />
      </div>

      <DataTable
        selectOption={statusOptions}
        data={orders}
        dateOption={true}
        columns={columns}
        onEdit={handleEdit}
        searchPlaceholder="Search orders..."
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Actions"
        className=" md:!w-[60vw] md:!max-w-[1800px] !w-full !max-w-full"
      >
        <Badge variant="default" className="font-mono capitalize text-md mb-4">
          {selectedOrder?.status}
        </Badge>
        {selectedOrder?.status !== "shipped" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkToShipped(selectedOrder)}
            className="transition-all duration-200 hover:scale-105 w-full"
          >
            <Truck className="h-4 w-4 mr-2" />
            Mark To Shipped
          </Button>
        )}

        {/* order details */}
        {selectedOrder && (
          <div className="mt-6 border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-t pt-2">
                <p className="font-medium">Order ID:</p>
                <p className="text-muted-foreground">
                  {selectedOrder?.orderId}
                </p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Customer:</p>
                <p className="text-muted-foreground">
                  {selectedOrder?.shippingAddress?.fullName}
                </p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Is It A Gift:</p>
                <p className="text-muted-foreground">
                  {selectedOrder?.isGift ? "Yes" : "No"}
                </p>
                {selectedOrder?.isGift && (
                  <div>
                    <p className="font-medium">Gift Message:</p>
                    <p className="text-muted-foreground">
                      {selectedOrder?.giftMessage}
                    </p>
                  </div>
                )}
                {selectedOrder.isGift && selectedOrder.giftWrap && (
                  <div>
                    <p className="font-medium">Gift Wrap:</p>
                    <p className="text-muted-foreground">
                      {selectedOrder?.giftWrap ? "Yes" : "No"}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Total:</p>
                <p className="text-muted-foreground">
                  {selectedOrder?.pricing?.total.toFixed(2)}
                </p>
              </div>
              <div className="border-t pt-2">
                <p className="font-medium">Status:</p>
                <p className="text-muted-foreground">{selectedOrder?.status}</p>
              </div>
            </div>
            <div className="mt-4 space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                {selectedOrder?.items?.map((item) => (
                  <div key={item.productId} className="flex ">
                    <Image
                      onClick={() => console.log(selectedOrder)}
                      src={item.images[0]}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                    <div className="bg-white p-2 flex-col  shadow-md flex gap-1">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium truncate flex items-center">
                        <IndianRupee size={12} />{" "}
                        {item.priceAtPurchase.toFixed(2)}
                      </p>
                      <p className="text-sm font-medium truncate">
                        Personalized: {item.isPersonalized ? "Yes" : "No"}
                      </p>
                      {item.isPersonalized && (
                        <p className="text-sm font-medium truncate">
                          Personalized Name: {item.personalizedName}
                        </p>
                      )}
                      <p className="text-sm font-medium truncate">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* payment */}
            <div className="mt-4 space-y-4 border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-t pt-2">
                  <p className="font-medium">Payment Method:</p>
                  <p className="text-muted-foreground">
                    {selectedOrder?.payment?.method}
                  </p>
                </div>
                <div className="border-t pt-2">
                  <p className="font-medium">Payment Status:</p>
                  <p className="text-muted-foreground">
                    {selectedOrder?.payment?.status}
                  </p>
                </div>
              </div>
            </div>
            {/* status history */}
            <div className="mt-4 space-y-4 border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Status History</h2>
              <div className="grid grid-cols-1  gap-4">
                {selectedOrder?.statusHistory?.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between"
                  >
                    <p className="font-medium">{status.status}</p>
                    <p className="text-muted-foreground">
                      {new Date(status.timestamp).toDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
      <OrderReceipt
        title="Order Receipt"
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
