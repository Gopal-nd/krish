"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import UserAvatarProps  from "@/components/UserAvatarProps";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatarProps user={session.user} />
        <span className="text-sm text-gray-700">{session.user.name}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("google")} className="flex items-center gap-2">
      <User className="w-4 h-4" />
      Sign In
    </Button>
  );
}
