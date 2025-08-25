'use client'
import { User } from "next-auth";
import { FC, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { signOut } from "next-auth/react";
import UserAvatarProps from "./UserAvatarProps";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { UserRole } from "@prisma/client";
import {
  User as UserIcon,
  Package,
  MessageCircle,
  Settings,
  LogOut,
  TrendingUp,
  Plus,
  ShoppingBag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserAccounNavProps {
  user: Pick<User, "id" | "email" | "name" | "image"> & {
    role?: string;
    whatsappNumber?: string;
  };
}

const UserAccounNav: FC<UserAccounNavProps> = ({ user }) => {
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleRoleUpgrade = async () => {
    if (user.role === UserRole.FARMER) return;

    setIsUpgrading(true);
    try {
      const response = await fetch('/api/seller/become', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade role');
      }

      const data = await response.json();
      toast({
        title: "Success!",
        description: "You are now a farmer! You can start listing equipment.",
      });

      // Reload the page to refresh the session
      window.location.reload();
    } catch (error) {
      console.error('Error upgrading role:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade to farmer role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.FARMER:
        return "bg-green-100 text-green-800";
      case UserRole.CONSUMER:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case UserRole.FARMER:
        return "Farmer";
      case UserRole.CONSUMER:
        return "Consumer";
      default:
        return "User";
    }
  };

  const farmerMenuItems = [
    { href: "/dashboard/sell", label: "Seller Dashboard", icon: TrendingUp },
    { href: "/dashboard/sell/equipment", label: "My Equipment", icon: Package },
    { href: "/dashboard/sell/inquiries", label: "Seller Inquiries", icon: MessageCircle },
    { href: "/dashboard/sell/equipment/new", label: "Add Equipment", icon: Plus },
  ];

  const consumerMenuItems = [
    { href: "/equipment", label: "Browse Equipment", icon: ShoppingBag },
    { href: "/inquiries", label: "My Inquiries", icon: MessageCircle },
  ];

  const menuItems = user.role === UserRole.FARMER ? farmerMenuItems : consumerMenuItems;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatarProps
          user={{ name: user.name || null, image: user.image || null }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <div className="flex p-3 items-center justify-start gap-3">
          <UserAvatarProps
            user={{ name: user.name || null, image: user.image || null }}
            className="w-10 h-10"
          />
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && <p className="w-[200px] text-sm text-muted-foreground truncate">
              {user.email}
            </p>}
            <Badge className={getRoleBadgeColor(user.role || '')}>
              {getRoleDisplayName(user.role || '')}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Role-specific menu items */}
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Role upgrade option for consumers */}
        {user.role === UserRole.CONSUMER && (
          <DropdownMenuItem asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleRoleUpgrade}
              disabled={isUpgrading}
            >
              {isUpgrading ? "Upgrading..." : "Become a Farmer"}
            </Button>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={(event) => {
          event.preventDefault();
          signOut({
            callbackUrl: `${window.location.origin}/login`
          });
        }} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccounNav;