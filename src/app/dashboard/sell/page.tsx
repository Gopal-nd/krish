"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Package,
  MessageCircle,
  TrendingUp,
  Users,
  Phone,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalEquipment: number;
  activeEquipment: number;
  totalInquiries: number;
  newInquiries: number;
  inquiriesContacted: number;
  inquiriesInDiscussion: number;
  inquiriesClosed: number;
  inquiriesPurchased: number;
}

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Fetch equipment count
      const equipmentResponse = await fetch("/api/equipment");
      const equipmentData = await equipmentResponse.json();

      // Fetch inquiry stats
      const inquiriesResponse = await fetch("/api/inquiries/seller");
      const inquiriesData = await inquiriesResponse.json();

      setStats({
        totalEquipment: equipmentData.equipment.length || 0,
        activeEquipment: equipmentData.equipment.length || 0,
        totalInquiries: inquiriesData.statistics?.total || 0,
        newInquiries: inquiriesData.statistics?.new || 0,
        inquiriesContacted: inquiriesData.statistics?.contacted || 0,
        inquiriesInDiscussion: inquiriesData.statistics?.inDiscussion || 0,
        inquiriesClosed: inquiriesData.statistics?.closed || 0,
        inquiriesPurchased: inquiriesData.statistics?.purchased || 0
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "FARMER") {
      fetchStats();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard requiredRole="FARMER">
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold  mb-2">
                Seller Dashboard
              </h1>
              <p className="">
                Manage your equipment listings and track inquiries
              </p>
            </div>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <Link href="/dashboard/equipment">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Equipment
                </Button>
              </Link>
              <Link href="/dashboard/sell/equipment/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Equipment
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalEquipment}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.activeEquipment} active listings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.newInquiries}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalInquiries} total inquiries
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Discussion</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inquiriesInDiscussion}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.inquiriesContacted} contacted
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.inquiriesPurchased}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.inquiriesClosed} closed
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Equipment Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Create, edit, and manage your equipment listings
                    </p>
                    <div className="flex gap-2">
                      <Link href="/dashboard/sell/equipment" className="flex-1">
                        <Button variant="outline" className="w-full">
                          Manage Equipment
                        </Button>
                      </Link>
                      <Link href="/dashboard/sell/equipment/new" className="flex-1">
                        <Button className="w-full">
                          Add New
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Inquiry Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Respond to buyer inquiries and track conversations
                    </p>
                    <div className="flex gap-2">
                      <Link href="/dashboard/inquiries" className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Inquiries
                        </Button>
                      </Link>
                      {stats.newInquiries > 0 && (
                        <Badge variant="destructive">
                          {stats.newInquiries} new
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

               
              </div>

              {/* Recent Activity */}
              {stats.totalInquiries > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.newInquiries > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">
                              {stats.newInquiries} new buyer inquiry
                              {stats.newInquiries > 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-blue-700">
                              Respond to stay connected with potential buyers
                            </p>
                          </div>
                          <Link href="/dashboard/inquiries">
                            <Button size="sm">View</Button>
                          </Link>
                        </div>
                      )}

                      {stats.inquiriesInDiscussion > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <Phone className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-900">
                              {stats.inquiriesInDiscussion} inquiry
                              {stats.inquiriesInDiscussion > 1 ? "s" : ""} in discussion
                            </p>
                            <p className="text-sm text-yellow-700">
                              Continue conversations to close deals
                            </p>
                          </div>
                          <Link href="/dashboard/inquiries">
                            <Button size="sm">Continue</Button>
                          </Link>
                        </div>
                      )}

                      {stats.inquiriesPurchased > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              {stats.inquiriesPurchased} successful sale
                              {stats.inquiriesPurchased > 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-green-700">
                              Great job! Keep up the good work
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16  mx-auto mb-4" />
              <h3 className="text-lg font-medium  mb-2">
                Unable to load dashboard
              </h3>
              <p className="">
                There was an error loading your dashboard statistics.
              </p>
              <Button onClick={fetchStats}>Try Again</Button>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
