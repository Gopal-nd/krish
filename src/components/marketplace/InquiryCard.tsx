"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Calendar, User, MapPin } from "lucide-react";
import { InquiryStatus } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { createEquipmentWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";

interface InquiryCardProps {
  inquiry: {
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
  };
  onWhatsAppClick?: () => void;
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  IN_DISCUSSION: "bg-orange-100 text-orange-800",
  CLOSED: "bg-gray-100 text-gray-800",
  PURCHASED: "bg-green-100 text-green-800"
};

const statusLabels = {
  NEW: "New Inquiry",
  CONTACTED: "Contacted",
  IN_DISCUSSION: "In Discussion",
  CLOSED: "Closed",
  PURCHASED: "Purchased"
};

export function InquiryCard({ inquiry, onWhatsAppClick }: InquiryCardProps) {
  const timeAgo = new Date(inquiry.createdAt).toLocaleDateString();
  const mainImage = inquiry.equipment.images?.[0] || "/placeholder-equipment.jpg";
  const formattedPrice = formatPrice(inquiry.equipment.priceCents, inquiry.equipment.currency);

  const handleWhatsAppClick = () => {
    if (!inquiry.seller.whatsappNumber) return;

    const whatsappLink = createEquipmentWhatsAppLink(
      {
        title: inquiry.equipment.title,
        condition: inquiry.equipment.condition as any,
        location: inquiry.equipment.location,
        category: inquiry.equipment.category
      },
      inquiry.seller.whatsappNumber,
      "a buyer"
    );

    if (whatsappLink) {
      window.open(whatsappLink, "_blank");
    }

    onWhatsAppClick?.();
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <Link href={`/equipment/${inquiry.equipment.slug}`}>
              <CardTitle className="text-lg hover:text-blue-600 line-clamp-2">
                {inquiry.equipment.title}
              </CardTitle>
            </Link>
            <p className="text-lg font-bold text-green-600 mt-1">
              {formattedPrice}
            </p>
          </div>
          <Badge className={statusColors[inquiry.status]}>
            {statusLabels[inquiry.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Equipment Image */}
        <div className="flex gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <img
              src={mainImage}
              alt={inquiry.equipment.title}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-equipment.jpg";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            {/* Equipment Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {inquiry.equipment.location}
              </span>
              <Badge variant="outline" className="text-xs">
                {inquiry.equipment.condition}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {inquiry.equipment.category}
              </Badge>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-3 h-3" />
              <span>Seller: {inquiry.seller?.name}</span>
            </div>

            {/* Inquiry Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>Inquired on: {timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Inquiry Message */}
        {inquiry?.message && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Your message:</strong> {inquiry.message}
            </p>
          </div>
        )}

        {/* Status Message */}
        <div className="text-sm">
          {inquiry.status === "NEW" && (
            <p className="text-blue-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Your inquiry has been sent. The seller will contact you soon.
            </p>
          )}
          {inquiry.status === "CONTACTED" && (
            <p className="text-yellow-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              The seller has been contacted. Follow up via WhatsApp for updates.
            </p>
          )}
          {inquiry.status === "IN_DISCUSSION" && (
            <p className="text-orange-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              You're in discussion with the seller. Continue the conversation via WhatsApp.
            </p>
          )}
          {inquiry.status === "CLOSED" && (
            <p className="text-gray-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              This inquiry has been closed.
            </p>
          )}
          {inquiry.status === "PURCHASED" && (
            <p className="text-green-600 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Congratulations! You purchased this equipment.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {inquiry?.seller?.whatsappNumber && (
          <div className="flex gap-2">
            <Button
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              size="sm"
            >
              <Phone className="w-4 h-4 mr-2" />
              Open WhatsApp
            </Button>
            <Link href={`/equipment/${inquiry.equipment.slug}`}>
              <Button variant="outline" size="sm">
                View Equipment
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
