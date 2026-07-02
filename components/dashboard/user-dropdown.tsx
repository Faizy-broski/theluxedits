"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  LogOut,
  Settings2,
  User,
  ChevronsUpDown,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const initials = user.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="
            flex items-center gap-3
            rounded-xl border border-border
            bg-background px-2 py-1.5
            transition-colors
            hover:bg-muted
            focus:outline-none
          "
        >
          <Avatar className="size-8 border border-border">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="font-jet text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-none">
              {user.name}
            </p>

            <p className="font-jet text-[11px] text-muted-foreground">
              {user.email}
            </p>
          </div>

          <ChevronsUpDown className="hidden size-4 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl p-2"
      >
        <DropdownMenuLabel className="p-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="font-jet">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user.name}
              </p>

              <p className="truncate font-jet text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <Bell className="size-4 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3"
            >
              <User className="size-4 text-muted-foreground" />
              Edit Profile
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="
            gap-3
            text-destructive
            focus:text-destructive
            cursor-pointer
          "
        >
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}