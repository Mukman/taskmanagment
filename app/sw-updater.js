"use client";

import { useEffect } from "react";

export default function ServiceWorkerUpdater() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let hasReloaded = false;
    const onControllerChange = () => {
      // Fires when a newly deployed service worker takes over. Without this,
      // the page keeps running the old cached version until the person does
      // a full navigation (e.g. logging out and back in) — this makes a
      // normal refresh pick up the update instead.
      if (hasReloaded) return;
      hasReloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  return null;
}
