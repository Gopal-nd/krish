"use client";

import { useState, useEffect } from "react";
import { EquipmentCard } from "@/components/marketplace/EquipmentCard";
import { EquipmentFilters, FilterState } from "@/components/marketplace/EquipmentFilters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Grid, List } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { createEquipmentWhatsAppLink } from "@/lib/whatsapp";
import { useRouter } from "next/navigation";
import { EquipmentCondition } from "@prisma/client";

interface Equipment {
  id: string;
  title: string;
  slug: string;
  description?: string;
  priceCents: number;
  currency: string;
  condition: EquipmentCondition;
  location: string;
  category: string;
  images: string[];
  createdAt: string;
  seller: {
    id: string;
    name: string;
    whatsappNumber?: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function EquipmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    condition: "",
    location: "",
    priceMin: "",
    priceMax: ""
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const fetchEquipment = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        )
      });

      const response = await fetch(`/api/equipment?${params}`);
      if (!response.ok) throw new Error("Failed to fetch equipment");

      const data = await response.json();
      setEquipment(data.equipment || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment(1);
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    fetchEquipment(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsAppClick = (equipment: Equipment) => {
    if (!equipment.seller.whatsappNumber) return;

    const whatsappLink = createEquipmentWhatsAppLink(
      {
        title: equipment.title,
        condition: equipment.condition,
        location: equipment.location,
        category: equipment.category
      },
      equipment.seller.whatsappNumber,
      session?.user?.name || "a buyer"
    );

    if (whatsappLink) {
      window.open(whatsappLink, "_blank");
    }
  };

  const renderEquipmentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {equipment.map((item) => (
        <EquipmentCard
          key={item.id}
          equipment={item}
          showWhatsApp={!!session?.user}
          onWhatsAppClick={() => handleWhatsAppClick(item)}
        />
      ))}
    </div>
  );

  const renderEquipmentList = () => (
    <div className="space-y-4">
      {equipment.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.images?.[0] || "/placeholder-equipment.jpg"}
                alt={item.title}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-equipment.jpg";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/equipment/${item.slug}`}>
                <h3 className="text-lg font-semibold  hover:text-blue-600 truncate">
                  {item.title}
                </h3>
              </Link>
              <p className=" text-sm mt-1 line-clamp-1">
                {item.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="font-medium text-green-600">
                  ₹{(item.priceCents / 100).toLocaleString()}
                </span>
                <span>{item.location}</span>
                <span>{item.condition}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {session?.user && item.seller.whatsappNumber && (
                <Button
                  size="sm"
                  onClick={() => handleWhatsAppClick(item)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  WhatsApp
                </Button>
              )}
              <Link href={`/dashboard/equipment/${item.slug}`}>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Agricultural Equipment
            </h1>
            <p className="">
              Find tractors, harvesters, and farming equipment from trusted sellers
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none border-l"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Equipment Button (Farmers only) */}
            {session?.user?.role === "FARMER" && (
              <Link href="/dashboard/sell/equipment/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Equipment
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <EquipmentFilters
          onFiltersChange={setFilters}
          initialFilters={filters}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6 mt-6">
          <p className="">
            {loading ? "Loading..." : `${pagination.totalCount} equipment found`}
          </p>
          {pagination.totalCount > 0 && (
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          )}
        </div>

        {/* Equipment Grid/List */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className=" rounded-lg p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-12">
            <div className=" mb-4">
              <Grid className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              No equipment found
            </h3>
            <p className=" mb-6">
              Try adjusting your filters or search terms
            </p>
            {session?.user?.role === "FARMER" && (
              <Link href="/dashboard/sell/equipment/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  List Your Equipment
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? renderEquipmentGrid() : renderEquipmentList()}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
