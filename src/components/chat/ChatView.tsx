import ChatSuggestions from "./ChatSuggestions";
import ChatInput from "./ChatInput";

const ChatView = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 px-4 pb-20">
        <div className="flex items-center justify-center h-full">
          <ChatSuggestions />
        </div>
      </div>

      <ChatInput variant="chat" />
    </div>
  );
};

export default ChatView;
