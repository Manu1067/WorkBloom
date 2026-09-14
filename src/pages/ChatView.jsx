import { useState, useEffect, useRef } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function ChatView({ user }) {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const addToast = useToast()

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await features.conversations()
      setConversations(data)
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id)
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, activeConvId])

  const activeConv = conversations.find((c) => c.id === activeConvId)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !activeConvId) return
    const text = inputMessage.trim()
    setInputMessage('')
    try {
      setSending(true)
      const res = await features.sendMessage(activeConvId, text)
      if (res.success) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    res.message,
                    ...(res.reply ? [res.reply] : []),
                  ],
                }
              : c
          )
        )
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Calm messaging</p>
        <h1>Quiet conversations</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Asynchronous, unhurried threads with your wellbeing buddy, team circles, and care leads.
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-sidebar">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid hsl(var(--line) / 0.6)', fontWeight: 700, fontSize: 13 }}>
            Direct threads & circles
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1]?.text || 'No messages yet'
              return (
                <button
                  key={conv.id}
                  className={`chat-conv-item ${conv.id === activeConvId ? 'active' : ''}`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'hsl(var(--sage-soft))',
                      color: 'hsl(var(--sage-dark))',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {conv.name.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 13, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {conv.name}
                      </strong>
                    </div>
                    <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {lastMsg}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="chat-main">
          {activeConv ? (
            <>
              <div className="chat-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{activeConv.name}</h3>
                  <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>
                    {activeConv.role || 'WorkBloom Colleague'}
                  </span>
                </div>
                <span className="badge-pill badge-calm" style={{ fontSize: 10 }}>
                  ● Active in space
                </span>
              </div>

              <div className="chat-messages">
                {activeConv.messages.map((msg, i) => {
                  const isMine = msg.senderId === user.id || msg.senderName === user.fullName
                  return (
                    <div
                      key={msg.id || i}
                      className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, opacity: 0.85 }}>
                        {msg.senderName}
                      </div>
                      <div>{msg.text}</div>
                      <span className="chat-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="chat-input-bar">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Send a gentle message to ${activeConv.name}...`}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid hsl(var(--line))', outline: 'none' }}
                />
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={sending || !inputMessage.trim()}
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'hsl(var(--muted))' }}>
              Select a thread to open conversation
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
