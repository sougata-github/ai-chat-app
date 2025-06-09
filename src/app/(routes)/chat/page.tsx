import { PromptForm } from "@/components/chat/PromptForm";

export default function ChatHome() {
  return (
    <section className="mt-40 flex flex-col items-center justify-center p-4 md:mt-0 md:h-full">
      <h1 className="text-center text-4xl font-semibold md:text-6xl">
        What&apos;s on your mind?
      </h1>
      <PromptForm />

      <div className="mt-5 text-xs text-muted-foreground">
        Powered by DeepSeek r1
      </div>
    </section>
  );
}
