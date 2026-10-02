import { useState, useEffect, useMemo } from 'react';
import { impactApi } from '../api/impactApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Only a real uploaded photo is shown on an activity. Activities without one
// get a neutral placeholder - the supplied Impact banner is a page hero with
// its own lettering, so it is not reused as an activity photo.
function resolveEventImage(evt) {
  return evt?.imageUrl ? { src: evt.imageUrl, uploaded: true } : null;
}

function EventBanner({ evt, height = 150, onClick }) {
  const [failed, setFailed] = useState(false);
  const img = failed ? null : resolveEventImage(evt);
  const style = { width: '100%', height, borderRadius: 10, marginBottom: 12, display: 'block' };
  const content = img ? (
    <img
      src={img.src}
      alt={`Photo for ${evt.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ ...style, objectFit: 'cover' }}
    />
  ) : (
    <div
      aria-hidden="true"
      style={{
        ...style,
        display: 'grid',
        placeItems: 'center',
        fontSize: 36,
        background: 'linear-gradient(135deg, hsl(var(--sage) / 0.22), hsl(var(--paper-warm)))',
      }}
    >
      🌱
    </div>
  );
  if (!onClick) return content;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View details for ${evt.title}`}
      style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}
    >
      {content}
    </button>
  );
}

// Helper for formatting date
function formatDate(dateVal) {
  if (!dateVal) return 'Date TBD';
  try {
    let d;
    if (Array.isArray(dateVal)) {
      d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2]);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return String(dateVal);
  }
}

