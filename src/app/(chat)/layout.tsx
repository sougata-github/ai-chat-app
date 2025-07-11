import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/chat/sidebar/ChatSidebar";
import AuthGate from "@/components/chat/auth/AuthGate";
import ChatHeader from "@/components/chat/ChatHeader";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-dvh">
      <AuthGate>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 62)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <ChatSidebar variant="inset" />
          <SidebarInset className="flex-1 flex flex-col relative min-w-0">
            <ChatHeader />
            <section className="flex-1 flex flex-col">{children}</section>
          </SidebarInset>
        </SidebarProvider>
      </AuthGate>
    </main>
  );
}
