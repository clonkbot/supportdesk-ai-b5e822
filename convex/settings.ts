import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        widgetColor: "#8B4513",
        widgetPosition: "bottom-right",
        welcomeMessage: "Hello! How can we help you today?",
        autoAssign: true,
        aiEnabled: true,
        categories: ["General", "Billing", "Technical", "Sales"],
      };
    }

    return settings;
  },
});

export const upsert = mutation({
  args: {
    widgetColor: v.optional(v.string()),
    widgetPosition: v.optional(v.string()),
    welcomeMessage: v.optional(v.string()),
    autoAssign: v.optional(v.boolean()),
    aiEnabled: v.optional(v.boolean()),
    categories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      const updates: Record<string, unknown> = { updatedAt: now };
      if (args.widgetColor !== undefined) updates.widgetColor = args.widgetColor;
      if (args.widgetPosition !== undefined) updates.widgetPosition = args.widgetPosition;
      if (args.welcomeMessage !== undefined) updates.welcomeMessage = args.welcomeMessage;
      if (args.autoAssign !== undefined) updates.autoAssign = args.autoAssign;
      if (args.aiEnabled !== undefined) updates.aiEnabled = args.aiEnabled;
      if (args.categories !== undefined) updates.categories = args.categories;

      await ctx.db.patch(existing._id, updates);
      return existing._id;
    } else {
      return await ctx.db.insert("settings", {
        userId,
        widgetColor: args.widgetColor ?? "#8B4513",
        widgetPosition: args.widgetPosition ?? "bottom-right",
        welcomeMessage: args.welcomeMessage ?? "Hello! How can we help you today?",
        autoAssign: args.autoAssign ?? true,
        aiEnabled: args.aiEnabled ?? true,
        categories: args.categories ?? ["General", "Billing", "Technical", "Sales"],
        updatedAt: now,
      });
    }
  },
});
