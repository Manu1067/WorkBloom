import { useState, useEffect } from 'react';
import { communityApi } from '../api/communityApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

const MAX_POST_LENGTH = 2000;

// Helper for formatting timestamps safely
function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    let d;
    if (Array.isArray(dateStr)) {
      d = new Date(dateStr[0], dateStr[1] - 1, dateStr[2], dateStr[3] || 0, dateStr[4] || 0);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return 'Recently';

    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// True when the post was changed after publishing (>2s gap avoids save-time noise)
function isEdited(post) {
  if (!post?.updatedAt || !post?.createdAt) return false;
  const toDate = (v) => (Array.isArray(v) ? new Date(v[0], v[1] - 1, v[2], v[3] || 0, v[4] || 0, v[5] || 0) : new Date(v));
  const diff = toDate(post.updatedAt) - toDate(post.createdAt);
  return Number.isFinite(diff) && diff > 2000;
}

// Get initials for author avatar
function getInitials(name) {
  if (!name) return 'WB';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function CommunityView({ user, onUserUpdate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active expanded comments per post { [postId]: boolean }
  const [expandedComments, setExpandedComments] = useState({});
  // Loaded comments map { [postId]: Array<CommentResponse> }
  const [postComments, setPostComments] = useState({});
  // Loading state for comments { [postId]: boolean }
  const [commentsLoading, setCommentsLoading] = useState({});
  // New comment text inputs { [postId]: string }
  const [newCommentTexts, setNewCommentTexts] = useState({});
  // Submitting comment state { [postId]: boolean }
  const [commentSubmitting, setCommentSubmitting] = useState({});

  // Action loading for likes/deletes
  const [likeLoading, setLikeLoading] = useState({});

  // Edit-post modal state
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityApi.getFeed(currentEmpId);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load community feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [currentEmpId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('Please enter post content.', 'error');
      return;
    }
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await communityApi.createPost(currentEmpId, {
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
      });

      addToast('Your reflection has been shared in the community hearth! 🌿');
      setContent('');
      setImageUrl('');
      setComposerOpen(false);
      await loadFeed();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to create post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (post) => {
    if (!currentEmpId) return;
    const postId = post.id;

    try {
      setLikeLoading((prev) => ({ ...prev, [postId]: true }));
      if (post.likedByViewer) {
        await communityApi.unlikePost(postId, currentEmpId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likedByViewer: false, likeCount: Math.max(0, p.likeCount - 1) }
              : p
          )
        );
      } else {
        const updatedPost = await communityApi.likePost(postId, currentEmpId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likedByViewer: true,
                  likeCount: updatedPost?.likeCount !== undefined ? updatedPost.likeCount : p.likeCount + 1,
                }
              : p
          )
        );
      }
    } catch (err) {
      addToast(err.message || 'Failed to update like status', 'error');
    } finally {
      setLikeLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content || '');
    setEditImageUrl(post.imageUrl || '');
    setEditError(null);
  };

  const closeEditPost = () => {
    if (editSaving) return;
    setEditingPost(null);
    setEditError(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    const trimmed = editContent.trim();
    if (!trimmed) {
      setEditError('Post content cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_POST_LENGTH) {
      setEditError(`Post content must be ${MAX_POST_LENGTH} characters or fewer.`);
      return;
    }
    if (trimmed === (editingPost.content || '').trim() && editImageUrl.trim() === (editingPost.imageUrl || '')) {
      setEditingPost(null);
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);
      // The server decides whether the caller owns the post (JWT identity);
      // a 403 here means it is not theirs.
      const updated = await communityApi.updatePost(editingPost.id, {
        content: trimmed,
        imageUrl: editImageUrl.trim() || null,
      });

      // Merge into the existing row so likes, comment count, ordering and
      // viewer state stay exactly as they were.
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                content: updated?.content ?? trimmed,
                imageUrl: updated?.imageUrl ?? (editImageUrl.trim() || null),
                updatedAt: updated?.updatedAt ?? p.updatedAt,
              }
            : p
        )
      );
      setEditingPost(null);
      addToast('Your post has been updated ✏️');
    } catch (err) {
      setEditError(
        err?.status === 403
          ? 'You can only edit your own posts.'
          : err?.message || 'Could not save your changes. Please try again.'
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    if (!currentEmpId) return;

    try {
      await communityApi.deletePost(postId, currentEmpId);
      addToast('Post removed.');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      addToast(err.message || 'Failed to delete post', 'error');
    }
  };

  const toggleComments = async (postId) => {
    const isExpanded = !expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: isExpanded }));

    if (isExpanded && !postComments[postId]) {
      try {
        setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
        const comments = await communityApi.getComments(postId);
        setPostComments((prev) => ({ ...prev, [postId]: Array.isArray(comments) ? comments : [] }));
      } catch (err) {
        addToast(err.message || 'Failed to load comments', 'error');
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    const text = (newCommentTexts[postId] || '').trim();
    if (!text || !currentEmpId) return;

    try {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
      const newComment = await communityApi.addComment(postId, currentEmpId, { content: text });
      
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      // Increment post comment count
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p))
      );

      setNewCommentTexts((prev) => ({ ...prev, [postId]: '' }));
      addToast('Comment added 💬');
    } catch (err) {
      addToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!currentEmpId) return;

    try {
      await communityApi.deleteComment(postId, commentId, currentEmpId);
      setPostComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));

      // Decrement post comment count
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, (p.commentCount || 1) - 1) } : p))
      );

      addToast('Comment removed.');
    } catch (err) {
      addToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div className="content page-shell">
      <PageHero page="community" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--paper-warm))), radial-gradient(circle at 85% 15%, hsl(var(--coral-soft) / 0.2), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Room for Real Talk</p>
        <h1>Community reflections & honest notes</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          A safe, quiet hearth where colleagues share honest insights about sustainable pacing, workplace culture, team gratitude, and daily victories.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button
            className="button button-primary"
            onClick={() => setComposerOpen((v) => !v)}
          >
            {composerOpen ? 'Close Composer' : '✍️ Share a Reflection'}
          </button>
          <button className="button button-quiet" onClick={loadFeed} disabled={loading}>
            🔄 Refresh Feed
          </button>
        </div>
      </div>

      {/* Post Composer */}
      {composerOpen && (
        <div 
          className="card card-pad" 
          style={{ 
            marginBottom: 28, 
            borderColor: 'hsl(var(--coral) / 0.4)',
            boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)' 
          }}
        >
          <h3 style={{ margin: '0 0 14px', fontSize: 18 }}>Share with your colleagues</h3>
          <form onSubmit={handleCreatePost}>
            <div className="field">
              <label htmlFor="post-content">Reflection or thoughts *</label>
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an insight, boundary success, or honest workplace observation..."
                rows={4}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="post-image">Image URL (optional)</label>
              <input
                id="post-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
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
                {submitting ? 'Publishing...' : 'Publish Note 🌿'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
        </div>
      )}

      {/* Error Alert */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load community posts</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadFeed}>Try again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <h3 style={{ margin: '0 0 8px' }}>No reflections yet</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            Be the first to share an encouragement, observation, or question with your team!
          </p>
          <button className="button button-primary" onClick={() => setComposerOpen(true)}>
            ✍️ Write the first post
          </button>
        </div>
      )}

      {/* Feed List */}
      {!loading && !error && posts.length > 0 && (
        <div style={{ display: 'grid', gap: 20 }}>
          {posts.map((post) => {
            const timeAgo = formatTimeAgo(post.createdAt);
            const initials = getInitials(post.authorName);
            const isOwner = currentEmpId && String(post.authorId) === String(currentEmpId);
            const canDelete = isOwner || isHrOrAdmin;
            const commentsOpen = !!expandedComments[post.id];
            const commentsList = postComments[post.id] || [];
            const isCommentsLoading = commentsLoading[post.id];

            return (
              <article
                key={post.id}
                className="card card-pad"
                style={{
                  transition: 'transform 0.2s',
                  position: 'relative',
                  background: 'hsl(var(--paper))',
                }}
              >
                {/* Author Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'hsl(var(--coral-soft))',
                        color: 'hsl(var(--coral))',
                        fontWeight: 700,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid hsl(var(--coral-soft) / 0.8)',
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 15, color: 'hsl(var(--ink))' }}>
                        {post.authorName || 'WorkBloom Colleague'}
                      </strong>
                      <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                        {timeAgo}
                        {isEdited(post) && ' · edited'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Edit is author-only (the server enforces this too); HR/Admin can still delete. */}
                    {isOwner && (
                      <button
                        className="button button-quiet"
                        style={{ padding: '4px 10px', fontSize: 12 }}
                        onClick={() => openEditPost(post)}
                        title="Edit your post"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="button button-quiet"
                        style={{ padding: '4px 10px', fontSize: 12, color: 'hsl(var(--coral))' }}
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete post"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p 
                  style={{ 
                    color: 'hsl(var(--ink) / 0.9)', 
                    fontSize: 15, 
                    lineHeight: 1.6, 
                    margin: '0 0 16px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {post.content}
                </p>

                {/* Optional Image */}
                {post.imageUrl && (
                  <div style={{ marginBottom: 16, overflow: 'hidden', borderRadius: 12 }}>
                    <img
                      src={post.imageUrl}
                      alt="Community attachment"
                      style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}

                {/* Interaction Footer Bar */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid hsl(var(--line) / 0.6)', 
                    paddingTop: 12 
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      className={`button ${post.likedByViewer ? 'button-coral' : 'button-quiet'}`}
                      style={{ padding: '6px 14px', fontSize: 12, gap: 6 }}
                      onClick={() => handleToggleLike(post)}
                      disabled={likeLoading[post.id]}
                    >
                      {post.likedByViewer ? '❤️ Liked' : '🤍 Like'} ({post.likeCount || 0})
                    </button>

                    <button
                      className="button button-quiet"
                      style={{ padding: '6px 14px', fontSize: 12, gap: 6 }}
                      onClick={() => toggleComments(post.id)}
                    >
                      💬 Comments ({post.commentCount || 0})
                    </button>
                  </div>
                </div>

                {/* Expandable Comments Drawer */}
                {commentsOpen && (
                  <div 
                    style={{ 
                      marginTop: 16, 
                      paddingTop: 16, 
                      borderTop: '1px dashed hsl(var(--line))',
                      backgroundColor: 'hsl(var(--paper-warm) / 0.5)',
                      borderRadius: 12,
                      padding: 14
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'hsl(var(--sage))' }}>Comments</h4>

                    {isCommentsLoading ? (
                      <div className="skeleton" style={{ height: 60, borderRadius: 8, marginBottom: 12 }} />
                    ) : commentsList.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'hsl(var(--muted))', fontStyle: 'italic', margin: '0 0 12px' }}>
                        No comments yet. Start the conversation below!
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                        {commentsList.map((comm) => {
                          const commOwner = currentEmpId && String(comm.authorId) === String(currentEmpId);
                          return (
                            <div
                              key={comm.id}
                              style={{
                                background: 'hsl(var(--paper))',
                                padding: '10px 12px',
                                borderRadius: 10,
                                border: '1px solid hsl(var(--line) / 0.5)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <strong style={{ fontSize: 13 }}>{comm.authorName || 'Colleague'}</strong>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                                    {formatTimeAgo(comm.createdAt)}
                                  </span>
                                  {(commOwner || isHrOrAdmin) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comm.id)}
                                      style={{ background: 'none', border: 'none', color: 'hsl(var(--coral))', cursor: 'pointer', fontSize: 11 }}
                                      title="Delete comment"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--ink) / 0.9)' }}>
                                {comm.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment Form */}
                    <form 
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      style={{ display: 'flex', gap: 8 }}
                    >
                      <input
                        value={newCommentTexts[post.id] || ''}
                        onChange={(e) => setNewCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder="Write a warm response..."
                        style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                        required
                      />
                      <button
                        type="submit"
                        className="button button-primary"
                        style={{ padding: '8px 16px', fontSize: 12 }}
                        disabled={commentSubmitting[post.id]}
                      >
                        {commentSubmitting[post.id] ? 'Posting...' : 'Reply'}
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div className="modal-backdrop" onClick={closeEditPost} role="dialog" aria-modal="true" aria-labelledby="edit-post-title">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Your reflection</p>
                <h2 id="edit-post-title" style={{ margin: 0, fontSize: 22 }}>Edit post</h2>
              </div>
              <button className="modal-close-btn" onClick={closeEditPost} aria-label="Close editor">✕</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="field">
                <label htmlFor="edit-post-content">Reflection or thoughts *</label>
                <textarea
                  id="edit-post-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  maxLength={MAX_POST_LENGTH + 200}
                  autoFocus
                  disabled={editSaving}
                />
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: 11,
                    marginTop: 4,
                    color: editContent.trim().length > MAX_POST_LENGTH ? 'hsl(var(--coral))' : 'hsl(var(--muted))',
                  }}
                >
                  {editContent.trim().length} / {MAX_POST_LENGTH}
                </div>
              </div>

              <div className="field">
                <label htmlFor="edit-post-image">Image URL (optional)</label>
                <input
                  id="edit-post-image"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={editSaving}
                />
              </div>

              {editError && (
                <p role="alert" style={{ margin: '0 0 8px', fontSize: 13, color: 'hsl(var(--coral))' }}>{editError}</p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" className="button button-quiet" onClick={closeEditPost} disabled={editSaving}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={editSaving || !editContent.trim()}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityView;
