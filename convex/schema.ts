import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Support tickets
  tickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    description: v.string(),
    status: v.string(), // "open", "in_progress", "resolved", "closed"
    priority: v.string(), // "low", "medium", "high", "urgent"
    category: v.string(),
    assignedAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    aiSummary: v.optional(v.string()),
    aiSentiment: v.optional(v.string()),
    aiSuggestedResponse: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  // Ticket messages/conversations
  messages: defineTable({
    ticketId: v.id("tickets"),
    userId: v.optional(v.id("users")),
    content: v.string(),
    isAiResponse: v.boolean(),
    isInternal: v.boolean(), // internal notes vs customer-facing
    createdAt: v.number(),
  })
    .index("by_ticket", ["ticketId"]),

  // Knowledge base articles
  knowledgeBase: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  // AI Agents configuration
  aiAgents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    isActive: v.boolean(),
    autoRespond: v.boolean(),
    categories: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_active", ["isActive"]),

  // Analytics/metrics
  analytics: defineTable({
    userId: v.id("users"),
    ticketId: v.optional(v.id("tickets")),
    eventType: v.string(), // "ticket_created", "ticket_resolved", "ai_response", etc.
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventType"]),

  // Widget/UI settings
  settings: defineTable({
    userId: v.id("users"),
    widgetColor: v.string(),
    widgetPosition: v.string(),
    welcomeMessage: v.string(),
    autoAssign: v.boolean(),
    aiEnabled: v.boolean(),
    categories: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
