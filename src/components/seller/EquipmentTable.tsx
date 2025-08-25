"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  MoreHorizontal,
  Eye,
  Trash2,
  MessageCircle,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
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

interface EquipmentTableProps {
  equipment: Equipment[];
  onDelete: (equipment: Equipment) => Promise<void>;
  onRefresh: () => void;
}

const conditionColors = {
  NEW: "bg-green-100 text-green-800",
  USED: "bg-yellow-100 text-yellow-800",
  REFURBISHED: "bg-blue-100 text-blue-800"
};

export function EquipmentTable({ equipment, onDelete, onRefresh }: EquipmentTableProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  const handleDeleteClick = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    try {
      await onDelete(equipmentToDelete);
      setDeleteDialogOpen(false);
      setEquipmentToDelete(null);
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const getInquiryStats = (inquiries?: Equipment["inquiries"]) => {
    if (!inquiries) return { total: 0, new: 0 };

    const total = inquiries.length;
    const newCount = inquiries.filter(inquiry => inquiry.status === "NEW").length;

    return { total, new: newCount };
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Inquiries</TableHead>
                <TableHead>Listed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(equipment) && equipment.length > 0 ? equipment.map((item) => {
                const inquiryStats = getInquiryStats(item.inquiries);
                const mainImage = item.images?.[0];
                const formattedPrice = formatPrice(item.priceCents, item.currency);
                const listedDate = new Date(item.createdAt).toLocaleDateString();

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12  rounded overflow-hidden flex-shrink-0">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "";
                                target.className = "w-full h-full flex items-center justify-center";
                                const icon = document.createElement("div");
                                icon.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                                target.appendChild(icon);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {item.category}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-400 line-clamp-1">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formattedPrice}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={conditionColors[item.condition as keyof typeof conditionColors] || ""}>
                        {item.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm ">{item.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{inquiryStats.total}</span>
                        {inquiryStats.new > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {inquiryStats.new} new
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm ">{listedDate}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/equipment/${item.slug}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/sell/equipment/${item.id}/edit`} className="flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/sell/inquiries?equipmentId=${item.id}`} className="flex items-center">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              View Inquiries
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-gray-500">No equipment listings found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{equipmentToDelete?.title}"? This action cannot be undone.
              {equipmentToDelete && getInquiryStats(equipmentToDelete.inquiries).total > 0 && (
                <span className="block mt-2 text-yellow-600">
                  Warning: This equipment has {getInquiryStats(equipmentToDelete.inquiries).total} inquiry(ies) that will also be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
