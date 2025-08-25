"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  User,
  CheckCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  Award,
  FileText,
  ExternalLink
} from "lucide-react";
import { EquipmentCondition, CertificationStatus, CertificationStandard } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { createEquipmentWhatsAppLink } from "@/lib/whatsapp";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Certification {
  id: string;
  certificationNumber: string;
  standard: CertificationStandard;
  certifyingBody: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  status: CertificationStatus;
}

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
    email: string;
    whatsappNumber?: string;
  };
  inquiries?: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
  certifications?: Certification[];
}

interface RouteParams {
  params: { slug: string };
}

const getCertificationDisplayName = (standard: string): string => {
  const displayNames: { [key: string]: string } = {
    "ISO_9001": "ISO 9001 - Quality Management",
    "AGMARK": "AGMARK - Agricultural Marketing",
    "FSSAI": "FSSAI - Food Safety",
    "GMP": "GMP - Good Manufacturing Practice",
    "HACCP": "HACCP - Food Safety Management",
    "ORGANIC_CERTIFICATION": "Organic Certification",
    "EXPORT_CERTIFICATE": "Export Certificate",
    "QUALITY_ASSURANCE": "Quality Assurance",
    "SAFETY_CERTIFICATE": "Safety Certificate",
    "ENVIRONMENTAL_CERTIFICATION": "Environmental Certification"
  };
  return displayNames[standard] || standard;
};

export default function EquipmentDetailsPage({ params }: RouteParams) {
  const { slug } = params;
  const { data: session } = useSession();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [hasExistingInquiry, setHasExistingInquiry] = useState(false);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment/${slug}`);
      if (!response.ok) throw new Error("Failed to fetch equipment");

      const data = await response.json();
      setEquipment(data);

      // Check if user already has an inquiry for this equipment
      if (session?.user && data.inquiries) {
        const existingInquiry = data.inquiries.find(
          (inquiry: any) => inquiry.status !== "CLOSED"
        );
        setHasExistingInquiry(!!existingInquiry);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [slug]);

  const handleWhatsAppContact = () => {
    if (!equipment?.seller.whatsappNumber) return;

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

  const handleSendInquiry = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send inquiries",
        variant: "destructive",
      });
      return;
    }

    if (!inquiryMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for your inquiry",
        variant: "destructive",
      });
      return;
    }

    setSendingInquiry(true);
    try {
      const response = await fetch(`/api/equipment/${equipment?.slug}/inquire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inquiryMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send inquiry");
      }

      const data = await response.json();

      toast({
        title: "Inquiry Sent",
        description: "Your inquiry has been sent to the seller",
      });

      setInquiryMessage("");
      setHasExistingInquiry(true);

      // Open WhatsApp if link is provided
      if (data.whatsappLink) {
        window.open(data.whatsappLink, "_blank");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send inquiry",
        variant: "destructive",
      });
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen ">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link href="/dashboard/equipment">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Equipment
            </Button>
          </Link>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16  mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              Equipment Not Found
            </h2>
            <p className=" mb-6">
              The equipment you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/dashboard/equipment">
              <Button>Browse Equipment</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const conditionColors = {
    NEW: "bg-green-100 text-green-800",
    USED: "bg-yellow-100 text-yellow-800",
    REFURBISHED: "bg-blue-100 text-blue-800"
  };

  const isOwner = session?.user?.id === equipment.seller.id;
  const canContact = session?.user && !isOwner;

  return (
    <div className="min-h-screen ">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/dashboard/equipment">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Equipment
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Images */}
          <div className="space-y-4">
            <div className="aspect-video  rounded-lg overflow-hidden">
              <img
                src={equipment.images?.[0] || "/placeholder-equipment.jpg"}
                alt={equipment.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-equipment.jpg";
                }}
              />
            </div>
            {equipment.images && equipment.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {equipment.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square  rounded overflow-hidden">
                    <img
                      src={image}
                      alt={`${equipment.title} ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-equipment.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipment Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {equipment.title}
              </h1>
              <div className="flex items-center gap-4 ">
                <Badge className={conditionColors[equipment.condition]}>
                  {equipment.condition}
                </Badge>
                <Badge variant="outline">{equipment.category}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-green-600">
              {formatPrice(equipment.priceCents, equipment.currency)}
            </div>

            {/* Location and Date */}
            <div className="flex items-center gap-6 ">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{equipment.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(equipment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{equipment.seller.name}</p>
                <p className="text-sm text-gray-600">
                  <p>Email: {equipment.seller.email}</p>
                </p>
                {equipment.seller.whatsappNumber && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    WhatsApp available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {equipment.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {equipment.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {equipment.certifications && equipment.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Certifications & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>This equipment is certified and meets industry standards</span>
                    </div>

                    <div className="grid gap-3">
                      {equipment.certifications
                     
                        .map((certification) => (
                          <div
                            key={certification.id}
                            className="border border-green-200 rounded-lg p-4 bg-green-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-100 text-green-800 border-green-300">
                                    <Award className="w-3 h-3 mr-1" />
                                    {getCertificationDisplayName(certification.standard.toString())}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Certificate Number:</span>
                                    <p className="text-gray-600 font-mono">{certification.certificationNumber}</p>
                                  </div>

                                  <div>
                                    <span className="font-medium text-gray-700">Certifying Body:</span>
                                    <p className="text-gray-600">{certification.certifyingBody}</p>
                                  </div>

                                  <div>
                                    <span className="font-medium text-gray-700">Issue Date:</span>
                                    <p className="text-gray-600">
                                      {new Date(certification.issueDate).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div>
                                    <span className="font-medium text-gray-700">Expiry Date:</span>
                                    <p className="text-gray-600">
                                      {new Date(certification.expiryDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {certification.documentUrl && (
                                  <div className="mt-3">
                                    <a
                                      href={certification.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      <FileText className="w-4 h-4" />
                                      View Certificate Document
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                   
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Actions */}
            {canContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Seller
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasExistingInquiry ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>You have already sent an inquiry for this equipment</span>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Enter your message to the seller..."
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSendInquiry}
                          disabled={sendingInquiry || !inquiryMessage.trim()}
                          className="flex-1"
                        >
                          {sendingInquiry ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Inquiry
                            </>
                          )}
                        </Button>
                        {equipment.seller.whatsappNumber && (
                          <Button
                            onClick={handleWhatsAppContact}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">
                    This is your equipment listing gg
                  </p>
                </CardContent>
              </Card>
            )}

            {!session?.user && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 mb-4">
                    Please sign in to contact the seller
                  </p>
                  <Link href="/dashboard/login">
                    <Button className="w-full">Sign In</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
