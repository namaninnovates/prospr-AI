"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";

// Define minimal response type to avoid implicit any
type OpenRouterChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export const chatWithAI = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      }),
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Integrations.");
    }

    const model = args.model || "deepseek/deepseek-chat";

    const systemPrompt = {
      role: "system" as const,
      content:
        "You are FinanceAI, an expert financial advisor. Explain clearly and professionally. Include risks and caveats where relevant. Keep answers concise and actionable.",
    };

    const response: Response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://app.local", // optional
        "X-Title": "FinanceAI",
      },
      body: JSON.stringify({
        model,
        messages: [systemPrompt, ...args.messages],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
    }

    const data: OpenRouterChatResponse = await response.json();
    const content: string =
      data.choices?.[0]?.message?.content ??
      "I couldn't generate a response. Please try again or rephrase your question.";
    return content;
  },
});

export const summarizeChat = action({
  args: {
    chatId: v.id("chats"),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured. Please add OPENROUTER_API_KEY in Integrations.");
    }

    // Load messages for this chat (cast internal to avoid circular type inference)
    const msgs: Array<Doc<"messages">> = await ctx.runQuery(
      (internal as any).messages.internalListByChat,
      {
        chatId: args.chatId,
      },
    );

    const model = args.model || "deepseek/deepseek-chat";
    const text: string = msgs
      .slice(-30)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const systemPrompt = {
      role: "system" as const,
      content:
        "You are FinanceAI. Summarize the chat into 3-4 concise bullet points focusing on user goal, key topics, and suggested next steps. Use short bullets.",
    };

    const response: Response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://app.local",
        "X-Title": "FinanceAI",
      },
      body: JSON.stringify({
        model,
        messages: [
          systemPrompt,
          {
            role: "user",
            content: `Summarize the following chat in 3-4 bullet points:\n\n${text}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
    }

    const data: OpenRouterChatResponse = await response.json();
    const content: string =
      data.choices?.[0]?.message?.content ??
      "- Could not generate a summary.";

    // Save to chat.brief (cast internal to avoid circular type inference)
    await ctx.runMutation((internal as any).chats.internalSetBrief, {
      chatId: args.chatId,
      brief: content,
    });

    return content;
  },
});