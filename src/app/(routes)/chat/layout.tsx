import Sidebar from "@/components/chat/Sidebar";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex overflow-x-hidden">
      <Sidebar />
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </main>
  );
};

export default ChatLayout;
