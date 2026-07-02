import { Search } from "lucide-react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { UserDropdown } from "@/components/dashboard/user-dropdown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-5" />

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders, products..."
              className="rounded-full bg-secondary/60 pl-9 border-none focus-visible:ring-1"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">

            <UserDropdown
              user={{
                name: "Alex",
                email: "alex@theluxedits.com",
                avatar: "",
              }}
            />
          </div>
        </header>

        <main className="flex-1 space-y-6 bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
