"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { setAccountIdInStorage } from "@/lib/auth";
import { useStore } from "@/store/useStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const upsert = useMutation(api.auth.upsertProfileFromGoogle);
  const { setAccountId } = useStore();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const accountId = params.get("accountId");
      const email = params.get("email") || undefined;
      const name = params.get("name") || "Student";
      const avatarUrl = params.get("avatarUrl") || undefined;

      if (!accountId) {
        router.replace("/app");
        return;
      }
      await upsert({ accountId, email, name, avatarUrl });
      setAccountId(accountId);
      setAccountIdInStorage(accountId);
      router.replace("/dashboard");
    };
    void run();
  }, [router, upsert, setAccountId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas">
      <p className="text-body text-ink-muted">Signing you in...</p>
    </main>
  );
}
