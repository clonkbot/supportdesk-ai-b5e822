import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function KnowledgeBase() {
  const articles = useQuery(api.knowledgeBase.list, {});
  const createArticle = useMutation(api.knowledgeBase.create);
  const updateArticle = useMutation(api.knowledgeBase.update);
  const deleteArticle = useMutation(api.knowledgeBase.remove);
  const settings = useQuery(api.settings.get);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<Id<"knowledgeBase"> | null>(null);
  type Article = { _id: Id<"knowledgeBase">; title: string; content: string; category: string; tags: string[]; isPublished: boolean; createdAt: number; updatedAt: number };
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const categories = settings?.categories || ["General", "Billing", "Technical", "Sales"];

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "General",
      tags: [],
    });
    setTagInput("");
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await updateArticle({
          id: editingId,
          ...formData,
        });
      } else {
        await createArticle(formData);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags,
    });
    setEditingId(article._id);
    setShowCreate(true);
    setViewingArticle(null);
  };

  const handleDelete = async (id: Id<"knowledgeBase">) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle({ id });
      setViewingArticle(null);
    }
  };

  const handleTogglePublish = async (id: Id<"knowledgeBase">, isPublished: boolean) => {
    await updateArticle({ id, isPublished: !isPublished });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (articles === undefined) {
    return (
      <div className="leather-card p-8 animate-pulse">
        <div className="h-8 bg-gray-700/50 rounded w-1/3 mb-6"></div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Articles List */}
      <div className={`lg:col-span-5 ${viewingArticle ? 'hidden lg:block' : ''}`}>
        <div className="leather-card p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Knowledge Base
              </h2>
              <p className="text-amber-200/50 text-sm mt-1">Support articles & documentation</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="brass-btn px-4 py-2 text-sm"
            >
              + New Article
            </button>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 metal-panel rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">📚</span>
              </div>
              <h3 className="text-xl text-amber-100/60" style={{ fontFamily: "'Playfair Display', serif" }}>
                No Articles Yet
              </h3>
              <p className="text-amber-200/40 mt-2">Create your first knowledge base article</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {articles.map((article: Article) => (
                <button
                  key={article._id}
                  onClick={() => setViewingArticle(article)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    viewingArticle?._id === article._id
                      ? "bg-gradient-to-r from-amber-900/40 to-transparent border-l-4 border-amber-500"
                      : "bg-black/20 hover:bg-black/30 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-medium truncate">{article.title}</h4>
                      <p className="text-amber-200/50 text-xs mt-1">{article.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`led ${article.isPublished ? "led-green" : "led-amber"}`}></div>
                    </div>
                  </div>
                  {article.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded bg-purple-900/30 text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-amber-200/40">+{article.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article View */}
      <div className={`lg:col-span-7 ${!viewingArticle ? 'hidden lg:block' : ''}`}>
        {viewingArticle ? (
          <div className="leather-card p-4 md:p-6">
            <button
              onClick={() => setViewingArticle(null)}
              className="lg:hidden embossed-btn px-3 py-2 mb-4 text-sm"
            >
              ← Back to List
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {viewingArticle.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded brass-accent text-wood-dark">
                    {viewingArticle.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    viewingArticle.isPublished
                      ? "bg-green-900/30 text-green-300 border border-green-700/30"
                      : "bg-amber-900/30 text-amber-300 border border-amber-700/30"
                  }`}>
                    {viewingArticle.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTogglePublish(viewingArticle._id, viewingArticle.isPublished)}
                  className="embossed-btn px-3 py-1 text-xs"
                >
                  {viewingArticle.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleEdit(viewingArticle)}
                  className="embossed-btn px-3 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(viewingArticle._id)}
                  className="embossed-btn px-3 py-1 text-xs text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>

            {viewingArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {viewingArticle.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-300 border border-purple-700/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="metal-panel p-4 md:p-6 max-h-[400px] overflow-y-auto">
              <p className="text-amber-100/90 whitespace-pre-wrap text-sm leading-relaxed">
                {viewingArticle.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="leather-card p-8 md:p-12 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 metal-panel rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl md:text-4xl">📄</span>
            </div>
            <h3 className="text-xl md:text-2xl text-amber-100/60" style={{ fontFamily: "'Playfair Display', serif" }}>
              Select an Article
            </h3>
            <p className="text-amber-200/40 mt-2 text-sm md:text-base">Choose an article from the list to view</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="leather-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl text-amber-100 font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {editingId ? "Edit Article" : "Create New Article"}
                </h3>
                <button onClick={resetForm} className="embossed-btn p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Article title"
                    className="inset-input w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Category</label>
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
                  <label className="block text-amber-100/80 text-sm mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="inset-input flex-1 text-sm"
                    />
                    <button type="button" onClick={addTag} className="embossed-btn px-3 py-2 text-sm">
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-300 flex items-center gap-1"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-amber-100/80 text-sm mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Article content..."
                    className="inset-input w-full resize-none text-sm"
                    rows={10}
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button type="button" onClick={resetForm} className="embossed-btn flex-1 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="brass-btn flex-1 text-sm">
                    {isLoading ? "Saving..." : editingId ? "Update Article" : "Create Article"}
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
