"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

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
  handler: async (ctx, args) => {
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ??
      "I couldn’t generate a response. Please try again or rephrase your question.";
    return content;
  },
});
