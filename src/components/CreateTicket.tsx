import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CreateTicketProps {
  onClose: () => void;
}

export function CreateTicket({ onClose }: CreateTicketProps) {
  const settings = useQuery(api.settings.get);
  const createTicket = useMutation(api.tickets.create);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    category: "General",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = settings?.categories || ["General", "Billing", "Technical", "Sales"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createTicket(formData);
      onClose();
    } catch (err) {
      setError("Failed to create ticket. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="leather-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create New Ticket
            </h2>
            <button
              onClick={onClose}
              className="embossed-btn p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-amber-100/80 text-sm mb-2 font-medium">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of your issue"
                className="inset-input w-full text-sm"
                required
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-100/80 text-sm mb-2 font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="inset-input w-full text-sm"
                >
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-100/80 text-sm mb-2 font-medium">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="inset-input w-full text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-amber-100/80 text-sm mb-2 font-medium">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please describe your issue in detail..."
                className="inset-input w-full resize-none text-sm"
                rows={5}
                required
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="embossed-btn flex-1 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="brass-btn flex-1 text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-wood-dark border-t-transparent rounded-full animate-spin mr-2"></span>
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </button>
            </div>
          </form>

          {/* Decorative gauge */}
          <div className="mt-6 pt-4 border-t-2 border-wood-dark/30">
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-200/50">Priority Level:</span>
              <div className="gauge-container flex-1">
                <div
                  className="gauge-fill"
                  style={{
                    width: formData.priority === "low" ? "25%" :
                           formData.priority === "medium" ? "50%" :
                           formData.priority === "high" ? "75%" : "100%"
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
