"use client";

import { useEffect } from "react";
import { GuestModeBanner } from "@/app/components/GuestModeBanner";
import { usePantryStore } from "@/store/usePantryStore";

export interface GuestModeGateProps {
  isAuthenticated: boolean;
}

/**
 * Keeps the pantry store in sync with the server auth prop: clears the cached
 * user id after sign-out so guest CRUD uses localStorage again, and shows the
 * guest banner while unauthenticated.
 */
export function GuestModeGate({ isAuthenticated }: GuestModeGateProps) {
  const enterGuestSession = usePantryStore((state) => state.enterGuestSession);

  useEffect(() => {
    if (!isAuthenticated) {
      enterGuestSession();
    }
  }, [isAuthenticated, enterGuestSession]);

  if (isAuthenticated) {
    return null;
  }

  return <GuestModeBanner />;
}
