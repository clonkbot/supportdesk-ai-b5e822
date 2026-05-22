import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function AIAgents() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const updateAgent = useMutation(api.agents.update);
  const deleteAgent = useMutation(api.agents.remove);
  const settings = useQuery(api.settings.get);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"aiAgents"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    autoRespond: false,
    categories: [] as string[],
  });

  const categories = settings?.categories || ["General", "Billing", "Technical", "Sales"];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      systemPrompt: "",
      autoRespond: false,
      categories: [],
    });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await updateAgent({
          id: editingId,
          ...formData,
        });
      } else {
        await createAgent(formData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (agent: { _id: Id<"aiAgents">; name: string; description: string; systemPrompt: string; isActive: boolean; autoRespond: boolean; categories: string[] }) => {
    setFormData({
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      autoRespond: agent.autoRespond,
      categories: agent.categories,
    });
    setEditingId(agent._id);
    setShowCreate(true);
  };

  const handleToggleActive = async (id: Id<"aiAgents">, isActive: boolean) => {
    await updateAgent({ id, isActive: !isActive });
  };

  const handleDelete = async (id: Id<"aiAgents">) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      await deleteAgent({ id });
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  if (agents === undefined) {
    return (
      <div className="leather-card p-8 animate-pulse">
        <div className="h-8 bg-gray-700/50 rounded w-1/3 mb-6"></div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="leather-card p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            AI Agents
          </h2>
          <p className="text-amber-200/50 text-sm mt-1">Configure autonomous AI support agents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="brass-btn px-4 py-2 text-sm"
        >
          + Create Agent
        </button>
      </div>

      {/* Agent List */}
      {agents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 metal-panel rounded-full mx-auto flex items-center justify-center mb-4">
            <span className="text-4xl">🤖</span>
          </div>
          <h3 className="text-xl text-amber-100/60" style={{ fontFamily: "'Playfair Display', serif" }}>
            No AI Agents
          </h3>
          <p className="text-amber-200/40 mt-2">Create your first autonomous AI agent</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent: { _id: Id<"aiAgents">; name: string; description: string; systemPrompt: string; isActive: boolean; autoRespond: boolean; categories: string[]; createdAt: number }) => (
            <div
              key={agent._id}
              className="metal-panel p-4 md:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      agent.isActive ? "brass-accent" : "bg-gray-700"
                    }`}>
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-amber-100 font-semibold">{agent.name}</h3>
                      <p className="text-amber-200/50 text-sm">{agent.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.categories.map((cat: string) => (
                      <span
                        key={cat}
                        className="text-xs px-2 py-1 rounded bg-amber-900/30 text-amber-300 border border-amber-700/30"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`led ${agent.isActive ? "led-green" : "led-red"}`}></div>
                      <span className="text-xs text-amber-200/60">
                        {agent.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`led ${agent.autoRespond ? "led-amber" : "led-red"}`}></div>
                      <span className="text-xs text-amber-200/60">
                        Auto-respond: {agent.autoRespond ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleActive(agent._id, agent.isActive)}
                    className={`embossed-btn px-3 py-1 text-xs ${agent.isActive ? "text-red-400" : "text-green-400"}`}
                  >
                    {agent.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(agent)}
                    className="embossed-btn px-3 py-1 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="embossed-btn px-3 py-1 text-xs text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="leather-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {editingId ? "Edit Agent" : "Create New Agent"}
                </h3>
                <button onClick={resetForm} className="embossed-btn p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Billing Support Bot"
                    className="inset-input w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the agent's role"
                    className="inset-input w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">System Prompt</label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="Instructions for the AI agent..."
                    className="inset-input w-full resize-none text-sm"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat: string) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 rounded text-xs transition-all ${
                          formData.categories.includes(cat)
                            ? "brass-accent text-wood-dark"
                            : "bg-black/30 text-amber-100/60"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, autoRespond: !formData.autoRespond })}
                    className={`toggle-switch ${formData.autoRespond ? "active" : ""}`}
                  ></button>
                  <span className="text-amber-100/80 text-sm">Enable Auto-Response</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="embossed-btn flex-1 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="brass-btn flex-1 text-sm">
                    {isLoading ? "Saving..." : editingId ? "Update Agent" : "Create Agent"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
