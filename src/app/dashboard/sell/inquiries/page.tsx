"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  Package,
  User,
  AlertCircle,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { InquiryStatus } from "@prisma/client";

interface Inquiry {
  id: string;
  message?: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  equipment: {
    id: string;
    title: string;
    condition: string;
    location: string;
    category: string;
    priceCents: number;
    currency: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    whatsappNumber: string;
  };
}

interface Statistics {
  new: number;
  contacted: number;
  inDiscussion: number;
  closed: number;
  purchased: number;
  total: number;
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  IN_DISCUSSION: "bg-orange-100 text-orange-800",
  CLOSED: "bg-gray-100 text-gray-800",
  PURCHASED: "bg-green-100 text-green-800"
};

const statusIcons = {
  NEW: <MessageCircle className="w-4 h-4" />,
  CONTACTED: <Phone className="w-4 h-4" />,
  IN_DISCUSSION: <Clock className="w-4 h-4" />,
  CLOSED: <XCircle className="w-4 h-4" />,
  PURCHASED: <CheckCircle className="w-4 h-4" />
};

export default function SellerInquiriesPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<InquiryStatus>("NEW");
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchInquiries = async () => {
    try {
      const url = filter === "all"
        ? "/api/inquiries/seller"
        : `/api/inquiries/seller?status=${filter}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch inquiries");

      const data = await response.json();
      setInquiries(data.inquiries || []);
      setStatistics(data.statistics || null);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({
        title: "Error",
        description: "Failed to load your inquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === "FARMER") {
      fetchInquiries();
    }
  }, [session, filter]);

  const handleStatusUpdate = async () => {
    if (!selectedInquiry) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/inquiries/seller", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inquiryId: selectedInquiry.id,
          status: selectedStatus,
          response: `Status updated to ${selectedStatus.toLowerCase().replace('_', ' ')}`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Inquiry status updated successfully",
        });

        // Update the inquiry in the list
        setInquiries(prev =>
          prev.map(inquiry =>
            inquiry.id === selectedInquiry.id
              ? { ...inquiry, status: selectedStatus }
              : inquiry
          )
        );

        // Refresh the data to get updated statistics
        await fetchInquiries();

        setUpdateDialogOpen(false);
        setSelectedInquiry(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update inquiry status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openStatusUpdate = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setSelectedStatus(inquiry.status);
    setUpdateDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen ">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
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
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <Link href="/dashboard/sell">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold ">
                  Inquiry Management
                </h1>
                <p className="">
                  Respond to buyer inquiries and manage conversations
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
              <Skeleton className="h-96 w-full" />
            </div>
          ) : statistics && inquiries ? (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.new}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.contacted}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Discussion</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.inDiscussion}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Closed</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.closed}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Purchased</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.purchased}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Inquiries</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_DISCUSSION">In Discussion</option>
                    <option value="CLOSED">Closed</option>
                    <option value="PURCHASED">Purchased</option>
                  </select>
                </div>
              </div>

              {/* Inquiries Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Buyer Inquiries ({inquiries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiries.length > 0 ? inquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {inquiry.equipment.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatPrice(inquiry.equipment.priceCents, inquiry.equipment.currency)} • {inquiry.equipment.location}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium">{inquiry.buyer.name}</div>
                                <div className="text-sm text-gray-500">{inquiry.buyer.whatsappNumber}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate">
                                {inquiry.message || "No message provided"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[inquiry.status]}>
                              {statusIcons[inquiry.status]}
                              <span className="ml-1">
                                {inquiry.status.replace('_', ' ').toLowerCase()}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatDate(inquiry.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusUpdate(inquiry)}
                                className="text-xs px-2 py-1 h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Update Status
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="More Actions"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/equipment/${inquiry.equipment.id}`}
                                      className="flex items-center w-full px-2 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                      <span>View Equipment</span>
                                    </Link>
                                  </DropdownMenuItem>
                                  {inquiry.buyer.whatsappNumber && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={`https://wa.me/${inquiry.buyer.whatsappNumber.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center w-full px-2 py-2 hover:bg-green-50 cursor-pointer"
                                      >
                                        <Phone className="mr-2 h-4 w-4 text-green-600" />
                                        <span className="text-green-700">Contact via WhatsApp</span>
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <MessageCircle className="w-8 h-8 text-gray-400" />
                              <p className="text-gray-500">No inquiries found</p>
                              {filter !== "all" && (
                                <p className="text-sm text-gray-400">
                                  Try changing the filter to see more inquiries
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16  mx-auto mb-4" />
              <h3 className="text-lg font-medium  mb-2">
                Unable to load inquiries
              </h3>
              <p className="">
                There was an error loading your inquiries.
              </p>
              <Button onClick={fetchInquiries}>Try Again</Button>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Dialog */}
      <AlertDialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">Update Inquiry Status</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600">
              Update the status for inquiry from <span className="font-medium text-gray-900">{selectedInquiry?.buyer.name}</span> about <span className="font-medium text-gray-900">"{selectedInquiry?.equipment.title}"</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select New Status
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as InquiryStatus)}
            >
              <option value="NEW" className="bg-blue-50">New - Just received</option>
              <option value="CONTACTED" className="bg-yellow-50">Contacted - Buyer reached out</option>
              <option value="IN_DISCUSSION" className="bg-orange-50">In Discussion - Negotiating terms</option>
              <option value="CLOSED" className="bg-gray-50">Closed - Deal not completed</option>
              <option value="PURCHASED" className="bg-green-50">Purchased - Deal completed</option>
            </select>
          </div>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              ) : (
                "Update Status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  );
}