import { useState, useEffect, useMemo } from 'react';
import { buddyApi } from '../api/buddyApi';
import { employeeApi } from '../api/employeeApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

export function BuddyView({ user, navigate, onUserUpdate }) {
  const [activeBuddy, setActiveBuddy] = useState(null);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Action loading state per ID
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();

  const loadData = async () => {
    if (!currentEmpId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [buddyRes, receivedRes, sentRes, empRes] = await Promise.allSettled([
        buddyApi.getMyBuddy(currentEmpId),
        buddyApi.getReceivedRequests(currentEmpId),
        buddyApi.getSentRequests(currentEmpId),
        // employeeApi has no `getAllEmployees` method (it's `getAll`) -
        // calling the nonexistent one threw synchronously *inside* this
        // try block, before Promise.allSettled could even run, which
        // meant getMyBuddy/getReceivedRequests/getSentRequests never
        // actually executed either - "No active buddy found" was being
        // shown because of this crash, not because the backend was
        // properly checked and returned no buddy.
        employeeApi.getAll({ size: 500 }),
      ]);

      if (buddyRes.status === 'fulfilled' && buddyRes.value) {
        setActiveBuddy(buddyRes.value);
      } else if (buddyRes.status === 'rejected' && buddyRes.reason?.status === 404) {
        // BuddyServiceImpl.getMyBuddy() intentionally throws a 404 with
        // "No active buddy found" when the employee has no active
        // pairing yet - this is a valid, expected business state (not
        // every employee has a buddy), so it's treated as a clean empty
        // state, not an error.
        setActiveBuddy(null);
      } else if (buddyRes.status === 'rejected') {
        // Any other failure (500, network, etc.) is a real problem -
        // worth surfacing distinctly rather than silently looking
        // identical to "no buddy assigned".
        addToast(buddyRes.reason?.message || 'Could not check your buddy status', 'error');
        setActiveBuddy(null);
      } else {
        setActiveBuddy(null);
      }

      if (receivedRes.status === 'fulfilled') {
        setReceivedRequests(Array.isArray(receivedRes.value) ? receivedRes.value : []);
      } else {
        setReceivedRequests([]);
      }

      if (sentRes.status === 'fulfilled') {
        setSentRequests(Array.isArray(sentRes.value) ? sentRes.value : []);
      } else {
        setSentRequests([]);
      }

      if (empRes.status === 'fulfilled') {
        const list = Array.isArray(empRes.value) ? empRes.value : (empRes.value?.content || empRes.value?.employees || []);
        setColleagues(list.filter((e) => String(e.id) !== String(currentEmpId)));
      } else {
        setColleagues([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load buddy network details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentEmpId]);

  // Set of receiver IDs with pending sent requests
  const pendingSentReceiverIds = useMemo(() => {
    const set = new Set();
    sentRequests.forEach((req) => {
      if (req.status === 'PENDING' && req.receiverId) {
        set.add(req.receiverId);
      }
    });
    return set;
  }, [sentRequests]);

  const handleSendRequest = async (colleague) => {
    if (!currentEmpId) return;

    try {
      setActionLoadingId(colleague.id);
      await buddyApi.sendRequest(currentEmpId, { receiverId: colleague.id });
      addToast(`Buddy invitation sent to ${colleague.fullName || colleague.firstName || 'colleague'}! 🤝`);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to send buddy invitation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (requestId, requesterName) => {
    if (!currentEmpId) return;

    try {
      setActionLoadingId(requestId);
      await buddyApi.acceptRequest(requestId, currentEmpId);
      addToast(`You and ${requesterName || 'your colleague'} are now wellbeing buddies! 🌸`);
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to accept invitation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (requestId, requesterName) => {
    if (!currentEmpId) return;

    try {
      setActionLoadingId(requestId);
      await buddyApi.rejectRequest(requestId, currentEmpId);
      addToast(`Declined invitation from ${requesterName || 'colleague'}.`);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to decline invitation', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingReceived = useMemo(() => {
    return receivedRequests.filter((r) => r.status === 'PENDING');
  }, [receivedRequests]);

  return (
    <div className="content page-shell">
      <PageHero page="buddy" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 85% 15%, hsl(var(--sage) / 0.2), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Peer Support & Mentorship</p>
        <h1>WorkBloom Wellbeing Buddies</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          Navigating work is gentler with a partner. A buddy is a trusted peer to take coffee walks with, share quiet check-ins, and keep your boundaries steady.
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
      )}

      {/* Error Alert */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load buddy information</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadData}>Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Active Buddy Card */}
          {activeBuddy && (activeBuddy.buddyName || activeBuddy.buddyId) && (
            <div 
              className="card card-pad" 
              style={{ 
                marginBottom: 28, 
                borderColor: 'hsl(var(--sage) / 0.7)', 
                background: 'linear-gradient(135deg, hsl(var(--paper)), hsl(var(--sage-soft) / 0.25))',
                boxShadow: '0 6px 20px -4px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <span className="badge-pill badge-cultivator" style={{ marginBottom: 8 }}>
                    Current Active Wellbeing Buddy
                  </span>
                  <h2 style={{ margin: '4px 0 6px', fontSize: 24 }}>
                    {activeBuddy.buddyName || `Buddy #${activeBuddy.buddyId}`}
                  </h2>
                  <p style={{ margin: 0, color: 'hsl(var(--muted))', fontSize: 13 }}>
                    Paired for mutual workplace support and boundary protection.
                  </p>
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge-pill badge-calm" style={{ fontSize: 11 }}>🌿 Mindful walking</span>
                    <span className="badge-pill badge-calm" style={{ fontSize: 11 }}>☕ Coffee check-ins</span>
                    <span className="badge-pill badge-calm" style={{ fontSize: 11 }}>🛡️ Focus blocks</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="button button-primary" onClick={() => navigate && navigate('/chat')}>
                    💬 Message {activeBuddy.buddyName?.split(' ')[0] || 'Buddy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Received Invitations */}
          {pendingReceived.length > 0 && (
            <div className="card card-pad" style={{ marginBottom: 28, borderColor: 'hsl(var(--gold))' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 18, color: 'hsl(var(--ink))' }}>
                Pending Buddy Invitations ({pendingReceived.length})
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {pendingReceived.map((req) => (
                  <div 
                    key={req.id} 
                    style={{ 
                      display: 'flex', 
                      justify: 'space-between', 
                      alignItems: 'center', 
                      padding: 14, 
                      background: 'hsl(var(--paper-warm) / 0.6)', 
                      borderRadius: 12,
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 15 }}>{req.requesterName || `Employee #${req.requesterId}`}</strong>
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
                        Invited you to pair up as a wellbeing buddy.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="button button-quiet" 
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleRejectRequest(req.id, req.requesterName)}
                      >
                        Decline
                      </button>
                      <button 
                        className="button button-primary" 
                        disabled={actionLoadingId === req.id}
                        onClick={() => handleAcceptRequest(req.id, req.requesterName)}
                      >
                        {actionLoadingId === req.id ? 'Accepting...' : 'Accept & Connect 🌸'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colleagues Directory Grid */}
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Available Colleagues to Connect With</h2>
          
          {colleagues.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 24px', textAlign: 'center' }}>
              <p style={{ color: 'hsl(var(--muted))' }}>No available colleagues found to connect with.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
              {colleagues.map((colleague) => {
                const isCurrentBuddy = activeBuddy && String(activeBuddy.buddyId) === String(colleague.id);
                const isPendingSent = pendingSentReceiverIds.has(colleague.id);
                const name = colleague.fullName || `${colleague.firstName || ''} ${colleague.lastName || ''}`.trim() || `Employee #${colleague.id}`;

                return (
                  <div 
                    key={colleague.id} 
                    className="card card-pad" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justify: 'space-between',
                      background: 'hsl(var(--paper))',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: 17 }}>{name}</h3>
                        <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
                          {colleague.department || 'Team'}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'hsl(var(--muted))', margin: '0 0 12px' }}>
                        {colleague.designation || 'Colleague'}
                      </p>
                    </div>

                    <div>
                      {isCurrentBuddy ? (
                        <span className="badge-pill badge-cultivator" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '6px 0' }}>
                          Connected Buddy ✓
                        </span>
                      ) : isPendingSent ? (
                        <button className="button button-quiet" disabled style={{ width: '100%', justifyContent: 'center' }}>
                          Invitation Pending...
                        </button>
                      ) : (
                        <button
                          className="button button-primary"
                          style={{ width: '100%', justifyContent: 'center' }}
                          disabled={actionLoadingId === colleague.id}
                          onClick={() => handleSendRequest(colleague)}
                        >
                          {actionLoadingId === colleague.id ? 'Sending...' : '🤝 Invite as Buddy'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BuddyView;
