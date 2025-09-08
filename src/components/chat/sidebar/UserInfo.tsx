"use client";

import { IconDotsVertical, IconLogout } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CommandIcon } from "lucide-react";

import { createAuthClient } from "better-auth/react";
import Image from "next/image";
import { useState } from "react";
import SearchCommand from "../modals/SearchCommand";
import { Progress } from "@/components/ui/progress";

interface Props {
  name: string;
  email: string;
  image: string;
  messageCount: number;
  lastReset: number | null;
}

//can be harcoded since this renders for verified users only
const LIMIT = 20;

const UserInfo = ({ name, email, image, messageCount, lastReset }: Props) => {
  const [openSearch, setOpenSearch] = useState(false);

  const { isMobile } = useSidebar();

  const authClient = createAuthClient();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.replace("/");
        },
        onError: (error) => {
          console.log("Couldn't sign out", error);
        },
      },
    });
  };

  const messagesLeft = Math.max(LIMIT - messageCount, 0);
  const percent = Math.min((messageCount / LIMIT) * 100, 100);

  const nextResetHours =
    lastReset != null
      ? Math.max(
          0,

          (lastReset + 1 * 12 * 60 * 60 * 1000 - Date.now()) / (1000 * 60 * 60)
        )
      : null;

  return (
    <>
      <SearchCommand open={openSearch} onOpenChange={setOpenSearch} />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={image} alt={name} />
                  <AvatarFallback className="rounded-full">
                    <Image
                      src="https://avatar.vercel.sh/jack"
                      alt="fallback"
                      height={32}
                      width={32}
                      className="rounded-full"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={image} alt={name} />
                    <AvatarFallback className="rounded-full">
                      <Image
                        src="https://avatar.vercel.sh/jack"
                        alt="fallback"
                        height={32}
                        width={32}
                        className="rounded-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <div className="px-2 py-1.5 space-y-2">
                  <Progress value={percent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {messagesLeft} / {LIMIT} messages left
                  </p>
                  {nextResetHours !== null && (
                    <p className="text-xs text-muted-foreground">
                      {nextResetHours < 1
                        ? "Resets in less than 1 hr"
                        : `Resets in ${
                            Number.isInteger(nextResetHours)
                              ? nextResetHours
                              : Number(nextResetHours.toFixed(1))
                          } ${nextResetHours > 1 ? "hrs" : "hr"}`}
                    </p>
                  )}
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setOpenSearch(true)}>
                  <div className="flex gap-0.5 items-center">
                    <CommandIcon />{" "}
                    <span className="text-sm font-medium">+ k</span>
                  </div>
                  Search
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
};

export default UserInfo;
