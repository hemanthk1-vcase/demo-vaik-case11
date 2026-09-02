import React from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { CLAUSES } from "@/lib/termsClauses";

export default function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-primary font-medium hover:underline underline-offset-4">
          Terms of Use &amp; Consents
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" /> Terms of Use &amp; Consents
          </DialogTitle>
          <DialogDescription>
            Please review the following terms governing your use of the Vakil Case platform.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
            {CLAUSES.map((c) => (
              <div key={c.title}>
                <div className="font-semibold text-foreground">{c.title}</div>
                <p className="mt-1">{c.body}</p>
              </div>
            ))}
            <p className="italic">
              By checking the consent box on the registration form, the User acknowledges having read,
              understood and accepted each of the foregoing clauses.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}