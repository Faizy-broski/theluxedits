"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteWebsite } from "@/lib/actions/websites/actions";
import type { WebsiteRecord } from "@/lib/types";

interface DeleteWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  website: WebsiteRecord | null;
  onDeleted: (message: string) => void;
}

export function DeleteWebsiteDialog({
  open,
  onOpenChange,
  website,
  onDeleted,
}: DeleteWebsiteDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!website) return;
    startTransition(async () => {
      const result = await deleteWebsite(website.id);
      if (result.success) {
        onOpenChange(false);
        onDeleted(`"${website.name}" deleted successfully!`);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Website?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">{website?.name}</strong>?
            <br />
            This action cannot be undone. Scraped products will remain.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-1 h-4 w-4" />
            )}
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
