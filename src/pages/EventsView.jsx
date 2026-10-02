import { useState, useEffect, useMemo } from 'react';
import { eventApi } from '../api/eventApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

// Helper to format LocalDate string or array into displayable object
function formatEventDate(dateVal) {
  if (!dateVal) return { day: '--', month: '---', full: 'Date TBD' };
  try {
    let d;
    if (Array.isArray(dateVal)) {
      // Spring array representation [year, month, day]
      d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2]);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return { day: '--', month: '---', full: String(dateVal) };

    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const full = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return { day, month, full };
  } catch {
    return { day: '--', month: '---', full: String(dateVal) };
  }
}

// Helper to format LocalTime string or array into "10:00 AM" format
function formatEventTime(timeVal) {
  if (!timeVal) return '';
  try {
    if (Array.isArray(timeVal)) {
      const [h, m] = timeVal;
      const date = new Date();
      date.setHours(h, m, 0);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    // "14:30:00" or "14:30"
    const parts = String(timeVal).split(':');
    if (parts.length >= 2) {
      const date = new Date();
      date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return String(timeVal);
  } catch {
    return String(timeVal);
  }
}

const EVENT_TYPES = ['WORKSHOP', 'SEMINAR', 'SOCIAL', 'WELLNESS', 'TEAM_BUILDING', 'OTHER'];

export function EventsView({ user, onUserUpdate }) {
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  
  // Modals state
  const [createModal, setCreateModal] = useState(false);
  const [editModalEvent, setEditModalEvent] = useState(null);
  const [detailModalEvent, setDetailModalEvent] = useState(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('WELLNESS');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('10:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formLocation, setFormLocation] = useState('');
  const [formCapacity, setFormCapacity] = useState(25);
  const [formBannerImage, setFormBannerImage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all events
      const eventsData = await eventApi.discoverEvents();
      setEvents(Array.isArray(eventsData) ? eventsData : []);

      // Fetch employee's registrations if employeeId available
      if (currentEmpId) {
        try {
          const regData = await eventApi.getEmployeeRegistrations(currentEmpId);
          setUserRegistrations(Array.isArray(regData) ? regData : []);
        } catch {
          // If registrations fail (e.g. backend issue), default to empty
          setUserRegistrations([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Unable to load company events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentEmpId]);

  // Set of registered event IDs for O(1) lookup
  const registeredEventIds = useMemo(() => {
    const set = new Set();
    userRegistrations.forEach((reg) => {
      if (reg.status !== 'CANCELLED' && reg.eventId) {
        set.add(reg.eventId);
      }
    });
    return set;
  }, [userRegistrations]);

  const handleRegisterToggle = async (event) => {
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }

    const isRegistered = registeredEventIds.has(event.id);
    setActionLoadingId(event.id);

    try {
      if (isRegistered) {
        await eventApi.cancelRegistration(event.id, currentEmpId);
        addToast(`Registration cancelled for "${event.title}".`);
      } else {
        await eventApi.register(event.id, currentEmpId);
        addToast(`You are registered for "${event.title}"! 🌸`);
      }
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreateModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormType('WELLNESS');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('10:00');
    setFormEndTime('11:00');
    setFormLocation('');
    setFormCapacity(25);
    setFormBannerImage('');
    setCreateModal(true);
  };

  const openEditModal = (event) => {
    setEditModalEvent(event);
    setFormTitle(event.title || '');
    setFormDesc(event.description || '');
    setFormType(event.eventType || 'WELLNESS');
    setFormDate(event.eventDate || '');
    setFormStartTime(event.startTime ? String(event.startTime).slice(0, 5) : '10:00');
    setFormEndTime(event.endTime ? String(event.endTime).slice(0, 5) : '11:00');
    setFormLocation(event.location || '');
    setFormCapacity(event.capacity || 25);
    setFormBannerImage(event.bannerImage || '');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLocation.trim() || !formDate) {
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
        title: formTitle.trim(),
        description: formDesc.trim(),
        eventType: formType,
        eventDate: formDate,
        startTime: formStartTime.length === 5 ? `${formStartTime}:00` : formStartTime,
        endTime: formEndTime.length === 5 ? `${formEndTime}:00` : formEndTime,
        location: formLocation.trim(),
        capacity: Number(formCapacity) || 25,
        bannerImage: formBannerImage.trim() || null,
      };

      await eventApi.createEvent(currentEmpId, payload);
      addToast(`New gathering "${formTitle}" scheduled! 🌸`);
      setCreateModal(false);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModalEvent || !currentEmpId) return;

    try {
      setSubmitting(true);
      const payload = {
        title: formTitle.trim(),
        description: formDesc.trim(),
        eventType: formType,
        eventDate: formDate,
        startTime: formStartTime.length === 5 ? `${formStartTime}:00` : formStartTime,
        endTime: formEndTime.length === 5 ? `${formEndTime}:00` : formEndTime,
        location: formLocation.trim(),
        capacity: Number(formCapacity) || 25,
        bannerImage: formBannerImage.trim() || null,
      };

      await eventApi.updateEvent(editModalEvent.id, currentEmpId, payload);
      addToast(`Gathering "${formTitle}" updated!`);
      setEditModalEvent(null);
      if (detailModalEvent?.id === editModalEvent.id) {
        setDetailModalEvent(null);
      }
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to update event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel "${title}"?`)) return;
    if (!currentEmpId) return;

    try {
      setActionLoadingId(eventId);
      await eventApi.cancelEvent(eventId, currentEmpId);
      addToast(`Gathering "${title}" cancelled.`);
      if (detailModalEvent?.id === eventId) setDetailModalEvent(null);
      loadData();
    } catch (err) {
      addToast(err.message || 'Failed to cancel event', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredEvents = useMemo(() => {
    if (filterType === 'ALL') return events;
    return events.filter((e) => String(e.eventType || '').toUpperCase() === filterType);
  }, [events, filterType]);

  return (
    <div className="content page-shell">
      <PageHero page="events" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 90% 20%, hsl(var(--sage) / 0.15), transparent 40%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>On the Calendar</p>
        <h1>Good things, together</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          Invitations into restorative shared time: nervous-system resets, lunchtime walks, ergonomics clinics, and collaborative workshops.
        </p>
        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={openCreateModal}>
              + Schedule new gathering
            </button>
          )}
          <button className="button button-quiet" onClick={loadData} disabled={loading}>
            🔄 Refresh calendar
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted))', marginRight: 4 }}>Filter:</span>
        {['ALL', ...EVENT_TYPES].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`button ${filterType === type ? 'button-primary' : 'button-quiet'}`}
            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 20 }}
          >
            {type === 'ALL' ? 'All Gatherings' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 130, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 130, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 130, borderRadius: 16 }} />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load events</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'hsl(var(--ink))' }}>{error}</p>
          <button className="button button-primary" onClick={loadData}>Try again</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredEvents.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <h3 style={{ margin: '0 0 8px' }}>No events scheduled</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            {filterType === 'ALL'
              ? 'There are currently no upcoming events on the calendar. Check back soon or create one!'
              : `No ${filterType.replace('_', ' ').toLowerCase()} events found.`}
          </p>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={openCreateModal}>
              + Schedule a gathering
            </button>
          )}
        </div>
      )}

      {/* Events Grid / List */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredEvents.map((event) => {
            const dateObj = formatEventDate(event.eventDate);
            const startTimeStr = formatEventTime(event.startTime);
            const endTimeStr = formatEventTime(event.endTime);
            const isRegistered = registeredEventIds.has(event.id);
            const isOrganizer = currentEmpId && String(event.organizerId) === String(currentEmpId);

            const registeredCount = event.registeredCount ?? 0;
            const capacity = event.capacity ?? 30;
            const spotsLeft = event.availableSpots ?? Math.max(0, capacity - registeredCount);

            return (
              <article
                key={event.id}
                className="card card-pad"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '75px 1fr auto',
                  gap: 20,
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                }}
              >
                {/* Date Badge */}
                <div
                  style={{
                    textAlign: 'center',
                    background: 'hsl(var(--sage) / 0.15)',
                    borderRadius: 14,
                    padding: '12px 6px',
                    color: 'hsl(var(--sage))',
                    border: '1px solid hsl(var(--sage) / 0.25)',
                  }}
                >
                  <strong style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1 }}>
                    {dateObj.day}
                  </strong>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                    {dateObj.month}
                  </span>
                </div>

                {/* Event Info */}
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="badge-pill badge-calm" style={{ fontSize: 10, textTransform: 'uppercase' }}>
                      {event.eventType || 'WELLNESS'}
                    </span>
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                      🕒 {startTimeStr}{endTimeStr ? ` - ${endTimeStr}` : ''} · 📍 {event.location || 'TBD'}
                    </span>
                    {event.status === 'CANCELLED' && (
                      <span className="badge-pill" style={{ fontSize: 10, background: 'hsl(var(--coral-soft))', color: 'hsl(var(--coral))' }}>
                        CANCELLED
                      </span>
                    )}
                  </div>

                  <h3 
                    style={{ margin: '2px 0 6px', fontSize: 18, cursor: 'pointer' }}
                    onClick={() => setDetailModalEvent(event)}
                  >
                    {event.title}
                  </h3>

                  <p style={{ margin: '0 0 8px', fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'hsl(var(--sage))', fontWeight: 600, flexWrap: 'wrap' }}>
                    <span>👥 {registeredCount} attending</span>
                    <span>• {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full capacity'}</span>
                    {event.organizerName && <span>• Hosted by {event.organizerName}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <button
                    className={`button ${isRegistered ? 'button-quiet' : 'button-primary'}`}
                    disabled={actionLoadingId === event.id || event.status === 'CANCELLED' || (!isRegistered && spotsLeft <= 0)}
                    onClick={() => handleRegisterToggle(event)}
                    style={{ minWidth: 140, justifyContent: 'center' }}
                  >
                    {actionLoadingId === event.id ? (
                      'Processing...'
                    ) : isRegistered ? (
                      'Registered ✓ (Cancel)'
                    ) : spotsLeft <= 0 ? (
                      'Full Capacity'
                    ) : (
                      'RSVP'
                    )}
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="button button-quiet"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setDetailModalEvent(event)}
                    >
                      Details
                    </button>
                    {(isOrganizer || isHrOrAdmin) && (
                      <>
                        <button
                          className="button button-quiet"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          onClick={() => openEditModal(event)}
                        >
                          Edit
                        </button>
                        <button
                          className="button button-quiet"
                          style={{ padding: '4px 10px', fontSize: 11, color: 'hsl(var(--coral))' }}
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {createModal && (
        <div className="modal-backdrop" onClick={() => setCreateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Gathering Organizer</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Schedule a Gathering</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="field">
                <label>Event Title *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Midweek Mindful Breathing Clinic"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Event Category</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Location / Virtual Room Link *</label>
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Garden Pavilion or Zoom Room 4"
                  required
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Share details about what colleagues can expect..."
                  rows={3}
                />
              </div>

              <div className="field">
                <label>Banner Image URL (optional)</label>
                <input
                  value={formBannerImage}
                  onChange={(e) => setFormBannerImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Gathering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editModalEvent && (
        <div className="modal-backdrop" onClick={() => setEditModalEvent(null)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Edit Gathering</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Update Event Details</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setEditModalEvent(null)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="field">
                <label>Event Title *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Event Category</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Location / Virtual Room Link *</label>
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setEditModalEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalEvent && (
        <div className="modal-backdrop" onClick={() => setDetailModalEvent(null)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div>
                <span className="badge-pill badge-calm" style={{ marginBottom: 6 }}>
                  {detailModalEvent.eventType || 'WELLNESS'}
                </span>
                <h2 style={{ margin: 0, fontSize: 24 }}>{detailModalEvent.title}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailModalEvent(null)}>✕</button>
            </div>

            <div style={{ padding: '4px 0 16px' }}>
              {detailModalEvent.bannerImage && (
                <img
                  src={detailModalEvent.bannerImage}
                  alt={detailModalEvent.title}
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }}
                />
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'hsl(var(--paper-warm))', padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>DATE & TIME</span>
                  <strong>{formatEventDate(detailModalEvent.eventDate).full}</strong>
                  <div style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
                    {formatEventTime(detailModalEvent.startTime)} - {formatEventTime(detailModalEvent.endTime)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>LOCATION</span>
                  <strong>📍 {detailModalEvent.location || 'TBD'}</strong>
                  <div style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
                    Hosted by {detailModalEvent.organizerName || 'HR Team'}
                  </div>
                </div>
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>About this Gathering</h4>
              <p style={{ margin: '0 0 20px', fontSize: 14, color: 'hsl(var(--ink) / 0.85)', lineHeight: 1.6 }}>
                {detailModalEvent.description || 'No detailed description provided.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid hsl(var(--line))', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
                  👥 <strong>{detailModalEvent.registeredCount ?? 0}</strong> registered of <strong>{detailModalEvent.capacity ?? 30}</strong> capacity
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className={`button ${registeredEventIds.has(detailModalEvent.id) ? 'button-quiet' : 'button-primary'}`}
                    onClick={() => handleRegisterToggle(detailModalEvent)}
                    disabled={actionLoadingId === detailModalEvent.id}
                  >
                    {registeredEventIds.has(detailModalEvent.id) ? 'Cancel RSVP' : 'RSVP Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsView;
