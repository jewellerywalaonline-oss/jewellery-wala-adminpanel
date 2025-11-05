"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Truck, AlertCircle, CheckCircle2, Clock, Package } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpDrawerOpen, setIsOtpDrawerOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setIsSuccess(false);

      const token = Cookies.get("deliveryToken");

      if (!token) {
        router.push("/delievery");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/website/orders/delivery/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        if (response.status === 401) {
          router.push("/delievery");
          return;
        }
        toast({
          title: "Error",
          description: "Failed to fetch order",
          variant: "destructive",
        });
      }
      if (response.data.order.status != "shipped") {
        router.push("/delievery/orders");
        return;
      }
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      if (error.response?.status === 401) {
        router.push("/delievery");
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async () => {
    try {
      setBtnLoading(true);
      const token = Cookies.get("deliveryToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/website/orders/send-delivery-otp`,
        { orderId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);

      if (response.status !== 200) {
        return toast({
          title: "Error",
          description: "Failed to send OTP",
          variant: "destructive",
        });
      }
      toast({
        title: "Success",
        description: "OTP sent successfully!",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const token = Cookies.get("deliveryToken");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/website/orders/verify-delivery-otp`,
        { orderId: id, otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status == 400) {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
        return;
      }
      if (response.status !== 200) {
        toast({
          title: "Error",
          description: "Failed to verify OTP",
          variant: "destructive",
        });
        return;
      }
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Order marked as delivered successfully!",
        });
        setIsSuccess(true);
        setIsOtpDrawerOpen(false);
        setTimeout(() => {
          setIsSuccess(false);
          router.push("/delievery/orders");
        }, 5000);
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Order not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-gray-500">Order #{order.orderId}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/delievery/orders")}
        >
          Back to Orders
        </Button>
      </div>

      <Sheet open={isOtpDrawerOpen} onOpenChange={setIsOtpDrawerOpen}>
        <SheetTrigger>
          <Button className="mb-6" disabled={order?.status === "delivered"}>
            {order?.status === "delivered"
              ? "Already Delivered"
              : "Mark As Delivered"}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle className="text-center">Verify Delivery</SheetTitle>
            <SheetDescription className="text-center">
              Enter the 6-digit OTP received by the customer
            </SheetDescription>
          </SheetHeader>
          <div className="mx-auto w-full max-w-md">
            <form onSubmit={handleOtpSubmit} className="px-4">
              <div className="flex items-center justify-center my-8">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Please enter the one-time password sent to the customer
              </p>
              <SheetFooter className="px-0">
                <Button
                  type="submit"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? "Verifying..." : "Verify & Complete Delivery"}
                </Button>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <Button disabled={btnLoading} variant="outline" className="ms-2" onClick={handleOtpSend}>
        {btnLoading ? "Sending..." : "Send OTP"}
      </Button>

      {isSuccess && (
        <Dialog onOpenChange={() => setIsSuccess(false)}>
          <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <DialogTitle className="text-center">
              <CheckCircle2 className="w-6 h-6 mr-2 stroke-2" />
              Order Marked as Delivered
            </DialogTitle>
            <DialogDescription className="text-center">
              Order has been marked as delivered successfully.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                        {item.productId?.images?.[0] && (
                          <img
                            src={item.productId.images[0]}
                            alt={item.productId.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {item.productId?.name || "Product"}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-2">
                          <span> Qty: {item.quantity}</span>
                          {item.isGift && <Badge className="">Gift Item</Badge>}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">
                      ₹{item.subtotal?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                ))}
              </div>
              <div className=" border-t">
                <div className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>₹{order?.pricing?.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                {order?.pricing?.discount > 0 && (
                  <div className="flex justify-between py-1 text-green-600">
                    <span>Discount</span>
                    <span>₹{order?.pricing?.discount?.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span>Shipping</span>
                  <span>
                    {order?.pricing?.shipping === 0
                      ? "Free"
                      : `₹${order?.pricing?.shipping?.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>₹{order?.pricing?.total?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  {order?.shippingAddress ? (
                    <div className="space-y-1">
                      <p>{order?.shippingAddress?.name}</p>
                      <p>{order?.shippingAddress?.email}</p>
                      <p>{order?.shippingAddress?.addressLine1}</p>
                      {order?.shippingAddress?.addressLine2 && (
                        <p>{order?.shippingAddress?.addressLine2}</p>
                      )}
                      <p>
                        {order?.shippingAddress?.city},{" "}
                        {order?.shippingAddress?.state} -{" "}
                        {order?.shippingAddress?.pincode}
                      </p>
                      <p>Phone: {order?.shippingAddress?.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No shipping address provided
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Order Status</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        order.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.updatedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
