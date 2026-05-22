import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiAgents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    autoRespond: v.boolean(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("aiAgents", {
      userId,
      name: args.name,
      description: args.description,
      systemPrompt: args.systemPrompt,
      isActive: true,
      autoRespond: args.autoRespond,
      categories: args.categories,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("aiAgents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    autoRespond: v.optional(v.boolean()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const agent = await ctx.db.get(args.id);
    if (!agent || agent.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.systemPrompt !== undefined) updates.systemPrompt = args.systemPrompt;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.autoRespond !== undefined) updates.autoRespond = args.autoRespond;
    if (args.categories !== undefined) updates.categories = args.categories;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("aiAgents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const agent = await ctx.db.get(args.id);
    if (!agent || agent.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
