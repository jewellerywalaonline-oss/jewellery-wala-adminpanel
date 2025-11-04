"use client";

import { cache, useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { RecentActivity } from "@/components/recent-activity";
import { RecentOrders } from "@/components/recent-orders";
import { RevenueChart } from "@/components/revenue-chart";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  IndianRupee,
} from "lucide-react";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  console.log(Cookies.get("adminToken"));

  const fetchData = cache(async () => {
    try {
      const data = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "api/admin/dashboard/get-dashboard-stats",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("adminToken")}`,
          },
        }
      );
      const res = await data.json();
      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  });

  const fetchActivity = cache(async () => {
    try {
      const data = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "api/admin/dashboard/get-recent-activity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("adminToken")}`,
          },
        }
      );
      const res = await data.json();
      setActivity(res.data);
    } catch (error) {
      console.log(error);
    }
  });
  useEffect(() => {
    fetchData();
    fetchActivity();
  }, []);

  if (!stats) {
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
              value={stats.lastWeek.newUsers}
              icon={Users}
              delay={0}
            />
            <StatCard
              title="New Orders"
              value={stats.lastWeek.newOrders}
              icon={ShoppingCart}
              delay={100}
            />
            <StatCard
              title="Revenue"
              value={stats.lastWeek.revenue}
              icon={IndianRupee}
              delay={200}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">All Time</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              title="Total Users"
              value={stats.totals.users}
              icon={Users}
              delay={0}
            />
            <StatCard
              title="Total Orders"
              value={stats.totals.orders}
              icon={ShoppingCart}
              delay={100}
            />
            <StatCard
              title="Total Products"
              value={stats.totals.products}
              icon={Package}
              delay={200}
            />
             <StatCard
              title="Revenue"
              value={stats.totals.revenue}
              icon={IndianRupee}
              delay={250}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <RevenueChart /> */}
        <RecentActivity activity={activity?.recentUsers} />
        <RecentOrders activity={activity?.recentOrders} />
      </div>
    </div>
  );
}
