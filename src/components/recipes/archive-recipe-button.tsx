"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { archiveRecipe } from "@/app/(main)/recipes/actions";
import { t, type Lang } from "@/lib/translations";

export function ArchiveRecipeButton({ id, title, lang }: { id: string; title: string; lang: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveRecipe(id);
      if (result.success) {
        router.push("/recipes");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5"
        >
          <Archive className="h-3.5 w-3.5" />
          {t("Archive", lang)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Archive recipe?", lang)}</DialogTitle>
          <DialogDescription>
            &ldquo;{title}&rdquo; — {t("Archive recipe confirm", lang)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            {t("Cancel", lang)}
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {t("Archive", lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
