"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

export function NavMain({
  label,
  items,
}: {
  label?: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  // Find every item whose url matches the current path (exact or as a
  // "parent" path segment), then keep only the most specific (longest url)
  // match so sibling routes sharing a prefix don't all light up together.
  const activeUrl = React.useMemo(() => {
    const matches = items.filter((item) => {
      if (item.url === "#") return false;
      if (pathname === item.url) return true;
      if (item.url === "/dashboard") return false; // never prefix-match the root
      return pathname.startsWith(item.url + "/");
    });

    if (matches.length === 0) return null;

    return matches.reduce((longest, item) =>
      item.url.length > longest.url.length ? item : longest
    ).url;
  }, [items, pathname]);

  return (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="font-jet text-[10px] tracking-[0.14em] uppercase text-muted-foreground/70">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-4">
          {items.map((item) => {
            const isActive = item.url === activeUrl;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className="rounded-xl data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}