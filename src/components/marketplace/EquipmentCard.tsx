"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Calendar, Phone } from "lucide-react";
import { EquipmentCondition } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface EquipmentCardProps {
  equipment: {
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
  };
  showWhatsApp?: boolean;
  onWhatsAppClick?: () => void;
}

const conditionColors = {
  NEW: "bg-green-100 text-green-800",
  USED: "bg-yellow-100 text-yellow-800",
  REFURBISHED: "bg-blue-100 text-blue-800"
};

export function EquipmentCard({
  equipment,
  showWhatsApp = false,
  onWhatsAppClick
}: EquipmentCardProps) {
  const mainImage = equipment.images?.[0] || "/placeholder-equipment.jpg";
  const formattedPrice = formatPrice(equipment.priceCents, equipment.currency);
  const timeAgo = new Date(equipment.createdAt).toLocaleDateString();

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <img
            src={mainImage}
            alt={equipment.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-equipment.jpg";
            }}
          />
          <Badge
            className={`absolute top-2 right-2 ${conditionColors[equipment.condition]}`}
          >
            {equipment.condition}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          <Link href={`/equipment/${equipment.slug}`}>
            <h3 className="text-lg font-semibold hover:text-blue-600 line-clamp-2">
              {equipment.title}
            </h3>
          </Link>

          <p className="text-xl font-bold text-green-600">
            {formattedPrice}
          </p>

          {equipment.description && (
            <p className=" text-sm line-clamp-1  ">
              {equipment.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{equipment.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{equipment.category}</Badge>
          </div>

          <div className="text-sm text-gray-600">
            Seller: <span className="font-medium">{equipment.seller.name}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Link href={`/dashboard/equipment/${equipment.slug}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>

          {showWhatsApp && equipment.seller.whatsappNumber && (
            <Button
              onClick={onWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
