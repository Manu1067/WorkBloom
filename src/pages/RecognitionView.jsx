import { useState, useEffect, useMemo } from 'react';
import { recognitionApi } from '../api/recognitionApi';
import { employeeApi } from '../api/employeeApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

// Helper for formatting date
function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  try {
    let d;
    if (Array.isArray(dateStr)) {
      d = new Date(dateStr[0], dateStr[1] - 1, dateStr[2]);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently';
  }
}

// The backend enum (com.workbloom.recognition.entity.RecognitionType) only accepts:
// ACHIEVEMENT, RECOGNITION, BEST_PERFORMER, MILESTONE, CERTIFICATION.
// The friendly UI categories keep their own ids/labels; `apiType` is what is
// actually sent. (Previously ids like TEAMWORK were sent verbatim -> HTTP 400.)
const RECOGNITION_TYPES = [
  { id: 'PEER_APPRECIATION', apiType: 'RECOGNITION', label: 'Peer Appreciation', emoji: '🌸', badgeStyle: 'badge-calm' },
  { id: 'WELLNESS_CHAMPION', apiType: 'ACHIEVEMENT', label: 'Wellness Champion', emoji: '🌿', badgeStyle: 'badge-kind' },
  { id: 'TEAMWORK', apiType: 'RECOGNITION', label: 'Teamwork & Support', emoji: '🤝', badgeStyle: 'badge-cultivator' },
  { id: 'LEADERSHIP', apiType: 'BEST_PERFORMER', label: 'Steadfast Leadership', emoji: '⚓', badgeStyle: 'badge-craftsman' },
  { id: 'INNOVATION', apiType: 'ACHIEVEMENT', label: 'Craft & Innovation', emoji: '✨', badgeStyle: 'badge-craftsman' },
  { id: 'CUSTOMER_FIRST', apiType: 'MILESTONE', label: 'Empathy First', emoji: '💛', badgeStyle: 'badge-kind' },
];

// Display config for what the server returns (its own enum values).
const API_TYPE_DISPLAY = {
  RECOGNITION: { label: 'Appreciation', emoji: '🌸', badgeStyle: 'badge-calm' },
  ACHIEVEMENT: { label: 'Achievement', emoji: '🏅', badgeStyle: 'badge-kind' },
  BEST_PERFORMER: { label: 'Best Performer', emoji: '🏆', badgeStyle: 'badge-craftsman' },
  MILESTONE: { label: 'Milestone', emoji: '🎯', badgeStyle: 'badge-cultivator' },
  CERTIFICATION: { label: 'Certification', emoji: '📜', badgeStyle: 'badge-craftsman' },
};

