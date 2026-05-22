import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TicketsList } from "./TicketsList";
import { TicketDetail } from "./TicketDetail";
import { CreateTicket } from "./CreateTicket";
import { AIAgents } from "./AIAgents";
import { KnowledgeBase } from "./KnowledgeBase";
import { Settings } from "./Settings";
import { StatsPanel } from "./StatsPanel";
import { Id } from "../../convex/_generated/dataModel";

type Tab = "tickets" | "agents" | "knowledge" | "settings";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<Id<"tickets"> | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = useQuery(api.tickets.getStats);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "tickets", label: "Tickets", icon: "📋" },
    { id: "agents", label: "AI Agents", icon: "🤖" },
    { id: "knowledge", label: "Knowledge Base", icon: "📚" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen leather-bg">
      {/* Header */}
      <header className="metal-panel mx-2 md:mx-4 mt-2 md:mt-4 rounded-xl">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 brass-accent rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-wood-dark" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg md:text-xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                SupportDesk AI
              </h1>
              <p className="text-xs text-amber-200/50">Autonomous Support Platform</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedTicketId(null);
                }}
                className={`tab-button rounded-lg border-b-2 ${activeTab === tab.id ? "active" : ""}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg bg-black/20">
              <div className="flex items-center gap-2">
                <div className="led led-green"></div>
                <span className="text-xs text-green-400">AI Active</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden embossed-btn p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            <button onClick={() => signOut()} className="embossed-btn px-3 py-2 md:px-4 text-sm">
              <span className="hidden md:inline">Sign Out</span>
              <span className="md:hidden">Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-black/30 p-3">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTicketId(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`tab-button rounded-lg border-b-2 flex-1 min-w-[120px] ${activeTab === tab.id ? "active" : ""}`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-2 md:p-4">
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Stats Panel */}
            <div className="lg:col-span-12">
              <StatsPanel stats={stats} />
            </div>

            {/* Tickets List */}
            <div className={`lg:col-span-4 ${selectedTicketId ? 'hidden lg:block' : ''}`}>
              <div className="leather-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Support Tickets
                  </h2>
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    className="brass-btn px-3 py-2 text-sm"
                  >
                    + New
                  </button>
                </div>
                <TicketsList
                  selectedId={selectedTicketId}
                  onSelect={setSelectedTicketId}
                />
              </div>
            </div>

            {/* Ticket Detail */}
            <div className={`lg:col-span-8 ${!selectedTicketId ? 'hidden lg:block' : ''}`}>
              {selectedTicketId ? (
                <TicketDetail
                  ticketId={selectedTicketId}
                  onBack={() => setSelectedTicketId(null)}
                />
              ) : (
                <div className="leather-card p-8 md:p-12 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 metal-panel rounded-full mx-auto flex items-center justify-center mb-4">
                    <span className="text-3xl md:text-4xl">📋</span>
                  </div>
                  <h3 className="text-xl md:text-2xl text-amber-100/60" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Select a Ticket
                  </h3>
                  <p className="text-amber-200/40 mt-2 text-sm md:text-base">Choose a ticket from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "agents" && <AIAgents />}
        {activeTab === "knowledge" && <KnowledgeBase />}
        {activeTab === "settings" && <Settings />}
      </main>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <CreateTicket onClose={() => setShowCreateTicket(false)} />
      )}

      {/* Footer */}
      <footer className="text-center py-6 footer-text">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}
