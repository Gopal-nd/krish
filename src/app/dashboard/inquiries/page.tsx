"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { InquiryCard } from "@/components/marketplace/InquiryCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Phone, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { InquiryStatus } from "@prisma/client";

interface Inquiry {
  id: string;
  message?: string;
  status: InquiryStatus;
  createdAt: string;
  equipment: {
    id: string;
    title: string;
    slug: string;
    priceCents: number;
    currency: string;
    condition: string;
    location: string;
    category: string;
    images: string[];
  };
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

export default function InquiriesPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  });

  const fetchInquiries = async (type: "sent" | "received" = "sent", page: number = 1) => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/inquiries?${params}`);
      if (!response.ok) throw new Error("Failed to fetch inquiries");

      const data = await response.json();
      setInquiries(data.inquiries || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({
        title: "Error",
        description: "Failed to load inquiries",
        variant: "destructive",
      });
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchInquiries(activeTab, 1);
    }
  }, [session, activeTab, statusFilter]);

  const handlePageChange = (newPage: number) => {
    fetchInquiries(activeTab, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    // Reset to page 1 when filter changes
    fetchInquiries(activeTab, 1);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/dashboard/sell">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16  mx-auto mb-4" />
            <h2 className="text-2xl font-semibold  mb-2">
              Authentication Required
            </h2>
            <p className="">
              Please sign in to view your inquiries.
            </p>
            <Link href="/dashboard/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "NEW", label: "New" },
    { value: "CONTACTED", label: "Contacted" },
    { value: "IN_DISCUSSION", label: "In Discussion" },
    { value: "CLOSED", label: "Closed" },
    { value: "PURCHASED", label: "Purchased" }
  ];

  const statusCounts = inquiries.reduce((acc, inquiry) => {
    acc[inquiry.status] = (acc[inquiry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold  mb-2">
              My Inquiries
            </h1>
            <p className="">
              Track your equipment inquiries and communications
            </p>
          </div>
          <Link href="/dashboard/equipment">
            <Button variant="outline">
              Browse Equipment
            </Button>
          </Link>
        </div>

        {/* Tabs for sent/received inquiries */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "sent" | "received")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Sent Inquiries
              {/* {Object.keys(statusCounts).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {inquiries.length}
                </Badge>
              )} */}
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Received Responses
              {/* {Object.keys(statusCounts).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {inquiries.length}
                </Badge>
              )} */}
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 mt-6">
            <div className="w-48">
            <Select value={statusFilter || undefined} onValueChange={handleStatusFilterChange}>
  <SelectTrigger>
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    {statusOptions
      .filter(option => option.value !== "")
      .map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
            </div>
            {statusFilter && (
              <Button variant="outline" size="sm" onClick={() => handleStatusFilterChange("")}>
                Clear Filter
              </Button>
            )}
          </div>

          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16  mx-auto mb-4" />
                <h3 className="text-lg font-medium  mb-2">
                  No inquiries found
                </h3>
                <p className="">
                  {statusFilter
                    ? `You have no ${statusFilter.toLowerCase()} inquiries.`
                    : "You haven't sent any inquiries yet."
                  }
                </p>
                <Link href="/dashboard/equipment">
                  <Button>Browse Equipment</Button>
                </Link>
              </div>
            ) : (
              <>
                {inquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                  />
                ))}

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
          </TabsContent>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-16 h-16  mx-auto mb-4" />
                <h3 className="text-lg font-medium  mb-2">
                  No responses received
                </h3>
                <p className="">
                  You haven't received any responses to your inquiries yet.
                </p>
                <Link href="/dashboard/equipment">
                  <Button>Browse More Equipment</Button>
                </Link>
              </div>
            ) : (
              <>
                {inquiries.map((inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                  />
                ))}

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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
