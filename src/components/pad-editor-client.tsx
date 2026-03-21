"use client";

import dynamic from "next/dynamic";
import type { PadEditorProps } from "@/components/pad-editor";

const PadEditor = dynamic(() => import("@/components/pad-editor").then((module) => module.PadEditor), {
  ssr: false,
  loading: () => (
    <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
      Carregando editor...
    </section>
  )
});

export function PadEditorClient(props: PadEditorProps) {
  return <PadEditor {...props} />;
}
