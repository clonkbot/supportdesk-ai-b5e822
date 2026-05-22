import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByTicket = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify ticket ownership
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    ticketId: v.id("tickets"),
    content: v.string(),
    isAiResponse: v.boolean(),
    isInternal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify ticket ownership
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== userId) throw new Error("Ticket not found");

    const messageId = await ctx.db.insert("messages", {
      ticketId: args.ticketId,
      userId: args.isAiResponse ? undefined : userId,
      content: args.content,
      isAiResponse: args.isAiResponse,
      isInternal: args.isInternal,
      createdAt: Date.now(),
    });

    // Update ticket
    await ctx.db.patch(args.ticketId, {
      updatedAt: Date.now(),
      status: ticket.status === "open" ? "in_progress" : ticket.status,
    });

    return messageId;
  },
});
