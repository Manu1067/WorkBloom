import { useState, useEffect, useMemo } from 'react';
import { clubApi } from '../api/clubApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

export function ClubsView({ user, onUserUpdate }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Track membership per club { [clubId]: boolean }
  const [membershipMap, setMembershipMap] = useState({});

  // Create Club Modal
  const [createModal, setCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Wellness');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Per-club action loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError(null);

      const clubsData = await clubApi.discoverClubs();
      const clubList = Array.isArray(clubsData) ? clubsData : [];
      setClubs(clubList);

      // Check membership for each club if user is logged in
      if (currentEmpId && clubList.length > 0) {
        const memberChecks = await Promise.allSettled(
          clubList.map((c) => clubApi.getMembers(c.id))
        );

        const newMap = {};
        memberChecks.forEach((res, index) => {
          const clubId = clubList[index].id;
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            const isMember = res.value.some((m) => String(m.employeeId) === String(currentEmpId));
            newMap[clubId] = isMember;
          } else {
            newMap[clubId] = false;
          }
        });
        setMembershipMap(newMap);
      }
    } catch (err) {
      setError(err.message || 'Unable to load interest clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, [currentEmpId]);

  const handleJoinLeave = async (club) => {
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }

    const clubId = club.id;
    const isMember = !!membershipMap[clubId];

    try {
      setActionLoadingId(clubId);
      if (isMember) {
        await clubApi.leaveClub(clubId, currentEmpId);
        addToast(`Left circle "${club.name}".`);
        setMembershipMap((prev) => ({ ...prev, [clubId]: false }));
        setClubs((prev) =>
          prev.map((c) => (c.id === clubId ? { ...c, memberCount: Math.max(0, (c.memberCount || 1) - 1) } : c))
        );
      } else {
        await clubApi.joinClub(clubId, currentEmpId);
        addToast(`Joined "${club.name}"! Welcome to the circle. 🌿`);
        setMembershipMap((prev) => ({ ...prev, [clubId]: true }));
        setClubs((prev) =>
          prev.map((c) => (c.id === clubId ? { ...c, memberCount: (c.memberCount || 0) + 1 } : c))
        );
      }
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to update club membership', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateClubSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      addToast('Please enter club name and description.', 'error');
      return;
    }
    if (!currentEmpId) return;

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        imageUrl: imageUrl.trim() || null,
      };

      await clubApi.createClub(currentEmpId, payload);
      addToast(`New interest club "${name}" created! ✨`);
      
      setName('');
      setDescription('');
      setCategory('Wellness');
      setImageUrl('');
      setCreateModal(false);

      await loadClubs();
    } catch (err) {
      addToast(err.message || 'Failed to create club', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    clubs.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    if (selectedCategory === 'ALL') return clubs;
    return clubs.filter((c) => c.category === selectedCategory);
  }, [clubs, selectedCategory]);

  return (
    <div className="content page-shell">
      <PageHero page="clubs" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--paper-warm))), radial-gradient(circle at 85% 15%, hsl(var(--sage) / 0.18), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Clubs & Circles</p>
        <h1>Find your people</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          Side-passions, shared tea breaks, book lovers, and informal hobby circles. No obligations; join whenever your energy allows.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button className="button button-primary" onClick={() => setCreateModal(true)}>
            + Start a New Circle
          </button>
          <button className="button button-quiet" onClick={loadClubs} disabled={loading}>
            🔄 Refresh Circles
          </button>
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted))' }}>Filter:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`button ${selectedCategory === 'ALL' ? 'button-primary' : 'button-quiet'}`}
            style={{ padding: '4px 12px', fontSize: 12, borderRadius: 16 }}
          >
            All Circles
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`button ${selectedCategory === cat ? 'button-primary' : 'button-quiet'}`}
              style={{ padding: '4px 12px', fontSize: 12, borderRadius: 16 }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
        </div>
      )}

      {/* Error Alert */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load clubs</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadClubs}>Try again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClubs.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
          <h3 style={{ margin: '0 0 8px' }}>No circles found</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            {selectedCategory === 'ALL'
              ? 'There are no active interest circles yet. Be the first to start a community circle!'
              : `No circles found under category "${selectedCategory}".`}
          </p>
          <button className="button button-primary" onClick={() => setCreateModal(true)}>
            + Start the first circle
          </button>
        </div>
      )}

      {/* Club Grid */}
      {!loading && !error && filteredClubs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {filteredClubs.map((club) => {
            const isMember = !!membershipMap[club.id];

            return (
              <div
                key={club.id}
                className="card card-pad"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  background: 'hsl(var(--paper))',
                  transition: 'transform 0.2s',
                }}
              >
                <div>
                  {club.imageUrl && (
                    <div style={{ marginBottom: 14, borderRadius: 12, overflow: 'hidden' }}>
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        style={{ width: '100%', height: 140, objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge-pill badge-kind" style={{ fontSize: 11 }}>
                      👥 {club.memberCount || 0} member{(club.memberCount || 0) === 1 ? '' : 's'}
                    </span>
                    <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
                      {club.category || 'General'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{club.name}</h3>
                  
                  {club.creatorName && (
                    <div style={{ fontSize: 12, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 8 }}>
                      Created by {club.creatorName}
                    </div>
                  )}

                  <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {club.description}
                  </p>
                </div>

                <div>
                  <button
                    className={`button ${isMember ? 'button-quiet' : 'button-primary'}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={actionLoadingId === club.id}
                    onClick={() => handleJoinLeave(club)}
                  >
                    {actionLoadingId === club.id
                      ? 'Updating...'
                      : isMember
                      ? 'Member ✓ (Leave Circle)'
                      : 'Join Circle 🌿'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CLUB MODAL */}
      {createModal && (
        <div className="modal-backdrop" onClick={() => setCreateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Community Circle</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Start an Interest Circle</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateClubSubmit}>
              <div className="field">
                <label>Circle Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Morning Garden Walkers"
                  required
                />
              </div>

              <div className="field">
                <label>Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Wellness, Books, Hobbies"
                  required
                />
              </div>

              <div className="field">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share what this circle is about and how often you connect..."
                  rows={3}
                  required
                />
              </div>

              <div className="field">
                <label>Image URL (optional)</label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Circle ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClubsView;
