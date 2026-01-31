"use client";

import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { RecentActivity } from "@/components/recent-activity";
import { RecentOrders } from "@/components/recent-orders";
import { ShoppingCart, Users, Package, IndianRupee } from "lucide-react";
import RefundedOrdersAdmin from "@/components/RefundedOrdersAdmin";
import PendingPaymentFix from "@/components/PendingPaymentFix";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const token = Cookies.get("adminToken");

  // ✅ Fetch functions
  const fetchDashboardStats = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/get-dashboard-stats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    const data = await res.json();
    return data.data;
  };

  const fetchRecentActivity = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/get-recent-activity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) throw new Error("Failed to fetch activity");
    const data = await res.json();
    return data.data;
  };

  // ✅ React Query hooks
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60 * 60 * 1000,
    enabled: !!token,
  });

  const {
    data: activity,
    isLoading: activityLoading,
    isError: activityError,
  } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: fetchRecentActivity,
    staleTime: 60 * 60 * 1000,
    enabled: !!token,
  });

  // ✅ Loading State
  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (statsError || activityError) {
    return (
      <div className="text-red-500">
        Something went wrong while fetching dashboard data 😬
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top duration-300">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Last Week</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="New Users"
              value={stats?.lastWeek?.newUsers}
              icon={Users}
              delay={0}
            />
            <StatCard
              title="New Orders"
              value={stats?.lastWeek?.newOrders}
              icon={ShoppingCart}
              delay={100}
            />
            <StatCard
              title="Revenue"
              value={stats?.lastWeek?.revenue}
              icon={IndianRupee}
              delay={200}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Time</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totals?.users}
              icon={Users}
              delay={0}
            />
            <StatCard
              title="Total Orders"
              value={stats?.totals?.orders}
              icon={ShoppingCart}
              delay={100}
            />
            <StatCard
              title="Total Products"
              value={stats?.totals?.products}
              icon={Package}
              delay={200}
            />
            <StatCard
              title="Revenue"
              value={stats?.totals?.revenue}
              icon={IndianRupee}
              delay={250}
            />
          </div>
        </div>
      </div>
      {/* pending payment fix */}
      <PendingPaymentFix />

      {/* refunded orders */}
      <div className="">
        <RefundedOrdersAdmin />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <RevenueChart /> */}
        <RecentActivity activity={activity?.recentUsers} />
        <RecentOrders activity={activity?.recentOrders} />
      </div>
    </div>
  );
}
