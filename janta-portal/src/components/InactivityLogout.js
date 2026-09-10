"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "@/hooks/useSession";

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export default function InactivityLogout() {
  const { session } = useSession();
  const timeoutRef = useRef(null);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/logout", { method: "GET", credentials: "include" });
    } finally {
      window.location.href = "/?loggedout=inactivity";
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!session) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(logout, INACTIVITY_MS);
  }, [session, logout]);

  useEffect(() => {
    if (!session) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    resetTimer();

    const handleActivity = () => resetTimer();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity);
    }

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, resetTimer]);

  return null;
}
