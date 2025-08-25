"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Package,
  MessageCircle,
  Phone,
  TrendingUp,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@prisma/client";

interface RoleUpgradeUIProps {
  currentUser: {
    id: string;
    role: UserRole;
    name?: string;
    whatsappNumber?: string;
  };
  onUpgradeSuccess?: () => void;
}

export function RoleUpgradeUI({ currentUser, onUpgradeSuccess }: RoleUpgradeUIProps) {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.whatsappNumber || "");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");

  const handleUpgrade = async () => {
    if (currentUser.role === UserRole.FARMER) return;

    setIsUpgrading(true);
    try {
      // Update user WhatsApp number if provided
      if (whatsappNumber && whatsappNumber !== currentUser.whatsappNumber) {
        await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            whatsappNumber: whatsappNumber,
          }),
        });
      }

      // Upgrade to farmer role
      const response = await fetch('/api/seller/become', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experience,
          reason,
          whatsappNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upgrade role');
      }

      const data = await response.json();
      toast({
        title: "🎉 Welcome to Krishi Equipment Marketplace!",
        description: "You are now a farmer! You can start listing your equipment for sale.",
      });

      setShowDialog(false);
      onUpgradeSuccess?.();
    } catch (error) {
      console.error('Error upgrading role:', error);
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Failed to upgrade to farmer role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (currentUser.role === UserRole.FARMER) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                You are a Farmer!
              </h3>
              <p className="text-green-700">
                You can now list equipment for sale and manage your agricultural marketplace presence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const benefits = [
    {
      icon: Package,
      title: "List Equipment for Sale",
      description: "Create detailed listings for your tractors, harvesters, and farming equipment"
    },
    {
      icon: MessageCircle,
      title: "Direct Buyer Communication",
      description: "Connect directly with interested buyers via WhatsApp for faster deals"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Track inquiry trends and optimize your listings for better sales"
    },
    {
      icon: Phone,
      title: "WhatsApp Integration",
      description: "Receive instant notifications and communicate seamlessly with buyers"
    }
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          Become a Farmer on Krishi
        </CardTitle>
        <p className="text-blue-700">
          Join thousands of farmers selling agricultural equipment. Turn your equipment into income!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-3">
              <benefit.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">{benefit.title}</h4>
                <p className="text-sm text-blue-700">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade Button */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Package className="w-4 h-4 mr-2" />
              Become a Farmer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upgrade to Farmer Account</DialogTitle>
              <DialogDescription>
                Fill in your details to start selling agricultural equipment on Krishi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* WhatsApp Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number (Required)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-gray-600">
                  Buyers will contact you directly via WhatsApp for inquiries
                </p>
              </div>

              {/* Farming Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">Farming Experience (Optional)</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your farming background or equipment expertise..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Reason for Joining */}
              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want to sell equipment? (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Upgrading equipment, seasonal sales, etc..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700">
                  By upgrading to a farmer account, you agree to provide accurate equipment information and respond promptly to buyer inquiries.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading || !whatsappNumber.trim()}
                className="flex-1"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  "Upgrade to Farmer"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Info */}
        <div className="bg-white/50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your account will be upgraded immediately</li>
            <li>• You can start listing equipment right away</li>
            <li>• Buyers will be able to contact you via WhatsApp</li>
            <li>• You'll get access to seller analytics and insights</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
