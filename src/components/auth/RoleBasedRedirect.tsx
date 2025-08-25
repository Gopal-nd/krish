"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@prisma/client";

interface RoleBasedRedirectProps {
  redirectTo?: {
    [UserRole.CONSUMER]?: string;
    [UserRole.FARMER]?: string;
  };
  defaultRedirect?: string;
}

export function RoleBasedRedirect({
  redirectTo = {},
  defaultRedirect = "/dashboard"
}: RoleBasedRedirectProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    const userRole = session.user.role as UserRole;

    // Determine redirect destination based on role
    let redirectPath = defaultRedirect;

    if (userRole === UserRole.FARMER && redirectTo[UserRole.FARMER]) {
      redirectPath = redirectTo[UserRole.FARMER] as string;
    } else if (userRole === UserRole.CONSUMER && redirectTo[UserRole.CONSUMER]) {
      redirectPath = redirectTo[UserRole.CONSUMER] as string;
    } else {
      // Default role-based redirects
      switch (userRole) {
        case UserRole.FARMER:
          redirectPath = "/sell";
          break;
        case UserRole.CONSUMER:
          redirectPath = "/equipment";
          break;
        default:
          redirectPath = "/dashboard";
      }
    }

    router.push(redirectPath);
  }, [session, status, router, redirectTo, defaultRedirect]);

  return null; // This component doesn't render anything
}
