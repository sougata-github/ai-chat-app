import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";

const ChatView = () => {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 px-4">
        <div className="flex items-center justify-center">
          <ChatSuggestions />
        </div>
      </div>

      <ChatInput variant="chat" />
    </div>
  );
};

export default ChatView;
