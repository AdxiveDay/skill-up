"use client";

import { useEffect } from "react";

export default function ExpTicker() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/exp/tick", { method: "POST" });
    }, 60000); // 1 นาที

    return () => clearInterval(interval);
  }, []);

  return null;
}
