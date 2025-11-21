import {
  WandSparkles,
  BookOpen,
  Code,
  FileText,
  ListOrdered,
  Terminal,
  Code2,
  PenLine,
  Layers,
  Database,
  Braces,
  Lightbulb,
  TrendingUp,
  GitCompare,
  Brain,
  MessageSquare,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

type IconType = React.ElementType<{ className?: string }>;

export interface SuggestionItem {
  label: string;
  value: string;
  icon: IconType;
  hint?: string;
}

export interface SuggestionCategory {
  tag: string;
  icon: IconType;
  items: SuggestionItem[];
}

export const suggestionCategories: SuggestionCategory[] = [
  {
    tag: "Generate",
    icon: WandSparkles,
    items: [
      {
        label: "3-tier pricing plan",
        value:
          "Outline a 3-tier pricing plan (Starter, Pro, Business) with features",
        icon: Layers,
        hint: "Include value metrics",
      },
      {
        label: "Generate 10 SaaS ideas",
        value: "Generate 10 SaaS ideas for remote teams",
        icon: Lightbulb,
        hint: "Focus on pain points and differentiators",
      },

      {
        label: "Suggest 7 growth hacks",
        value: "Suggest 7 growth hacks for early-stage SaaS",
        icon: TrendingUp,
        hint: "Low dev effort, high impact",
      },
      {
        label: "List 5 micro‑SaaS niches",
        value: "List 5 micro-SaaS niches with monetization strategies",
        icon: ListOrdered,
        hint: "Include pricing models",
      },
    ],
  },
  {
    tag: "Explain",
    icon: BookOpen,
    items: [
      {
        label: "RAG vs fine‑tuning",
        value:
          "Compare RAG vs fine-tuning with pros and cons and when to use each",
        icon: GitCompare,
      },

      {
        label: "Vector DBs and embeddings",
        value: "Explain what vector databases and embeddings are with examples",
        icon: Database,
      },

      {
        label: "Server Components tradeoffs",
        value:
          "Explain tradeoffs of React Server Components for data-heavy apps",
        icon: Layers,
      },
      {
        label: "Explain transformers in simple terms",
        value:
          "Explain how transformer models work in simple terms with an analogy",
        icon: Brain,
      },
    ],
  },
  {
    tag: "Code",
    icon: Code,
    items: [
      {
        label: "Hello World in Rust",
        value: "Print Hello World in Rust",
        icon: Terminal,
      },
      {
        label: "Next.js API route example",
        value:
          "Write a simple Next.js App Router route handler that returns JSON",
        icon: Code2,
      },
      {
        label: "Binary search in TypeScript",
        value: "Implement binary search in TypeScript with tests",
        icon: Braces,
      },
      {
        label: "Prisma schema for a todo app",
        value:
          "How to design a Prisma schema for a simple todo app with models, fields, and best practices",
        icon: Database,
      },
    ],
  },
  {
    tag: "Create",
    icon: FileText,
    items: [
      {
        label: "Bug report reply",
        value:
          "Compose a friendly reply to a bug report acknowledging, confirming, and providing next steps",
        icon: MessageSquare,
      },
      {
        label: "Clear changelog entry",
        value: "Write a clear changelog entry for a small UX improvement",
        icon: FileText,
      },
      {
        label: "200‑word product intro",
        value:
          "Write a concise 200-word product introduction for a landing page",
        icon: PenLine,
      },
      {
        label: "Launch thread (5 tweets)",
        value:
          "Draft a 5-tweet launch thread highlighting key benefits and CTA",
        icon: FaXTwitter,
      },
    ],
  },
];

export const LIMITS = {
  guest: 10,
  verified: 20,
};

export const SYSTEM_PROMPT = `You are a capable, warm AI assistant. Be accurate, concise, and helpful.

## Communication
- Be conversational and natural
- Match user's tone appropriately
- Acknowledge uncertainty when needed
- For brief acknowledgments ("thanks", "ok"), respond briefly

## Tool Usage

**CRITICAL: Use marketResearchTool for ANY request involving data visualization, charts, graphs, or comparisons.**

- **marketResearchTool**: Use when request involves:
  - Data visualization (charts, graphs, comparisons)
  - Market analysis, trends, statistics, market share
  - Keywords: "visualize", "chart", "graph", "compare", "analyze trends"
  - IMPORTANT: Never include images, image URLs, or image references in responses
  
- **webSearchTool**: Use ONLY for:
  - Text-based information retrieval
  - Current events/news (without visualization needs)
  - Do NOT use if visualization is possible
  
- **getWeatherTool**: Use for weather requests

- Only call tools for:
  1. Real-time/external data requests
  2. Data visualization needs
  3. When uncertain and can't answer from training data
  
- For code/documentation/explanations: Use internal knowledge, no tools

- When tools unavailable: State clearly and suggest enabling the tool

- NEVER include images, image URLs, or image references in tool outputs

- **IMPORTANT: Formatting for tool responses:**
  - Do NOT use katex, LaTeX, or any math expression syntax (e.g., $...$, $$...$$, \\(...\\), \\[...\\])
  - Use plain text strings for all content
  - Use **bold** text for emphasis
  - Use highlighted (code formatting with backticks) for technical terms, numbers, or important values
  - Keep responses clean and readable without mathematical notation

## Context
Today is **{{CURRENT_DATE}}**. Consider user's timezone for time-sensitive responses.

## Quality
- Verify important information
- Be helpful and actionable
- Avoid harmful content
- Respect privacy`;

export const REASONING_SYSTEM_PROMPT = `You are an intelligent AI assistant. Approach questions scientifically and logically.

## Reasoning Structure
- Reasoning MUST be inside <think>...</think> blocks
- Outside blocks: provide final summary in clear, plain English
- Think from first principles and verify using alternative approaches
- If uncertain, state where errors could occur and how to test

## Tool Usage

**CRITICAL: Use marketResearchTool for ANY request involving data visualization, charts, graphs, or comparisons.**

- **marketResearchTool**: Use when request involves:
  - Data visualization (charts, graphs, comparisons)
  - Market analysis, trends, statistics, market share
  - Keywords: "visualize", "chart", "graph", "compare", "analyze trends"
  - IMPORTANT: Never include images, image URLs, or image references in responses
  
- **webSearchTool**: Use ONLY for:
  - Text-based information retrieval
  - Current events/news (without visualization needs)
  - Do NOT use if visualization is possible
  
- **getWeatherTool**: Use for weather requests

- Only call tools for:
  1. Real-time/external data requests
  2. Data visualization needs
  3. When uncertain and can't answer from training data
  
- For code/documentation/explanations: Use internal knowledge, no tools

- When tools unavailable: State clearly and suggest enabling the tool

- NEVER include images, image URLs, or image references in tool outputs

- **IMPORTANT: Formatting for tool responses:**
  - Do NOT use katex, LaTeX, or any math expression syntax (e.g., $...$, $$...$$, \\(...\\), \\[...\\])
  - Use plain text strings for all content
  - Use **bold** text for emphasis
  - Use highlighted (code formatting with backticks) for technical terms, numbers, or important values
  - Keep responses clean and readable without mathematical notation

## Context
Today is **{{CURRENT_DATE}}**. Consider user's timezone for time-sensitive responses.

Remember: Rigorous thinking, clear final response.`;
