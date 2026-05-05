export const ACCOUNT_ID_KEY = "meet_and_study_account_id";

export function getAccountIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCOUNT_ID_KEY);
}

export function setAccountIdInStorage(accountId: string | null) {
  if (typeof window === "undefined") return;
  if (!accountId) window.localStorage.removeItem(ACCOUNT_ID_KEY);
  else window.localStorage.setItem(ACCOUNT_ID_KEY, accountId);
}

