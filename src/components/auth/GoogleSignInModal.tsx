"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";

const DEMO_ACCOUNTS = [
  { email: "alex.rivera@gmail.com", name: "Alex Rivera" },
  { email: "sam.chen@gmail.com", name: "Sam Chen" },
];

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6c1.9-5.6 7.1-9.8 13.7-9.8z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.3 28.7c-.5-1.4-.7-2.9-.7-4.7s.3-3.3.7-4.7l-7.8-6C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.7 2.2-8.5 2.2-6.6 0-12.1-4.5-14-10.6l-7.8 6C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function GoogleSignInModal({ onClose }: { onClose: () => void }) {
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");

  async function pick(addr: string, name?: string) {
    if (!addr.trim()) return;
    await signIn(addr.trim(), name);
    onClose();
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-text-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
      >
        <div className="cyber-panel-raised w-full max-w-sm p-6 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <GoogleG />
            <span className="text-sm text-text-secondary">Sign in with Google</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Choose an account
          </h2>

          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => pick(a.email, a.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-panel-hover transition-colors text-left"
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-core-blue">
                  {a.name.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm text-text-primary truncate">{a.name}</span>
                  <span className="block text-xs text-text-muted truncate">{a.email}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="my-4 border-t border-border-subtle" />

          <label className="block text-xs uppercase tracking-wide text-text-muted mb-1">
            Use another account
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && pick(email)}
              placeholder="you@gmail.com"
              className="flex-1 h-9 px-3 text-sm rounded-lg bg-bg-deep border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-active"
            />
            <button
              type="button"
              onClick={() => pick(email)}
              disabled={!email.trim()}
              className="h-9 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-40 bg-core-blue"
            >
              Continue
            </button>
          </div>

          <p className="mt-4 text-[11px] text-text-muted leading-relaxed">
            Demo sign-in — accounts are stored locally on this device. Real
            Google OAuth via Supabase drops in here later.
          </p>
        </div>
      </motion.div>
    </>
  );
}
