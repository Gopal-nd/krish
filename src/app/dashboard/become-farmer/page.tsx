"use client";

import { useSession } from "next-auth/react";
import { RoleUpgradeUI } from "@/components/auth/RoleUpgradeUI";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export default function BecomeFarmerPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to continue
          </h1>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAlreadyFarmer = session.user.role === UserRole.FARMER;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/marketplace">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold ">
            Become a Farmer on Krishi
          </h1>
          <p className="mt-2">
            Join our agricultural marketplace and start selling your equipment
          </p>
        </div>
      </div>

      {/* Role Upgrade UI */}
      <div className="mb-8">
        <RoleUpgradeUI
          currentUser={{
            id: session.user.id,
            role: session.user.role as UserRole,
            name: session.user.name || undefined,
            whatsappNumber: session.user.whatsappNumber || undefined
          }}
          onUpgradeSuccess={() => {
            // Refresh the page to update the session
            window.location.reload();
          }}
        />
      </div>

      {/* Success State for Farmers */}
      {isAlreadyFarmer && (
        <div className="space-y-6">
          <Card className="">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold ">
                    Welcome back, Farmer {session.user.name}!
                  </h3>
                  <p className="">
                    You're all set to buy and sell agricultural equipment.
                  </p>
                </div>
              </div>
              <Badge className="">
                Farmer Account Active
              </Badge>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  List Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create detailed listings for your agricultural equipment and reach interested buyers.
                </p>
                <Link href="/dashboard/sell/equipment/new">
                  <Button className="w-full">
                    Add Equipment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Manage Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Respond to buyer inquiries and track your sales conversations.
                </p>
                <Link href="/dashboard/sell/inquiries">
                  <Button variant="outline" className="w-full">
                    View Inquiries
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Seller Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  View your sales performance, analytics, and marketplace insights.
                </p>
                <Link href="/dashboard/sell">
                  <Button variant="outline" className="w-full">
                    Seller Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Farmer Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Farmer Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Direct Buyer Communication</h4>
                    <p className="text-sm text-gray-600">Connect directly with buyers via WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">No Commission Fees</h4>
                    <p className="text-sm text-gray-600">List and sell your equipment for free</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Analytics & Insights</h4>
                    <p className="text-sm text-gray-600">Track inquiry trends and optimize listings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium">Equipment Management</h4>
                    <p className="text-sm text-gray-600">Easily manage and update your listings</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
