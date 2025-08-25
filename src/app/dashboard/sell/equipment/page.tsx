"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { EquipmentTable } from "@/components/seller/EquipmentTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Equipment {
  id: string;
  title: string;
  slug: string;
  description?: string;
  priceCents: number;
  currency: string;
  condition: string;
  location: string;
  category: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  inquiries?: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

export default function EquipmentManagementPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEquipment = async () => {
    try {
      const response = await fetch("/api/equipment");
      if (!response.ok) throw new Error("Failed to fetch equipment");

      const data = await response.json();
      setEquipment(data?.equipment || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load your equipment listings",
        variant: "destructive",
      });
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "FARMER") {
      fetchEquipment();
    }
  }, [session]);

  const handleDeleteEquipment = async (equipment: Equipment) => {
    try {
      const response = await fetch(`/api/equipment/${equipment.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete equipment");
      }

      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });

      // Refresh the equipment list
      fetchEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete equipment",
        variant: "destructive",
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
              <div className="flex items-center gap-4 mb-2">
                <Link href="/dashboard/sell">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold ">
                Equipment Management
              </h1>
              <p className="">
                Manage your equipment listings and track performance
              </p>
            </div>
            <Link href="/dashboard/sell/equipment/new">
              <Button className="flex items-center gap-2 mt-4 sm:mt-0">
                <Plus className="w-4 h-4" />
                Add New Equipment
              </Button>
            </Link>
          </div>

          {/* Equipment Table */}
          {loading ? (
            <div className="">
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </div>
          ) : equipment.length === 0 ? (
                <div className="flex items-center justify-center h-full">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16  mx-auto mb-4" />
                <h3 className="text-lg font-medium  mb-2">
                  No equipment listings
                </h3>
                <p className="">
                  You haven't created any equipment listings yet. Start by adding your first listing.
                </p>
                <Link href="/dashboard/sell/equipment/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Equipment
                  </Button>
                </Link>
              </div>
            </div>  
          ) : (
            <EquipmentTable
              equipment={equipment}
              onDelete={handleDeleteEquipment}
              onRefresh={fetchEquipment}
            />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
