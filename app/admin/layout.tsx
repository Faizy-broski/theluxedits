import { AdminAuthProvider } from "@/lib/admin-auth-context";

export const metadata = { title: "Admin — TheLuxEdits" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
