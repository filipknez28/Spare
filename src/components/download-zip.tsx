import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ZIP_HREF = "/spare.zip";

export function DownloadZipButton({
  className,
  label = "Download Spare.zip",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button asChild variant="secondary" size="lg" className={cn("w-full", className)}>
      <a href={ZIP_HREF} download="Spare.zip">
        <Download />
        {label}
      </a>
    </Button>
  );
}

export function DownloadZipIcon({ className }: { className?: string }) {
  return (
    <Button asChild variant="secondary" className={className}>
      <a href={ZIP_HREF} download="Spare.zip" aria-label="Download Spare.zip">
        <Download />
        Zip
      </a>
    </Button>
  );
}
