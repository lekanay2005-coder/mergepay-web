import { ExternalLink } from "lucide-react";
import { Badge } from "./badge";
import { formatMemoLabel, isValidMemo, memoExplorerUrl } from "@/lib/memo";

export function MemoChip({
  memo,
  hash,
  className,
}: {
  memo?: string | null;
  hash?: string | null;
  className?: string;
}) {
  const value = memo ? formatMemoLabel(memo) : "";
  const valid = Boolean(value && isValidMemo(value));
  const url = hash ? memoExplorerUrl(hash) : undefined;

  const content = (
    <Badge
      tone={valid ? "aqua" : "paper"}
      className={className}
      aria-label={value ? `Settlement memo ${value}` : "No settlement memo"}
    >
      {value || "No memo"}
      {url && <ExternalLink className="h-3 w-3" aria-hidden="true" />}
    </Badge>
  );

  if (!url || !valid) return content;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex"
      aria-label={`Open settlement memo ${value} on Stellar explorer`}
    >
      {content}
    </a>
  );
}
