import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/chat/sidebar/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <ChatSidebar variant="inset" />
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <ChatHeader />
          <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
