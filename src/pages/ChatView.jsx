import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../api/chatApi';
import { employeeApi } from '../api/employeeApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';

// Helper for formatting time
function formatChatTime(dateVal) {
  if (!dateVal) return '';
  try {
    let d;
    if (Array.isArray(dateVal)) {
      d = new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function ChatView({ user }) {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const [inputMessage, setInputMessage] = useState('');
  const [startModal, setStartModal] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  const [newConvTitle, setNewConvTitle] = useState('');

  const messagesEndRef = useRef(null);
  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();

  const loadConversations = async () => {
    if (!currentEmpId) {
      setLoadingConvs(false);
      return;
    }

    try {
      setLoadingConvs(true);
      setError(null);

      const [convsData, empData] = await Promise.allSettled([
        chatApi.getConversations(currentEmpId),
        // employeeApi has no `getAllEmployees` method (it's `getAll`) -
        // calling the nonexistent one threw synchronously *inside* this
        // try block, before Promise.allSettled could even run, which
        // meant the otherwise-working getConversations() call never
        // executed either - a real, working conversation list was being
        // wiped out and replaced by this one unrelated error every time.
        // A large `size` is requested since this list feeds a "start a
        // new conversation" colleague picker, not a paginated table.
        employeeApi.getAll({ size: 500 }),
      ]);

      let convList = [];
      if (convsData.status === 'fulfilled' && Array.isArray(convsData.value)) {
        convList = convsData.value;
        setConversations(convList);
        if (convList.length > 0 && !activeConvId) {
          setActiveConvId(convList[0].id);
        }
      } else {
        setConversations([]);
      }

      if (empData.status === 'fulfilled') {
        const list = Array.isArray(empData.value) ? empData.value : (empData.value?.content || empData.value?.employees || []);
        setColleagues(list.filter((e) => String(e.id) !== String(currentEmpId)));
      }
    } catch (err) {
      setError(err.message || 'Unable to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentEmpId]);

  // Load messages when activeConvId changes
  useEffect(() => {
    if (!activeConvId || !currentEmpId) return;

    const fetchMessages = async () => {
      try {
        setLoadingMsgs(true);
        const msgs = await chatApi.getMessages(activeConvId, currentEmpId);
        setMessages(Array.isArray(msgs) ? msgs : []);
        // Mark as read asynchronously
        chatApi.markConversationRead(activeConvId, currentEmpId).catch(() => {});
      } catch (err) {
        addToast(err.message || 'Failed to load thread messages', 'error');
      } finally {
        setLoadingMsgs(false);
      }
    };

    fetchMessages();
  }, [activeConvId, currentEmpId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConvId || !currentEmpId) return;

    try {
      setSending(true);
      setInputMessage('');

      const sentMsg = await chatApi.sendMessage(activeConvId, currentEmpId, { content: text });
      
      // Append message locally
      setMessages((prev) => [...prev, sentMsg]);

      // Update conversation list item's lastMessage
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      addToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!selectedParticipantId || !currentEmpId) return;

    try {
      setSending(true);
      const payload = {
        title: newConvTitle.trim() || null,
        participantIds: [Number(selectedParticipantId)],
        groupConversation: false,
      };

      const newConv = await chatApi.startConversation(currentEmpId, payload);
      addToast('New conversation thread started! 💬');
      
      setStartModal(false);
      setSelectedParticipantId('');
      setNewConvTitle('');

      await loadConversations();
      if (newConv?.id) {
        setActiveConvId(newConv.id);
      }
    } catch (err) {
      addToast(err.message || 'Failed to start conversation', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="content page-shell">
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 24,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 85% 15%, hsl(var(--sage) / 0.15), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Calm Messaging</p>
        <h1>Quiet conversations</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          Asynchronous, unhurried threads with your wellbeing buddy, team circles, and care leads.
        </p>
      </div>

      <div className="chat-container card" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 520, padding: 0, overflow: 'hidden' }}>
        {/* Sidebar Thread List */}
        <div className="chat-sidebar" style={{ borderRight: '1px solid hsl(var(--line) / 0.6)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid hsl(var(--line) / 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>Direct Threads</strong>
            <button
              className="button button-quiet"
              style={{ padding: '4px 8px', fontSize: 11 }}
              onClick={() => setStartModal(true)}
            >
              + New
            </button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingConvs ? (
              <div style={{ padding: 16, display: 'grid', gap: 10 }}>
                <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 48, borderRadius: 8 }} />
              </div>
            ) : error ? (
              <div style={{ padding: 16, fontSize: 12, color: 'hsl(var(--coral))' }}>
                {error}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: 'hsl(var(--muted))' }}>
                No active chat threads yet. Click "+ New" to start one!
              </div>
            ) : (
              conversations.map((conv) => {
                const titleText = conv.title || (conv.participants && conv.participants[0]?.employeeName) || `Thread #${conv.id}`;
                const lastMsgText = conv.lastMessage || 'No messages yet';
                const isActive = conv.id === activeConvId;

                return (
                  <button
                    key={conv.id}
                    className={`chat-conv-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveConvId(conv.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      borderBottom: '1px solid hsl(var(--line) / 0.4)',
                      background: isActive ? 'hsl(var(--sage-soft) / 0.4)' : 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'hsl(var(--sage-soft))',
                        color: 'hsl(var(--sage-dark))',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {titleText.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {titleText}
                        </strong>
                        {conv.unreadCount > 0 && (
                          <span className="notification-dot" style={{ position: 'static' }} />
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {lastMsgText}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Main View */}
        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column', background: 'hsl(var(--paper))' }}>
          {activeConv ? (
            <>
              {/* Header */}
              <div 
                className="chat-header" 
                style={{ 
                  padding: '14px 20px', 
                  borderBottom: '1px solid hsl(var(--line) / 0.6)', 
                  display: 'flex', 
                  justify: 'space-between', 
                  alignItems: 'center',
                  background: 'hsl(var(--paper-warm) / 0.5)'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    {activeConv.title || (activeConv.participants && activeConv.participants[0]?.employeeName) || 'Conversation'}
                  </h3>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                    {activeConv.groupConversation ? 'Group Circle' : 'Direct Peer Thread'}
                  </span>
                </div>
                <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
                  ● Asynchronous Space
                </span>
              </div>

              {/* Messages Body */}
              <div className="chat-messages" style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingMsgs ? (
                  <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
                ) : messages.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: 'hsl(var(--muted))', fontSize: 13 }}>
                    No messages in this conversation yet. Send a message below!
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = currentEmpId && String(msg.senderId) === String(currentEmpId);
                    const senderName = msg.senderName || (isMine ? 'Me' : 'Colleague');
                    const timeStr = formatChatTime(msg.sentAt);

                    return (
                      <div
                        key={msg.id || i}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMine ? 'hsl(var(--sage-soft) / 0.8)' : 'hsl(var(--paper-warm))',
                          border: '1px solid hsl(var(--line) / 0.6)',
                          borderRadius: 14,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: isMine ? 'hsl(var(--sage-dark))' : 'hsl(var(--ink))' }}>
                          {senderName}
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'hsl(var(--ink))', whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </p>
                        {timeStr && (
                          <div style={{ fontSize: 10, color: 'hsl(var(--muted))', textAlign: 'right', marginTop: 4 }}>
                            {timeStr}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form 
                onSubmit={handleSendMessage} 
                style={{ 
                  padding: 16, 
                  borderTop: '1px solid hsl(var(--line) / 0.6)', 
                  display: 'flex', 
                  gap: 10,
                  background: 'hsl(var(--paper))'
                }}
              >
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a gentle message..."
                  style={{ flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: 10, border: '1px solid hsl(var(--line))' }}
                  required
                />
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={sending || !inputMessage.trim()}
                >
                  {sending ? 'Sending...' : 'Send 💬'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'hsl(var(--muted))', fontSize: 14 }}>
              Select a thread on the left to view messages
            </div>
          )}
        </div>
      </div>

      {/* START CONVERSATION MODAL */}
      {startModal && (
        <div className="modal-backdrop" onClick={() => setStartModal(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Direct Thread</p>
                <h2 style={{ margin: 0, fontSize: 20 }}>Start a Conversation</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setStartModal(false)}>✕</button>
            </div>

            <form onSubmit={handleStartConversation}>
              <div className="field">
                <label>Select Colleague *</label>
                <select
                  value={selectedParticipantId}
                  onChange={(e) => setSelectedParticipantId(e.target.value)}
                  required
                >
                  <option value="">Select a teammate...</option>
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || `Employee #${c.id}`} ({c.department || 'Team'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Thread Topic / Title (optional)</label>
                <input
                  value={newConvTitle}
                  onChange={(e) => setNewConvTitle(e.target.value)}
                  placeholder="e.g. Weekly Coffee Walk Catch-up"
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setStartModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={sending}>
                  {sending ? 'Starting...' : 'Open Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatView;
