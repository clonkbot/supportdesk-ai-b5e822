import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db.query("tickets").withIndex("by_user", (q) => q.eq("userId", userId));

    const tickets = await q.order("desc").collect();

    if (args.status) {
      return tickets.filter(t => t.status === args.status);
    }

    return tickets;
  },
});

export const get = query({
  args: { id: v.id("tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const ticket = await ctx.db.get(args.id);
    if (!ticket || ticket.userId !== userId) return null;

    return ticket;
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    description: v.string(),
    priority: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const ticketId = await ctx.db.insert("tickets", {
      userId,
      subject: args.subject,
      description: args.description,
      status: "open",
      priority: args.priority,
      category: args.category,
      createdAt: now,
      updatedAt: now,
    });

    // Add initial message
    await ctx.db.insert("messages", {
      ticketId,
      userId,
      content: args.description,
      isAiResponse: false,
      isInternal: false,
      createdAt: now,
    });

    // Log analytics
    await ctx.db.insert("analytics", {
      userId,
      ticketId,
      eventType: "ticket_created",
      createdAt: now,
    });

    return ticketId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tickets"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedAgent: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    aiSentiment: v.optional(v.string()),
    aiSuggestedResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.id);
    if (!ticket || ticket.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.status) {
      updates.status = args.status;
      if (args.status === "resolved") {
        updates.resolvedAt = Date.now();
      }
    }
    if (args.priority) updates.priority = args.priority;
    if (args.assignedAgent !== undefined) updates.assignedAgent = args.assignedAgent;
    if (args.aiSummary) updates.aiSummary = args.aiSummary;
    if (args.aiSentiment) updates.aiSentiment = args.aiSentiment;
    if (args.aiSuggestedResponse) updates.aiSuggestedResponse = args.aiSuggestedResponse;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("tickets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticket = await ctx.db.get(args.id);
    if (!ticket || ticket.userId !== userId) throw new Error("Not found");

    // Delete associated messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.id))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const closed = tickets.filter(t => t.status === "closed").length;

    const urgent = tickets.filter(t => t.priority === "urgent" && t.status !== "closed").length;
    const high = tickets.filter(t => t.priority === "high" && t.status !== "closed").length;

    // Calculate avg resolution time for resolved tickets
    const resolvedTickets = tickets.filter(t => t.resolvedAt);
    const avgResolutionTime = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => sum + (t.resolvedAt! - t.createdAt), 0) / resolvedTickets.length
      : 0;

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
      closed,
      urgent,
      high,
      avgResolutionTime,
    };
  },
});
