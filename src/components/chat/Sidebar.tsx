"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "../ui/button";

const Sidebar = () => {
  return (
    <aside className="fixed h-full w-8 border-r md:sticky md:bottom-0 md:left-0 md:top-0 md:h-screen md:w-52">
      <div className="flex flex-col">
        <div className="hidden items-center justify-between gap-2 border-b p-4">
          <Link href="/">Vertext</Link>
          <button className="items-center justify-center rounded-sm border p-1">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
