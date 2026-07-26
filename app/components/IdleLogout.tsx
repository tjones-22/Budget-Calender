"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export default function IdleLogout() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function resetTimer() {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        void signOut({
          callbackUrl: "/login",
        });
      }, IDLE_TIMEOUT_MS);
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);

      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
}
