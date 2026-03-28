import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-xl font-semibold text-slate-800 mb-2">Page not found</p>
        <p className="text-slate-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/home">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
