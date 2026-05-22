import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Settings() {
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.upsert);

  const [formData, setFormData] = useState({
    widgetColor: "#8B4513",
    widgetPosition: "bottom-right",
    welcomeMessage: "Hello! How can we help you today?",
    autoAssign: true,
    aiEnabled: true,
    categories: ["General", "Billing", "Technical", "Sales"],
  });
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        widgetColor: settings.widgetColor || "#8B4513",
        widgetPosition: settings.widgetPosition || "bottom-right",
        welcomeMessage: settings.welcomeMessage || "Hello! How can we help you today?",
        autoAssign: settings.autoAssign ?? true,
        aiEnabled: settings.aiEnabled ?? true,
        categories: settings.categories || ["General", "Billing", "Technical", "Sales"],
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== cat)
    }));
  };

  const colorPresets = [
    { name: "Brass", value: "#B8860B" },
    { name: "Mahogany", value: "#8B4513" },
    { name: "Forest", value: "#228B22" },
    { name: "Navy", value: "#000080" },
    { name: "Burgundy", value: "#722F37" },
    { name: "Charcoal", value: "#36454F" },
  ];

  if (settings === undefined) {
    return (
      <div className="leather-card p-8 animate-pulse">
        <div className="h-8 bg-gray-700/50 rounded w-1/3 mb-6"></div>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="leather-card p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Settings
          </h2>
          <p className="text-amber-200/50 text-sm mt-1">Configure your support desk</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`brass-btn px-6 py-2 text-sm ${saved ? "!bg-green-700" : ""}`}
        >
          {isLoading ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget Appearance */}
        <div className="metal-panel p-4 md:p-5">
          <h3 className="text-amber-100 font-semibold mb-4 flex items-center gap-2">
            <span>🎨</span>
            Widget Appearance
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-amber-100/80 text-sm mb-2">Theme Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, widgetColor: preset.value })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.widgetColor === preset.value
                        ? "border-amber-400 scale-110"
                        : "border-transparent hover:border-amber-400/50"
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.widgetColor}
                  onChange={(e) => setFormData({ ...formData, widgetColor: e.target.value })}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.widgetColor}
                  onChange={(e) => setFormData({ ...formData, widgetColor: e.target.value })}
                  className="inset-input flex-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-100/80 text-sm mb-2">Widget Position</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "bottom-right", label: "Bottom Right" },
                  { value: "bottom-left", label: "Bottom Left" },
                  { value: "top-right", label: "Top Right" },
                  { value: "top-left", label: "Top Left" },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, widgetPosition: pos.value })}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      formData.widgetPosition === pos.value
                        ? "brass-accent text-wood-dark"
                        : "bg-black/30 text-amber-100/60 hover:text-amber-100"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="metal-panel p-4 md:p-5">
          <h3 className="text-amber-100 font-semibold mb-4 flex items-center gap-2">
            <span>💬</span>
            Welcome Message
          </h3>

          <textarea
            value={formData.welcomeMessage}
            onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
            placeholder="Enter welcome message..."
            className="inset-input w-full resize-none text-sm"
            rows={4}
          />

          {/* Preview */}
          <div className="mt-4">
            <span className="text-xs text-amber-200/50 mb-2 block">Preview:</span>
            <div
              className="p-4 rounded-lg text-white text-sm"
              style={{ backgroundColor: formData.widgetColor }}
            >
              {formData.welcomeMessage}
            </div>
          </div>
        </div>

        {/* AI & Automation */}
        <div className="metal-panel p-4 md:p-5">
          <h3 className="text-amber-100 font-semibold mb-4 flex items-center gap-2">
            <span>🤖</span>
            AI & Automation
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-amber-100/80 text-sm block">Enable AI Features</span>
                <span className="text-amber-200/50 text-xs">Allow AI to analyze and respond to tickets</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, aiEnabled: !formData.aiEnabled })}
                className={`toggle-switch ${formData.aiEnabled ? "active" : ""}`}
              ></button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-amber-100/80 text-sm block">Auto-Assign Tickets</span>
                <span className="text-amber-200/50 text-xs">Automatically assign tickets to available agents</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, autoAssign: !formData.autoAssign })}
                className={`toggle-switch ${formData.autoAssign ? "active" : ""}`}
              ></button>
            </div>

            {/* Status indicators */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`led ${formData.aiEnabled ? "led-green" : "led-red"}`}></div>
                  <span className="text-xs text-amber-200/60">AI Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`led ${formData.autoAssign ? "led-green" : "led-amber"}`}></div>
                  <span className="text-xs text-amber-200/60">Auto-Assign</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="metal-panel p-4 md:p-5">
          <h3 className="text-amber-100 font-semibold mb-4 flex items-center gap-2">
            <span>📁</span>
            Ticket Categories
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              placeholder="Add new category..."
              className="inset-input flex-1 text-sm"
            />
            <button type="button" onClick={addCategory} className="embossed-btn px-4 py-2 text-sm">
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-sm brass-accent text-wood-dark flex items-center gap-2"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {formData.categories.length === 0 && (
            <p className="text-amber-200/40 text-sm text-center py-4">No categories added</p>
          )}
        </div>
      </div>

      {/* System Status Panel */}
      <div className="mt-6 metal-panel p-4 md:p-5">
        <h3 className="text-amber-100 font-semibold mb-4 flex items-center gap-2">
          <span>📊</span>
          System Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto metal-panel rounded-full flex items-center justify-center mb-2">
              <div className="led led-green"></div>
            </div>
            <span className="text-xs text-amber-200/60 block">Database</span>
            <span className="text-sm text-green-400">Connected</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto metal-panel rounded-full flex items-center justify-center mb-2">
              <div className={`led ${formData.aiEnabled ? "led-green" : "led-red"}`}></div>
            </div>
            <span className="text-xs text-amber-200/60 block">AI Engine</span>
            <span className={`text-sm ${formData.aiEnabled ? "text-green-400" : "text-red-400"}`}>
              {formData.aiEnabled ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto metal-panel rounded-full flex items-center justify-center mb-2">
              <div className="led led-green"></div>
            </div>
            <span className="text-xs text-amber-200/60 block">Real-time</span>
            <span className="text-sm text-green-400">Synced</span>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto metal-panel rounded-full flex items-center justify-center mb-2">
              <div className="led led-amber"></div>
            </div>
            <span className="text-xs text-amber-200/60 block">API Quota</span>
            <span className="text-sm text-amber-400">Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
