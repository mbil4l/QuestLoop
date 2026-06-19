"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { GoogleSignInModal } from "./GoogleSignInModal";

export function AuthControl() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const emoji = useProfileStore((s) => s.emoji);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {user ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            style={{ backgroundColor: user.avatarColor }}
          >
            {emoji || user.name.charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 z-40 cyber-panel-raised p-3 shadow-lg">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-xs text-text-muted truncate mb-3">{user.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full text-left text-sm text-text-secondary hover:text-danger-muted transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="h-9 px-4 rounded-lg text-sm font-medium border border-border-subtle text-text-primary hover:bg-bg-panel-hover transition-colors"
        >
          Sign in
        </button>
      )}

      <AnimatePresence>
        {modalOpen && <GoogleSignInModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
