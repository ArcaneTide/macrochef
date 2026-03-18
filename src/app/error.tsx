"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 mb-6">An unexpected error occurred. Please try again.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
