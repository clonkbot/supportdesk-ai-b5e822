import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const articles = await ctx.db
      .query("knowledgeBase")
      .order("desc")
      .collect();

    // Filter by user's articles
    let filtered = articles.filter(a => a.userId === userId);

    if (args.category) {
      filtered = filtered.filter(a => a.category === args.category);
    }

    return filtered;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("knowledgeBase", {
      userId,
      title: args.title,
      content: args.content,
      category: args.category,
      tags: args.tags,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("knowledgeBase"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const article = await ctx.db.get(args.id);
    if (!article || article.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("knowledgeBase") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const article = await ctx.db.get(args.id);
    if (!article || article.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
