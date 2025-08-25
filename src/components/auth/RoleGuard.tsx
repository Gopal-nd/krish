"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { Loader } from "@/components/weather/Loader";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: string;
  fallback?: ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loader />;
  }

  if (!session?.user) {
    return fallback || <div className="p-4 text-center">Please sign in to access this content.</div>;
  }

  if (session.user.role !== requiredRole) {
    return fallback || (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-2">Access Denied</p>
        <p className="text-gray-600">You need {requiredRole} role to access this content.</p>
      </div>
    );
  }

  return <>{children}</>;
}