export function ImpactView({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('EVENTS'); // 'EVENTS' | 'MY_REGISTRATIONS'
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Event Modal (HR/Admin)
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);

  // Action loading for registrations
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsPromise = impactApi.getActiveEvents();
      const regsPromise = currentEmpId ? impactApi.getEmployeeRegistrations(currentEmpId) : Promise.resolve([]);

      const [eventsRes, regsRes] = await Promise.allSettled([
        eventsPromise,
        regsPromise,
      ]);

      if (eventsRes.status === 'fulfilled') {
        setEvents(Array.isArray(eventsRes.value) ? eventsRes.value : []);
      } else {
        setEvents([]);
      }

      if (regsRes.status === 'fulfilled') {
        setRegistrations(Array.isArray(regsRes.value) ? regsRes.value : []);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load social impact initiatives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentEmpId]);

  // Map of eventId -> Registration object for active registrations
  const activeRegMap = useMemo(() => {
    const map = {};
    registrations.forEach((r) => {
      const eId = r.eventId;
      if (eId && r.status !== 'CANCELLED') {
        map[eId] = r;
      }
    });
    return map;
  }, [registrations]);

  const handleRegister = async (event) => {
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }
    const eventId = event.id;

    try {
      setActionLoadingId(eventId);
      // Backend RegistrationRequest DTO field is `eventId`, not
      // `volunteerEventId` - sending the wrong key meant Jackson silently
      // deserialized eventId as null on every registration attempt.
      await impactApi.registerForEvent(currentEmpId, { eventId });
      addToast(`Signed up to volunteer for "${event.title}"! 💚 Thank you for lending a hand.`);
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to sign up for volunteer event', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelRegistration = async (regId, eventTitle) => {
    if (!currentEmpId) return;

    try {
      setActionLoadingId(regId);
      await impactApi.cancelRegistration(regId, currentEmpId);
      addToast(`Withdrew registration for "${eventTitle}".`);
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to cancel volunteer registration', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Release the object URL when the preview changes / component unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
  };

  const handleImageChosen = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allows re-selecting the same file after removing it
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageFile(null);
      setImagePreview(null);
      setImageError('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageFile(null);
      setImagePreview(null);
      setImageError(`That image is ${(file.size / (1024 * 1024)).toFixed(1)} MB. The maximum is 5 MB.`);
      return;
    }
    setImageError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const closeCreateModal = () => {
    setCreateModal(false);
    clearImage();
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !eventDate || !location.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        eventDate,
        maxVolunteers: Number(maxVolunteers) || 15,
        active: true,
      };

      // Optional photo: upload first (multipart), then reference its URL.
      if (imageFile) {
        const uploaded = await impactApi.uploadEventImage(imageFile);
        if (!uploaded?.imageUrl) throw new Error('Image upload did not return a URL.');
        payload.imageUrl = uploaded.imageUrl;
      }

      await impactApi.createEvent(payload);
      addToast(`New impact initiative "${title}" created! 🌱`);
      
      setTitle('');
      setDescription('');
      setLocation('');
      setEventDate('');
      setMaxVolunteers(15);
      clearImage();
      setCreateModal(false);

      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create impact event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRegistrationsList = useMemo(() => {
    return registrations.filter((r) => r.status !== 'CANCELLED');
  }, [registrations]);

  return (
    <div className="content page-shell">
      <PageHero page="impact" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 85% 15%, hsl(var(--sage) / 0.22), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Community Contribution</p>
        <h1>Leave something better</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          WorkBloom gives every employee 2 paid volunteer days each quarter. Find a local cause or team volunteering event that speaks to your heart and lend a hand.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={() => setCreateModal(true)}>
              + Schedule Impact Initiative
            </button>
          )}
          <button className="button button-quiet" onClick={loadData} disabled={loading}>
            🔄 Refresh Events
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid hsl(var(--line))', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`button ${activeTab === 'EVENTS' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          🌱 Volunteer Initiatives ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('MY_REGISTRATIONS')}
          className={`button ${activeTab === 'MY_REGISTRATIONS' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          📋 My Volunteer Days ({activeRegistrationsList.length})
        </button>
      </div>

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
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load social impact initiatives</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadData}>Try again</button>
        </div>
      )}

      {/* Empty State Events */}
      {!loading && !error && activeTab === 'EVENTS' && events.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
          <h3 style={{ margin: '0 0 8px' }}>No active volunteer events</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            There are currently no community impact initiatives scheduled. Check back soon or create one!
          </p>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={() => setCreateModal(true)}>
              + Schedule an Initiative
            </button>
          )}
        </div>
      )}

      {/* Empty State My Registrations */}
      {!loading && !error && activeTab === 'MY_REGISTRATIONS' && activeRegistrationsList.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💚</div>
          <h3 style={{ margin: '0 0 8px' }}>No volunteer sign-ups yet</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            You haven't registered for any impact events yet. Browse the opportunities and sign up!
          </p>
          <button className="button button-primary" onClick={() => setActiveTab('EVENTS')}>
            Browse Volunteer Initiatives
          </button>
        </div>
      )}

      {/* INITIATIVES CATALOG GRID */}
      {!loading && !error && activeTab === 'EVENTS' && events.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {events.map((evt) => {
            const dateStr = formatDate(evt.eventDate);
            const activeReg = activeRegMap[evt.id];
            const isRegistered = !!activeReg;

            return (
              <div
                key={evt.id}
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
                  <EventBanner evt={evt} onClick={() => setDetailEvent(evt)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge-pill badge-cultivator" style={{ fontSize: 11 }}>
                      🌱 Community Impact
                    </span>
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                      👥 Max {evt.maxVolunteers || 15} volunteers
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{evt.title}</h3>

                  <div style={{ fontSize: 12, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 8 }}>
                    📅 {dateStr} · 📍 {evt.location || 'TBD'}
                  </div>

                  <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {evt.description}
                  </p>
                </div>

                <div>
                  {isRegistered ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--line) / 0.6)', paddingTop: 12 }}>
                      <span className="badge-pill badge-kind" style={{ fontSize: 11 }}>
                        ✓ Registered Volunteer
                      </span>
                      <button
                        className="button button-quiet"
                        style={{ padding: '6px 12px', fontSize: 12, color: 'hsl(var(--coral))' }}
                        disabled={actionLoadingId === activeReg.registrationId || actionLoadingId === activeReg.id}
                        onClick={() => handleCancelRegistration(activeReg.registrationId || activeReg.id, evt.title)}
                      >
                        Withdraw
                      </button>
                    </div>
                  ) : (
                    <button
                      className="button button-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={actionLoadingId === evt.id}
                      onClick={() => handleRegister(evt)}
                    >
                      {actionLoadingId === evt.id ? 'Signing up...' : 'Sign up to Volunteer 💚'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY VOLUNTEER REGISTRATIONS GRID */}
      {!loading && !error && activeTab === 'MY_REGISTRATIONS' && activeRegistrationsList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {activeRegistrationsList.map((reg) => {
            const regId = reg.registrationId || reg.id;
            const eventTitle = reg.eventTitle || reg.volunteerEvent?.title || 'Impact Initiative';
            const dateStr = formatDate(reg.eventDate || reg.volunteerEvent?.eventDate);
            const location = reg.location || reg.volunteerEvent?.location || 'TBD';

            return (
              <div
                key={regId}
                className="card card-pad"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  background: 'linear-gradient(145deg, hsl(var(--paper)), hsl(var(--paper-warm)))',
                  border: '1px solid hsl(var(--line) / 0.8)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge-pill badge-kind" style={{ fontSize: 11 }}>
                      Status: {reg.status || 'REGISTERED'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{eventTitle}</h3>

                  <div style={{ fontSize: 13, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 10 }}>
                    📅 {dateStr} · 📍 {location}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid hsl(var(--line) / 0.6)', paddingTop: 14, marginTop: 12 }}>
                  <button
                    className="button button-quiet"
                    style={{ width: '100%', justifyContent: 'center', color: 'hsl(var(--coral))' }}
                    disabled={actionLoadingId === regId}
                    onClick={() => handleCancelRegistration(regId, eventTitle)}
                  >
                    {actionLoadingId === regId ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVITY DETAILS MODAL */}
      {detailEvent && (
        <div className="modal-backdrop" onClick={() => setDetailEvent(null)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Impact Initiative</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>{detailEvent.title}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailEvent(null)}>✕</button>
            </div>
            <EventBanner evt={detailEvent} height={240} />
            <div style={{ fontSize: 13, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 10 }}>
              📅 {formatDate(detailEvent.eventDate)} · 📍 {detailEvent.location || 'TBD'} · 👥 Max {detailEvent.maxVolunteers || 15}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>{detailEvent.description}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button button-quiet" onClick={() => setDetailEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {createModal && (
        <div className="modal-backdrop" onClick={closeCreateModal} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Impact Initiative</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Schedule Volunteer Event</h2>
              </div>
              <button className="modal-close-btn" onClick={closeCreateModal}>✕</button>
            </div>

            <form onSubmit={handleCreateEventSubmit}>
              <div className="field">
                <label>Event Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Community Garden Tree Planting"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Max Volunteers</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={maxVolunteers}
                    onChange={(e) => setMaxVolunteers(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Location *</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Riverside Park, Sector 4"
                  required
                />
              </div>

              <div className="field">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the cause, goals, and what volunteers should bring..."
                  rows={3}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="impact-image">Banner photo (optional)</label>
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="Selected banner preview"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, display: 'block', marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <label htmlFor="impact-image" className="button button-quiet" style={{ cursor: 'pointer', fontSize: 12 }}>
                        Replace
                      </label>
                      <button type="button" className="button button-quiet" style={{ fontSize: 12, color: 'hsl(var(--coral))' }} onClick={clearImage}>
                        Remove
                      </button>
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                        {imageFile?.name} · {(imageFile?.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="impact-image"
                    style={{
                      display: 'block',
                      padding: '18px 14px',
                      textAlign: 'center',
                      border: '1.5px dashed hsl(var(--line))',
                      borderRadius: 10,
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'hsl(var(--muted))',
                      background: 'hsl(var(--paper-warm))',
                    }}
                  >
                    📷 Choose a photo (JPEG, PNG or WebP, up to 5 MB)
                  </label>
                )}
                <input
                  id="impact-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChosen}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                />
                {imageError && (
                  <p role="alert" style={{ margin: '6px 0 0', fontSize: 12, color: 'hsl(var(--coral))' }}>{imageError}</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={closeCreateModal}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? (imageFile ? 'Uploading & publishing...' : 'Publishing...') : 'Publish Initiative 💚'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImpactView;
