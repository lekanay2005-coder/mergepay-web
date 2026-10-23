const MEMO_PREFIX = "MP:";
const MEMO_CODE_RE = /^[A-Za-z0-9-]{1,28}$/;

function explorerBase() {
  const network =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === "testnet" ? "testnet" : "public";
  return `https://stellar.expert/explorer/${network}`;
}

/** Normalize a settlement memo into the canonical MP:<code> format. */
export function formatMemoLabel(value?: string | null): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/^mp:/i, MEMO_PREFIX);
  if (normalized.startsWith(MEMO_PREFIX)) {
    const code = normalized.slice(3).trim();
    return code ? `${MEMO_PREFIX}${code}` : "";
  }

  return `${MEMO_PREFIX}${raw}`;
}

/** Returns true for a canonical settlement memo like MP:dinner-8f3a. */
export function isValidMemo(value?: string | null): boolean {
  const label = formatMemoLabel(value);
  if (!label) return false;
  if (!label.startsWith(MEMO_PREFIX)) return false;
  const code = label.slice(3);
  return MEMO_CODE_RE.test(code);
}

/** Build a Stellar Expert explorer URL for a settlement transaction hash. */
export function memoExplorerUrl(hash: string): string {
  const safeHash = (hash ?? "").trim();
  if (!safeHash) return "#";

  return `${explorerBase()}/tx/${safeHash}`;
}
