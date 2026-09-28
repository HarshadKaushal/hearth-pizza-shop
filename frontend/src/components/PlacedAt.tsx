"use client";

import { useEffect, useState } from "react";

export function PlacedAt({ iso }: { iso: string }) {
  const [label, setLabel] = useState(iso);

  useEffect(() => {
    setLabel(
      new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso)),
    );
  }, [iso]);

  return <span>{label}</span>;
}
