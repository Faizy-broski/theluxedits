import type { ReactNode } from "react";
import { BrassOrnament } from "@/components/dashboard/Auth/brass-ornaments";

interface AuthShellProps {
  left: ReactNode;
  right: ReactNode;
}

/**
 * The outer chrome shared by every auth screen (login, forgot-password,
 * reset-password): ambient texture, the two-panel card, and the footer.
 * Each page supplies its own `left` (brand panel content) and `right`
 * (form panel content).
 */
export function AuthShell({ left, right }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#EFEBE1] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(15,28,23,0.08) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/10">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0E1B16] p-10 lg:flex">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(600px circle at 15% 10%, rgba(176,141,87,0.18), transparent 60%)",
              }}
            />
            <BrassOrnament className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 text-[#B08D57]/25" />
            <div className="relative flex h-full flex-col justify-between">{left}</div>
          </div>

          <div className="bg-[#F7F3EA] p-8 sm:p-12">{right}</div>
        </div>
      </div>

      <p className="absolute bottom-4 text-center text-xs text-[#8C8672]">
        © {new Date().getFullYear()} TheLuxEdits. All rights reserved.
      </p>
    </div>
  );
}