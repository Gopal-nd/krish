"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MessageCircle,
  Plus,
  ShoppingBag,
  Users,
  Settings,
  UserCheck,
  TrendingUp
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface RoleBasedNavProps {
  variant?: "horizontal" | "vertical";
  showLabels?: boolean;
}

export function RoleBasedNav({ variant = "horizontal", showLabels = true }: RoleBasedNavProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const navigationItems = {
    common: [
      {
        href: "/equipment",
        label: "Browse Equipment",
        icon: ShoppingBag,
        description: "Find agricultural equipment"
      },
    ],
    consumer: [
      {
        href: "/inquiries",
        label: "My Inquiries",
        icon: MessageCircle,
        description: "Track your equipment inquiries"
      },
    ],
    farmer: [
      {
        href: "/sell",
        label: "Seller Dashboard",
        icon: Package,
        description: "Manage your equipment listings"
      },
      {
        href: "/sell/equipment",
        label: "My Equipment",
        icon: Package,
        description: "Manage your listings"
      },
      {
        href: "/sell/inquiries",
        label: "Seller Inquiries",
        icon: MessageCircle,
        description: "Respond to buyer inquiries"
      },
      {
        href: "/sell/equipment/new",
        label: "Add Equipment",
        icon: Plus,
        description: "List new equipment for sale"
      },
    ]
  };

  const getNavItems = () => {
    const items = [...navigationItems.common];

    if (userRole === UserRole.FARMER) {
      items.push(...navigationItems.farmer);
    } else if (userRole === UserRole.CONSUMER) {
      items.push(...navigationItems.consumer);
    }

    return items;
  };

  const navItems = getNavItems();

  if (variant === "vertical") {
    return (
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3"
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              {showLabels && (
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              )}
            </Button>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <item.icon className="w-4 h-4" />
            {showLabels && item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
