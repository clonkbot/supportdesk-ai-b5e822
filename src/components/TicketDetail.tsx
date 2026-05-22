import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TicketDetailProps {
  ticketId: Id<"tickets">;
  onBack: () => void;
}

export function TicketDetail({ ticketId, onBack }: TicketDetailProps) {
  const ticket = useQuery(api.tickets.get, { id: ticketId });
  const messages = useQuery(api.messages.listByTicket, { ticketId });
  const updateTicket = useMutation(api.tickets.update);
  const createMessage = useMutation(api.messages.create);
  const chat = useAction(api.ai.chat);

  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);

  if (!ticket || messages === undefined) {
    return (
      <div className="leather-card p-8 animate-pulse">
        <div className="h-8 bg-gray-700/50 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-700/30 rounded w-3/4 mb-8"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      await createMessage({
        ticketId,
        content: newMessage,
        isAiResponse: false,
        isInternal: false,
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    setIsAiAnalyzing(true);
    try {
      const allMessages = messages.map((m: { content: string }) => m.content).join("\n");
      const analysis = await chat({
        messages: [
          {
            role: "user",
            content: `Analyze this support ticket and provide:
1. A brief summary (1-2 sentences)
2. Customer sentiment (positive/neutral/negative/frustrated)
3. Suggested response approach

Ticket Subject: ${ticket.subject}
Ticket Category: ${ticket.category}
Priority: ${ticket.priority}

Conversation:
${allMessages}`,
          },
        ],
        systemPrompt: "You are a support ticket analyzer. Be concise and actionable. Format your response as:\nSUMMARY: [summary]\nSENTIMENT: [sentiment]\nAPPROACH: [suggested approach]",
      });

      // Parse response
      const summaryMatch = analysis.match(/SUMMARY:\s*(.+?)(?=SENTIMENT:|$)/s);
      const sentimentMatch = analysis.match(/SENTIMENT:\s*(\w+)/);

      await updateTicket({
        id: ticketId,
        aiSummary: summaryMatch?.[1]?.trim() || analysis,
        aiSentiment: sentimentMatch?.[1]?.toLowerCase() || "neutral",
        aiSuggestedResponse: analysis,
      });
    } catch (err) {
      console.error("AI analysis failed:", err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleAiRespond = async () => {
    setIsAiResponding(true);
    try {
      const allMessages = messages.map((m: { isAiResponse: boolean; content: string }) => `${m.isAiResponse ? "Agent" : "Customer"}: ${m.content}`).join("\n");

      const response = await chat({
        messages: [
          {
            role: "user",
            content: `Generate a helpful, professional response to this support ticket.

Ticket Subject: ${ticket.subject}
Category: ${ticket.category}
Priority: ${ticket.priority}

Conversation history:
${allMessages}

Generate a response that is:
- Professional and empathetic
- Addresses the customer's concern directly
- Provides actionable next steps if applicable
- Keeps a friendly tone`,
          },
        ],
        systemPrompt: "You are a helpful customer support agent. Write responses directly without any prefixes or labels. Be concise but thorough.",
      });

      await createMessage({
        ticketId,
        content: response,
        isAiResponse: true,
        isInternal: false,
      });
    } catch (err) {
      console.error("AI response failed:", err);
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    await updateTicket({ id: ticketId, status });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="leather-card p-4 md:p-6">
      {/* Back button for mobile */}
      <button
        onClick={onBack}
        className="lg:hidden embossed-btn px-3 py-2 mb-4 text-sm"
      >
        ← Back to List
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl text-amber-100 font-bold truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
            {ticket.subject}
          </h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
            <span className={`status-badge status-${ticket.status}`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className="text-amber-200/50 text-sm">{ticket.category}</span>
            <span className={`text-sm font-bold priority-${ticket.priority}`}>
              {ticket.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Status controls */}
        <div className="flex flex-wrap gap-2">
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="inset-input text-sm py-2 px-3"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* AI Analysis Panel */}
      <div className="metal-panel p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-amber-100 font-semibold flex items-center gap-2">
            <span className="text-purple-400">🤖</span>
            AI Analysis
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAiAnalyze}
              disabled={isAiAnalyzing}
              className="embossed-btn px-3 py-1 text-xs"
            >
              {isAiAnalyzing ? (
                <>
                  <span className="inline-block w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Analyzing...
                </>
              ) : (
                "Analyze Ticket"
              )}
            </button>
            <button
              onClick={handleAiRespond}
              disabled={isAiResponding}
              className="brass-btn px-3 py-1 text-xs"
            >
              {isAiResponding ? (
                <>
                  <span className="inline-block w-3 h-3 border border-wood-dark border-t-transparent rounded-full animate-spin mr-2"></span>
                  Generating...
                </>
              ) : (
                "AI Auto-Reply"
              )}
            </button>
          </div>
        </div>

        {ticket.aiSummary ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-200/50">Sentiment:</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                ticket.aiSentiment === "positive" ? "bg-green-900/30 text-green-300" :
                ticket.aiSentiment === "negative" || ticket.aiSentiment === "frustrated" ? "bg-red-900/30 text-red-300" :
                "bg-amber-900/30 text-amber-300"
              }`}>
                {ticket.aiSentiment}
              </span>
            </div>
            <p className="text-amber-100/80 text-sm">{ticket.aiSummary}</p>
          </div>
        ) : (
          <p className="text-amber-200/40 text-sm">Click "Analyze Ticket" to get AI insights</p>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto mb-4 pr-2">
        {messages.map((msg: { _id: string; isAiResponse: boolean; content: string; createdAt: number }) => (
          <div
            key={msg._id}
            className={`p-3 md:p-4 rounded-lg ${
              msg.isAiResponse
                ? "bg-gradient-to-r from-purple-900/30 to-purple-900/10 border-l-4 border-purple-500"
                : "bg-black/20 border-l-4 border-amber-500/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold ${msg.isAiResponse ? "text-purple-300" : "text-amber-300"}`}>
                {msg.isAiResponse ? "🤖 AI Agent" : "👤 Customer"}
              </span>
              <span className="text-xs text-amber-200/40">
                {formatDate(msg.createdAt)}
              </span>
            </div>
            <p className="text-amber-100/90 text-sm whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your reply..."
          className="inset-input flex-1 resize-none text-sm"
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
          className="brass-btn px-4 py-2 sm:self-end"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
