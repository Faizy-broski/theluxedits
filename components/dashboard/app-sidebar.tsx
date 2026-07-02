"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  GlobeIcon,
  ShoppingBagIcon,
  TagIcon,
  PencilLineIcon,
  ReceiptIcon,
  Settings2Icon,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: "Websites", url: "/dashboard/websites", icon: <GlobeIcon /> },
  ],
  navProducts: [
    { title: "All Products", url: "/dashboard/products", icon: <ShoppingBagIcon /> },
    {
      title: "Bulk Edit Price Rule",
      url: "/dashboard/products/bulk-edit-price-rule",
      icon: <TagIcon />,
    },
    {
      title: "Bulk Edit",
      url: "/dashboard/products/bulk-field-edit-explorer",
      icon: <PencilLineIcon />,
    },
  ],
  navOrders: [
    { title: "All Orders", url: "/dashboard/orders", icon: <ReceiptIcon /> },
  ],
  navAccount: [
    { title: "Settings", url: "/dashboard/settings", icon: <Settings2Icon /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="TheLuxEdits"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <span className="font-against text-lg leading-none group-data-[collapsible=icon]:hidden">
                  TheLuxEdits
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain label="Main" items={data.navMain} />
        <NavMain label="Products" items={data.navProducts} />
        <NavMain label="Orders" items={data.navOrders} />
        <NavMain label="Account" items={data.navAccount} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}