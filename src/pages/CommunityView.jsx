import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function CommunityView({ user, onUserUpdate }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('All')
  const [composerOpen, setComposerOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newCat, setNewCat] = useState('Culture')
  const [submitting, setSubmitting] = useState(false)
  const addToast = useToast()

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await features.community()
      setPosts(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Unable to load community notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDesc.trim()) return
    try {
      setSubmitting(true)
      const res = await features.createPost({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCat,
      })
      if (res.success) {
        addToast('Your reflection has been shared in the community room! 🌿')
        setNewTitle('')
        setNewDesc('')
        setComposerOpen(false)
        loadPosts()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const res = await features.likePost(postId)
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likeCount: res.likes, hasLiked: res.hasLiked }
              : p
          )
        )
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const filtered = category === 'All'
    ? posts
    : posts.filter((p) => (p.category || 'Culture').toLowerCase() === category.toLowerCase())

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Room for real talk</p>
        <h1>Community reflections & honest notes</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          A safe, quiet hearth where colleagues share honest insights about sustainable pacing, workplace culture, and small daily victories.
        </p>
        <div style={{ marginTop: 20 }}>
          <button
            className="button button-primary"
            onClick={() => setComposerOpen((v) => !v)}
          >
            {composerOpen ? 'Close composer' : '+ Share a reflection'}
          </button>
        </div>
      </div>

      {composerOpen && (
        <div className="card card-pad" style={{ marginBottom: 28, borderColor: 'hsl(var(--sage) / 0.5)' }}>
          <h3 style={{ marginBottom: 14 }}>Share with your colleagues</h3>
          <form onSubmit={handleCreatePost}>
            <div className="field">
              <label htmlFor="post-title">Headline or takeaway</label>
              <input
                id="post-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Protecting morning focus blocks changed our sprint..."
                required
              />
            </div>
            <div className="field">
              <label htmlFor="post-category">Category</label>
              <select
                id="post-category"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              >
                <option value="Culture">Culture & Boundaries</option>
                <option value="Mindfulness">Mindfulness & Rest</option>
                <option value="Community">Community & Clubs</option>
                <option value="Wins">Small Wins & Learnings</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="post-desc">Thoughts, observations, or context</label>
              <textarea
                id="post-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Write honestly and gently..."
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setComposerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={submitting}
              >
                {submitting ? 'Sharing...' : 'Publish note'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'Culture', 'Mindfulness', 'Community', 'Wins'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`button ${category === cat ? 'button-primary' : 'button-quiet'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          No reflections in this category yet. Be the first to start a conversation!
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((post) => (
          <article
            key={post.id}
            className="card card-pad"
            style={{ transition: 'transform 0.2s', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <span className="badge-pill badge-cultivator" style={{ marginBottom: 6 }}>
                  {post.category || 'Culture'}
                </span>
                <h3 style={{ margin: '4px 0 6px', fontSize: 18 }}>{post.title}</h3>
              </div>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted))', whiteSpace: 'nowrap' }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
              </span>
            </div>

            <p style={{ color: 'hsl(var(--ink) / 0.85)', fontSize: 14, lineHeight: 1.55, margin: '8px 0 16px' }}>
              {post.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--line) / 0.6)', paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'hsl(var(--muted))' }}>
                <span style={{ fontWeight: 600, color: 'hsl(var(--ink))' }}>{post.author}</span>
                <span>·</span>
                <span>{post.department || post.authorRole || 'Team'}</span>
              </div>

              <button
                className={`button ${post.hasLiked ? 'button-coral' : 'button-quiet'}`}
                style={{ padding: '6px 12px', fontSize: 11 }}
                onClick={() => handleLike(post.id)}
              >
                ❤️ {post.likeCount || 0} {post.likeCount === 1 ? 'appreciation' : 'appreciations'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
