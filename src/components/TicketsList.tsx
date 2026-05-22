import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TicketsListProps {
  selectedId: Id<"tickets"> | null;
  onSelect: (id: Id<"tickets">) => void;
}

export function TicketsList({ selectedId, onSelect }: TicketsListProps) {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const tickets = useQuery(api.tickets.list, { status: statusFilter });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "urgent": return "priority-urgent";
      case "high": return "priority-high";
      case "medium": return "priority-medium";
      default: return "priority-low";
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  if (tickets === undefined) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-black/20 animate-pulse">
            <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: undefined, label: "All" },
          { value: "open", label: "Open" },
          { value: "in_progress", label: "In Progress" },
          { value: "resolved", label: "Resolved" },
        ].map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              statusFilter === filter.value
                ? "brass-accent text-wood-dark"
                : "bg-black/30 text-amber-100/60 hover:text-amber-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      <div className="space-y-2 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2">
        {tickets.length === 0 ? (
          <div className="text-center py-8 text-amber-100/40">
            <span className="text-4xl mb-2 block">📭</span>
            No tickets found
          </div>
        ) : (
          tickets.map((ticket: { _id: Id<"tickets">; subject: string; category: string; createdAt: number; status: string; priority: string; aiSentiment?: string }) => (
            <button
              key={ticket._id}
              onClick={() => onSelect(ticket._id)}
              className={`w-full text-left p-3 md:p-4 rounded-lg transition-all ${
                selectedId === ticket._id
                  ? "bg-gradient-to-r from-amber-900/40 to-transparent border-l-4 border-amber-500"
                  : "bg-black/20 hover:bg-black/30 border-l-4 border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-amber-100 font-medium truncate text-sm md:text-base">
                    {ticket.subject}
                  </h4>
                  <p className="text-amber-200/50 text-xs mt-1 truncate">
                    {ticket.category} · {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                    <div className="led w-2 h-2 border-0"></div>
                    <span className="hidden md:inline">{ticket.status.replace("_", " ")}</span>
                  </span>
                  <span className={`text-xs font-bold ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              {ticket.aiSentiment && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 border border-purple-700/30">
                    AI: {ticket.aiSentiment}
                  </span>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