export function RecognitionView({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('FEED'); // 'FEED', 'MY_RECOGNITIONS', 'BADGES'
  const [recognitions, setRecognitions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colleaguesError, setColleaguesError] = useState(null);

  // Give Recognition Modal
  const [giveModalOpen, setGiveModalOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [recTitle, setRecTitle] = useState('');
  const [recMessage, setRecMessage] = useState('');
  const [recType, setRecType] = useState('PEER_APPRECIATION');
  const [recImageUrl, setRecImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Create Badge Modal (HR/Admin)
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [badgeName, setBadgeName] = useState('');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeIconUrl, setBadgeIconUrl] = useState('');

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let recsPromise;
      if (activeTab === 'MY_RECOGNITIONS' && currentEmpId) {
        recsPromise = recognitionApi.getEmployeeRecognitions(currentEmpId);
      } else {
        recsPromise = recognitionApi.getFeed();
      }

      const [recsData, badgesData, empRes] = await Promise.allSettled([
        recsPromise,
        recognitionApi.getAllBadges(),
        // GET /api/employees is paginated (default size 10) and returns
        // EmployeeSummaryResponse rows (no salary/PII), so ask for a full page.
        employeeApi.getAll({ size: 500 }),
      ]);

      if (recsData.status === 'fulfilled') {
        setRecognitions(Array.isArray(recsData.value) ? recsData.value : []);
      } else {
        setRecognitions([]);
        setError(recsData.reason?.message || 'Unable to load recognition data');
      }

      if (badgesData.status === 'fulfilled') {
        setBadges(Array.isArray(badgesData.value) ? badgesData.value : []);
      } else {
        setBadges([]);
      }

      if (empRes.status === 'fulfilled') {
        const empList = Array.isArray(empRes.value) ? empRes.value : (empRes.value?.content || empRes.value?.employees || []);
        // Filter out current user from dropdown options
        setColleagues(empList.filter((e) => String(e.id) !== String(currentEmpId)));
        setColleaguesError(null);
      } else {
        setColleagues([]);
        setColleaguesError(empRes.reason?.message || 'Could not load your colleagues');
      }
    } catch (err) {
      setError(err.message || 'Unable to load recognition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, currentEmpId]);

  const handleSendRecognition = async (e) => {
    e.preventDefault();
    if (!recipientId || !recTitle.trim() || !recMessage.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        employeeId: Number(recipientId),
        title: recTitle.trim(),
        message: recMessage.trim(),
        type: (RECOGNITION_TYPES.find((t) => t.id === recType) || RECOGNITION_TYPES[0]).apiType,
        imageUrl: recImageUrl.trim() || null,
      };

      await recognitionApi.createRecognition(currentEmpId, payload);
      addToast('Appreciation sent! 🌸 Thank you for spreading care.');
      
      setRecTitle('');
      setRecMessage('');
      setRecipientId('');
      setRecImageUrl('');
      setGiveModalOpen(false);

      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to send recognition', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    if (!badgeName.trim() || !badgeDesc.trim()) {
      addToast('Please enter badge name and description.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await recognitionApi.createBadge({
        name: badgeName.trim(),
        description: badgeDesc.trim(),
        iconUrl: badgeIconUrl.trim() || null,
      });

      addToast(`New badge "${badgeName}" created! ✨`);
      setBadgeName('');
      setBadgeDesc('');
      setBadgeIconUrl('');
      setBadgeModalOpen(false);

      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create badge', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const typeConfigMap = useMemo(() => {
    const map = {};
    RECOGNITION_TYPES.forEach((t) => { map[t.id] = t; });
    return map;
  }, []);

  return (
    <div className="content page-shell">
      <PageHero page="appreciation" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'radial-gradient(circle at 88% 15%, hsl(var(--coral-soft) / 0.35), transparent 40%), hsl(var(--paper-warm))'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Celebration & Gratitude</p>
        <h1>The Wall of Appreciation</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          WorkBloom thrives on the invisible acts of care: the teammate who calms a storm, the mentor who listens, and the colleague who brings warmth to every meeting.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="button button-coral" onClick={() => setGiveModalOpen(true)}>
            🌸 Celebrate a Colleague
          </button>
          {isHrOrAdmin && (
            <button className="button button-quiet" onClick={() => setBadgeModalOpen(true)}>
              + Create Company Badge
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1px solid hsl(var(--line))', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('FEED')}
          className={`button ${activeTab === 'FEED' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          🌟 Company Wall
        </button>
        <button
          onClick={() => setActiveTab('MY_RECOGNITIONS')}
          className={`button ${activeTab === 'MY_RECOGNITIONS' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          🏆 My Recognition History
        </button>
        <button
          onClick={() => setActiveTab('BADGES')}
          className={`button ${activeTab === 'BADGES' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          🏅 Badges Directory ({badges.length})
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 180, borderRadius: 16 }} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load recognitions</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadData}>Try again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && activeTab !== 'BADGES' && recognitions.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌸</div>
          <h3 style={{ margin: '0 0 8px' }}>
            {activeTab === 'MY_RECOGNITIONS' ? 'No recognitions on your record yet' : 'The appreciation wall is quiet'}
          </h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 440, margin: '0 auto 20px' }}>
            {activeTab === 'MY_RECOGNITIONS'
              ? 'Recognitions given to or by you will appear here.'
              : 'Be the first to send a note of appreciation to a teammate today!'}
          </p>
          <button className="button button-coral" onClick={() => setGiveModalOpen(true)}>
            🌸 Send Appreciation
          </button>
        </div>
      )}

      {/* Recognition Feed / History Cards */}
      {!loading && !error && activeTab !== 'BADGES' && recognitions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {recognitions.map((rec) => {
            const typeConfig = typeConfigMap[rec.type] || API_TYPE_DISPLAY[rec.type] || { label: rec.type || 'Appreciation', emoji: '✨', badgeStyle: 'badge-calm' };
            const dateStr = formatDate(rec.createdAt);

            return (
              <article
                key={rec.id}
                className="card card-pad"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, hsl(var(--paper)), hsl(var(--paper-warm)))',
                  border: '1px solid hsl(var(--line) / 0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: '0 4px 16px -4px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className={`badge-pill ${typeConfig.badgeStyle}`}>
                      {typeConfig.emoji} {typeConfig.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                      {dateStr}
                    </span>
                  </div>

                  {rec.title && (
                    <h3 style={{ margin: '0 0 8px', fontSize: 16, color: 'hsl(var(--ink))' }}>
                      {rec.title}
                    </h3>
                  )}

                  <p style={{ fontStyle: 'italic', fontSize: 14, lineHeight: 1.6, color: 'hsl(var(--ink) / 0.9)', margin: '0 0 16px' }}>
                    “{rec.message}”
                  </p>

                  {rec.imageUrl && (
                    <div style={{ marginBottom: 14, borderRadius: 10, overflow: 'hidden' }}>
                      <img
                        src={rec.imageUrl}
                        alt="Recognition attachment"
                        style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid hsl(var(--line) / 0.5)', 
                    paddingTop: 12,
                    marginTop: 8
                  }}
                >
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>From </span>
                    <strong>{rec.authorName || 'Colleague'}</strong>
                    <span style={{ color: 'hsl(var(--muted))' }}> to </span>
                    <strong style={{ color: 'hsl(var(--coral))' }}>{rec.employeeName || 'Colleague'}</strong>
                  </div>

                  <div style={{ fontSize: 12, color: 'hsl(var(--coral))', fontWeight: 600 }}>
                    🌸 {rec.reactionCount || 1}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Badges Directory Tab */}
      {!loading && !error && activeTab === 'BADGES' && (
        <div>
          {badges.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
              <h3>No badges defined</h3>
              <p style={{ color: 'hsl(var(--muted))', maxWidth: 400, margin: '0 auto 16px' }}>
                Company badges celebrate specialized qualities and achievements.
              </p>
              {isHrOrAdmin && (
                <button className="button button-primary" onClick={() => setBadgeModalOpen(true)}>
                  + Create Badge
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {badges.map((b) => (
                <div
                  key={b.id || b.name}
                  className="card card-pad"
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    background: 'hsl(var(--paper))',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'hsl(var(--coral-soft) / 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                      flexShrink: 0,
                    }}
                  >
                    {b.iconUrl ? <img src={b.iconUrl} alt={b.name} style={{ width: 28, height: 28 }} /> : '🏅'}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{b.name}</h4>
                    <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.4 }}>
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GIVE RECOGNITION MODAL */}
      {giveModalOpen && (
        <div className="modal-backdrop" onClick={() => setGiveModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--coral))' }}>Appreciation Card</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Celebrate a Colleague</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setGiveModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSendRecognition}>
              <div className="field">
                <label>Colleague to appreciate *</label>
                <select 
                  value={recipientId} 
                  onChange={(e) => setRecipientId(e.target.value)} 
                  required
                >
                  <option value="">{colleaguesError ? 'Colleagues unavailable' : 'Select a teammate...'}</option>
                  {colleagues.map((c) => {
                    const name = c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Employee #${c.id}`;
                    return (
                      <option key={c.id} value={c.id}>
                        {name} {c.department ? `(${c.department})` : ''}
                      </option>
                    );
                  })}
                </select>
                {colleaguesError && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'hsl(var(--coral))' }}>
                    {colleaguesError}. Close and reopen this card or use "Try again" after the page reloads.
                  </p>
                )}
              </div>

              <div className="field">
                <label>Headline / Title *</label>
                <input
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="e.g. Steer during client launch crisis"
                  required
                />
              </div>

              <div className="field">
                <label>Appreciation Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
                  {RECOGNITION_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setRecType(t.id)}
                      className="card"
                      style={{
                        padding: 10,
                        textAlign: 'left',
                        borderColor: recType === t.id ? 'hsl(var(--coral))' : 'hsl(var(--line))',
                        background: recType === t.id ? 'hsl(var(--coral-soft) / 0.4)' : 'hsl(var(--paper))',
                        cursor: 'pointer',
                      }}
                    >
                      <strong style={{ fontSize: 13, display: 'block', color: 'hsl(var(--ink))' }}>
                        {t.emoji} {t.label}
                      </strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Message of Gratitude *</label>
                <textarea
                  value={recMessage}
                  onChange={(e) => setRecMessage(e.target.value)}
                  placeholder="Share specifically what they did and how it brought value or relief..."
                  rows={4}
                  required
                />
              </div>

              <div className="field">
                <label>Image URL (optional)</label>
                <input
                  value={recImageUrl}
                  onChange={(e) => setRecImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setGiveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-coral" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Appreciation 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BADGE MODAL */}
      {badgeModalOpen && (
        <div className="modal-backdrop" onClick={() => setBadgeModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>HR Admin</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Create Company Badge</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setBadgeModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateBadge}>
              <div className="field">
                <label>Badge Name *</label>
                <input
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="e.g. Calm Anchor"
                  required
                />
              </div>

              <div className="field">
                <label>Badge Description *</label>
                <textarea
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="e.g. Awarded for bringing steadiness and peace under tight deadlines."
                  rows={3}
                  required
                />
              </div>

              <div className="field">
                <label>Icon URL (optional)</label>
                <input
                  value={badgeIconUrl}
                  onChange={(e) => setBadgeIconUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setBadgeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Badge ✨'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognitionView;
