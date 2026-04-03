"use client";

import { useEffect, useState } from "react";

type PadViewCounterProps = {
  slug: string;
  initialViewCount: number;
};

type ViewResponse = {
  viewCount: number;
};

function formatViewLabel(viewCount: number) {
  const count = new Intl.NumberFormat("pt-BR").format(viewCount);
  return `${count} ${viewCount === 1 ? "visualizacao" : "visualizacoes"}`;
}

export function PadViewCounter({ slug, initialViewCount }: PadViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialViewCount);

  useEffect(() => {
    let active = true;

    async function registerView() {
      const response = await fetch(`/api/pads/${slug}/view`, {
        method: "POST",
        cache: "no-store"
      });

      if (!response.ok) return;

      const payload = (await response.json()) as ViewResponse;
      if (active) {
        setViewCount(payload.viewCount);
      }
    }

    void registerView();

    return () => {
      active = false;
    };
  }, [slug]);

  return <span className="text-sm font-medium text-slate-500">({formatViewLabel(viewCount)})</span>;
}
