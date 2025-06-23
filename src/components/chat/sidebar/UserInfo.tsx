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
import { trpc } from "@/trpc/client";
import Image from "next/image";
import { useState } from "react";
import SearchCommand from "../modals/SearchCommand";

interface Props {
  name: string;
  email: string;
  image: string;
}

const UserInfo = ({ name, email, image }: Props) => {
  const [openSearch, setOpenSearch] = useState(false);

  const { isMobile } = useSidebar();

  const utils = trpc.useUtils();

  const authClient = createAuthClient();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          utils.user.getCurrentUser.invalidate();
          window.location.replace("/");
        },
        onError: (error) => {
          console.log("Couldn't sign out", error);
        },
      },
    });
  };

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
                <DropdownMenuItem onClick={() => setOpenSearch(true)}>
                  <div className="flex gap-0.5 items-center">
                    <CommandIcon />{" "}
                    <span className="text-sm font-medium">+ k</span>
                  </div>
                  Search
                </DropdownMenuItem>
                {/* todo: Manage Account Settings from Clerk */}
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
