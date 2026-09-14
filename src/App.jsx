import { cloneElement, isValidElement, useCallback, useEffect, useId, useMemo, useState } from 'react'
import { auth, clearSession, features, getToken, setSession } from './api'
import { ToastProvider, useToast } from './components/ToastContext'

import { DashboardView } from './pages/DashboardView'
import { WellnessView } from './pages/WellnessView'
import { EventsView } from './pages/EventsView'
import { CommunityView } from './pages/CommunityView'
import { RecognitionView } from './pages/RecognitionView'
import { BuddyView } from './pages/BuddyView'
import { LearningView } from './pages/LearningView'
import { ClubsView } from './pages/ClubsView'
import { ImpactView } from './pages/ImpactView'
import { ChatView } from './pages/ChatView'
import { TravelView } from './pages/TravelView'
import { DirectoryView } from './pages/DirectoryView'
import { AnalyticsView } from './pages/AnalyticsView'
import { ProfileView } from './pages/ProfileView'

const navGroups = [
  {
    label: 'Your rhythm',
    items: [
      ['dashboard', 'Overview', 'grid'],
      ['wellness', 'Wellness', 'leaf'],
      ['learning', 'Learning', 'book'],
      ['travel', 'Travel', 'compass'],
    ],
  },
  {
    label: 'Your people',
    items: [
      ['community', 'Community', 'users'],
      ['recognition', 'Appreciation', 'spark'],
      ['buddy', 'Buddies', 'leaf'],
      ['clubs', 'Clubs', 'spark'],
      ['events', 'Events', 'calendar'],
      ['chat', 'Messages', 'chat'],
      ['directory', 'Directory', 'users'],
    ],
  },
  {
    label: 'Your impact',
    items: [
      ['impact', 'Make an impact', 'heart'],
      ['analytics', 'Analytics', 'grid'],
    ],
  },
]

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  leaf: <><path d="M20.5 3.5c-7 .3-13 3.2-14.7 8.2-1.3 3.8 1.6 7 5.1 6.4 5.5-1 8.7-7.4 9.6-14.6Z" /><path d="M4 21c3.2-5.4 7-8.6 12.4-11.8" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5v-12Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.7 8.3-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2Z" /></>,
  users: <><path d="M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="8" r="3" /><path d="M16 5.2a3 3 0 0 1 0 5.6M19 20v-1.5a3.5 3.5 0 0 0-2.7-3.4" /></>,
  spark: <><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
  chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.6 8.6 0 0 1-3-.5L4 20l1.5-4A7.1 7.1 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></>,
  heart: <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  logout: <><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M15 16l4-4-4-4M19 12H9" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  x: <><path d="M18 6 6 18M6 6l12 12" /></>,
}

function Icon({ name, size = 18 }) {
  return <svg className="nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name] || iconPaths.grid}</svg>
}

function Tooltip({ content, position = 'bottom', align = 'center', children }) {
  const tooltipId = useId()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!visible) return
    const onKey = (e) => {
      if (e.key === 'Escape') setVisible(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])

  const alignClass = align === 'right' ? 'tooltip-align-right' : align === 'left' ? 'tooltip-align-left' : ''

  return (
    <div
      className={`tooltip-container ${alignClass}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {isValidElement(children)
        ? cloneElement(children, {
            'aria-describedby': tooltipId,
          })
        : children}
      <span
        id={tooltipId}
        role="tooltip"
        className={`tooltip-bubble tooltip-${position} ${visible ? 'is-visible' : ''}`}
        aria-hidden={!visible}
      >
        {content}
      </span>
    </div>
  )
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname || '/dashboard')
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/dashboard')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = useCallback((next) => {
    window.history.pushState({}, '', next)
    setPath(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  return [path, navigate]
}

function initials(name = 'WB') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function Avatar({ name, image, size }) {
  return (
    <div className="avatar" style={size ? { width: size, height: size } : undefined}>
      {image ? <img src={image} alt="" /> : initials(name)}
    </div>
  )
}

function AuthLayout({ children, mode }) {
  const [, navigate] = useRoute()
  return (
    <main className="auth-shell">
      <aside className="auth-aside">
        <button className="brand" onClick={() => navigate('/login')} aria-label="Go to WorkBloom login">
          <span className="brand-mark" />
          <span className="brand-name">WorkBloom</span>
        </button>
        <div>
          <div className="auth-quote">“Make work feel like home.”</div>
          <h1>{mode === 'login' ? 'Start where you are.' : 'Make room for what matters.'}</h1>
          <p>WorkBloom is a quieter kind of workplace: a place to check in, find your people, and take one useful step.</p>
        </div>
        <span className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>A shared space for better days</span>
      </aside>
      <section className="auth-main">{children}</section>
    </main>
  )
}

function AuthPage({ kind, onSuccess }) {
  const isRegister = kind === 'register'
  const isForgot = kind === 'forgot'
  const [form, setForm] = useState({ fullName: '', email: '', password: '', department: '', designation: '' })
  const [status, setStatus] = useState({ busy: false, error: '', done: false })
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ busy: true, error: '', done: false })
    try {
      const body = isRegister ? { fullName: form.fullName, email: form.email, password: form.password, department: form.department, designation: form.designation } : { email: form.email, ...(isForgot ? {} : { password: form.password }) }
      const response = isForgot ? await auth.forgotPassword(body) : isRegister ? await auth.register(body) : await auth.login(body)
      if (isForgot) {
        setStatus({ busy: false, error: '', done: true })
      } else {
        setSession(response)
        onSuccess(response)
      }
    } catch (error) {
      setStatus({ busy: false, error: error.message || 'We could not complete that request.', done: false })
    }
  }

  return (
    <AuthLayout mode={kind}>
      <form className="card form-card" onSubmit={submit}>
        <p className="eyebrow">{isForgot ? 'Reset access' : isRegister ? 'Join the room' : 'Welcome back'}</p>
        <h1>{isForgot ? 'A fresh start.' : isRegister ? 'Come on in.' : 'Good morning.'}</h1>
        <p className="subtitle">{isForgot ? 'Enter your work email and we will send reset instructions if the account is found.' : isRegister ? 'Create your space in a couple of minutes.' : 'Your people, plans, and small wins are waiting.'}</p>
        {status.error && <div className="alert" role="alert">{status.error}</div>}
        {status.done && <div className="alert" role="status">If an account matches that email, reset instructions are on their way.</div>}
        {isRegister && <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required value={form.fullName} onChange={update} autoComplete="name" /></div>}
        <div className="field"><label htmlFor="email">Work email</label><input id="email" name="email" type="email" required value={form.email} onChange={update} autoComplete="email" /></div>
        {!isForgot && <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength="6" value={form.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} /></div>}
        {isRegister && (
          <div className="collection-grid" style={{ gap: 10, marginTop: 4 }}>
            <div className="field"><label htmlFor="department">Department</label><input id="department" name="department" value={form.department} onChange={update} placeholder="e.g. Design" /></div>
            <div className="field"><label htmlFor="designation">Role</label><input id="designation" name="designation" value={form.designation} onChange={update} placeholder="e.g. Product Lead" /></div>
          </div>
        )}
        <div className="form-footer">
          {!isRegister && !isForgot && (
            <button type="button" className="text-link" onClick={() => window.history.pushState({}, '', '/forgot-password') || window.dispatchEvent(new PopStateEvent('popstate'))}>
              Forgot password?
            </button>
          )}
          <button className="button button-primary" type="submit" disabled={status.busy}>
            {status.busy ? 'One moment…' : isForgot ? 'Send instructions' : isRegister ? 'Create my space' : 'Enter WorkBloom'} <Icon name="arrow" size={15} />
          </button>
        </div>
        <p className="form-note">
          {isForgot ? 'Remembered it? ' : isRegister ? 'Already have an account? ' : 'New to WorkBloom? '}
          <a href={isForgot || isRegister ? '/login' : '/register'} onClick={(event) => { event.preventDefault(); window.history.pushState({}, '', event.currentTarget.getAttribute('href')); window.dispatchEvent(new PopStateEvent('popstate')) }}>
            {isForgot || isRegister ? 'Back to sign in' : 'Create an account'}
          </a>
        </p>
      </form>
    </AuthLayout>
  )
}

function Sidebar({ path, navigate, user, open, setOpen, onRoleSwitch }) {
  const go = (route) => { navigate(`/${route}`); setOpen(false) }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <button className="brand" onClick={() => go('dashboard')} aria-label="Go to dashboard">
        <span className="brand-mark" />
        <span className="brand-name">WorkBloom</span>
      </button>

      {/* Role Indicator & Quick Switcher */}
      <div style={{ padding: '0 12px 18px', borderBottom: '1px solid hsl(var(--line) / 0.18)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'hsl(var(--gold))', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Active Persona
          </span>
          <span className={`role-badge ${user?.role === 'ADMIN' ? 'role-admin' : user?.role === 'HR' ? 'role-hr' : 'role-employee'}`} style={{ fontSize: 9 }}>
            {user?.role || 'EMPLOYEE'}
          </span>
        </div>
        <select
          value={user?.role || 'EMPLOYEE'}
          onChange={(e) => onRoleSwitch && onRoleSwitch(e.target.value)}
          style={{
            width: '100%',
            background: 'hsl(var(--sage-deep) / 0.8)',
            color: 'hsl(43 46% 96%)',
            border: '1px solid hsl(var(--sky) / 0.25)',
            borderRadius: 8,
            fontSize: 11,
            padding: '4px 8px',
            outline: 'none',
          }}
          aria-label="Switch active role persona"
        >
          <option value="EMPLOYEE">Role: Employee (Standard)</option>
          <option value="HR">Role: HR (People Ops & Salary)</option>
          <option value="ADMIN">Role: Admin (Full Access)</option>
        </select>
      </div>

      {navGroups.map((group) => (
        <div key={group.label} style={{ marginBottom: 18 }}>
          <div className="nav-label">{group.label}</div>
          <nav className="nav-group" aria-label={group.label}>
            {group.items.map(([route, label, icon]) => (
              <button
                className={`nav-item ${path === `/${route}` ? 'active' : ''}`}
                key={route}
                onClick={() => go(route)}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      ))}

      <div className="sidebar-spacer" />
      <div className="sidebar-note">
        <strong>One useful step.</strong>
        <span>What would make today feel a touch better?</span>
      </div>

      <div className="sidebar-user">
        <Avatar name={user?.fullName} image={user?.profileImage} />
        <div className="user-meta">
          <strong>{user?.fullName || 'Your profile'}</strong>
          <span>{user?.designation || user?.department || 'WorkBloom member'}</span>
        </div>
        <button className="logout-button" onClick={() => { clearSession(); navigate('/login') }} aria-label="Sign out">
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  )
}

function SettingsModal({ open, onClose, user, navigate }) {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('workbloom_settings') || '{"mindfulPrompts":true,"audioFeedback":false,"compactRhythm":false,"emailDigest":true}')
    } catch {
      return { mindfulPrompts: true, audioFeedback: false, compactRhythm: false, emailDigest: true }
    }
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const toggle = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('workbloom_settings', JSON.stringify(next))
      return next
    })
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Workspace comfort</p>
            <h2 id="settings-title" style={{ margin: 0, fontSize: 24 }}>Settings & Preferences</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close settings">
            <Icon name="x" size={16} />
          </button>
        </div>
        <p className="subtitle" style={{ marginBottom: 20 }}>
          Tune how WorkBloom behaves during your workday. Your preferences are saved locally.
        </p>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Mindful daily prompt</strong>
              <span>Show gentle reflection and focus prompts on the overview dashboard.</span>
            </div>
            <label className="switch" aria-label="Toggle mindful prompt">
              <input type="checkbox" checked={settings.mindfulPrompts} onChange={() => toggle('mindfulPrompts')} />
              <span className="slider" />
            </label>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Gentle audio feedback</strong>
              <span>Play subtle calming chimes on check-ins, recognition, and registrations.</span>
            </div>
            <label className="switch" aria-label="Toggle gentle audio feedback">
              <input type="checkbox" checked={settings.audioFeedback} onChange={() => toggle('audioFeedback')} />
              <span className="slider" />
            </label>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Compact rhythm view</strong>
              <span>Dense layout for event calendar and community notes lists.</span>
            </div>
            <label className="switch" aria-label="Toggle compact rhythm view">
              <input type="checkbox" checked={settings.compactRhythm} onChange={() => toggle('compactRhythm')} />
              <span className="slider" />
            </label>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <strong>Weekly wellbeing digest</strong>
              <span>Receive a quiet weekly summary of peer recognitions and circles.</span>
            </div>
            <label className="switch" aria-label="Toggle weekly wellbeing digest">
              <input type="checkbox" checked={settings.emailDigest} onChange={() => toggle('emailDigest')} />
              <span className="slider" />
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <button className="button button-quiet" onClick={() => { onClose(); navigate('/profile') }}>
            Account details <Icon name="arrow" size={14} />
          </button>
          <button className="button button-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Shell({ path, navigate, user, children, onRoleSwitch, onUserUpdate }) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsList, setNotificationsList] = useState([])
  const title = path.slice(1).split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ') || 'Overview'
  const unreadCount = user?.unreadNotificationCount ?? 0
  const notificationTooltip = unreadCount > 0
    ? `Notifications (${unreadCount} unread)`
    : 'Notifications & updates'

  const toggleNotifications = async () => {
    if (!notificationsOpen && user?.id) {
      try {
        const list = await features.notifications(user.id)
        setNotificationsList(list)
      } catch (e) {
        console.error(e)
      }
    }
    setNotificationsOpen((v) => !v)
  }

  const handleMarkAllRead = async () => {
    try {
      await features.markAllNotificationsRead()
      setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })))
      if (onUserUpdate) onUserUpdate({ unreadNotificationCount: 0 })
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkOneRead = async (id) => {
    try {
      await features.markNotificationRead(id)
      setNotificationsList((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
      if (onUserUpdate) onUserUpdate({ unreadNotificationCount: Math.max(0, unreadCount - 1) })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        path={path}
        navigate={navigate}
        user={user}
        open={open}
        setOpen={setOpen}
        onRoleSwitch={onRoleSwitch}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <Tooltip content="Navigation menu" align="left">
              <button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation menu">
                <Icon name="menu" />
              </button>
            </Tooltip>
            <span>WorkBloom</span>
            <Icon name="chevron" size={13} />
            <strong>{title}</strong>
          </div>
          <div className="top-actions" style={{ position: 'relative' }}>
            <Tooltip content="Messages & conversations">
              <button className="icon-button" onClick={() => navigate('/chat')} aria-label="Open messages & conversations">
                <Icon name="chat" size={16} />
              </button>
            </Tooltip>
            <Tooltip content={notificationTooltip}>
              <button className="icon-button" onClick={toggleNotifications} aria-label={notificationTooltip}>
                <Icon name="bell" size={16} />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>
            </Tooltip>

            {notificationsOpen && (
              <div className="notifications-menu" onClick={(e) => e.stopPropagation()}>
                <div className="notifications-header">
                  <strong>Activity & Appreciation</strong>
                  {notificationsList.some((n) => !n.read) && (
                    <button className="text-link" onClick={handleMarkAllRead} style={{ fontSize: 11 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notifications-body">
                  {notificationsList.length === 0 ? (
                    <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 11, color: 'hsl(var(--muted))' }}>
                      No notifications right now.
                    </div>
                  ) : (
                    notificationsList.map((n) => (
                      <div
                        key={n.id}
                        className={`notification-card ${n.read ? '' : 'unread'}`}
                        onClick={() => handleMarkOneRead(n.id)}
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <small>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <Tooltip content="Settings & preferences" align="right">
              <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings & preferences">
                <Icon name="settings" size={16} />
              </button>
            </Tooltip>
            <Tooltip content={user?.fullName ? `${user.fullName}'s profile` : 'Your profile & account'} align="right">
              <button className="icon-button" onClick={() => navigate('/profile')} aria-label="Open your profile & account">
                <Avatar name={user?.fullName} image={user?.profileImage} size={28} />
              </button>
            </Tooltip>
          </div>
        </header>

        {children}

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} navigate={navigate} />
      </main>
    </div>
  )
}

function MainApp() {
  const [path, navigate] = useRoute()
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('workbloom_user') || 'null')
    } catch {
      return null
    }
  })
  const addToast = useToast()
  const token = getToken()

  useEffect(() => {
    if (user) {
      localStorage.setItem('workbloom_user', JSON.stringify(user))
    }
  }, [user])

  const refreshUser = useCallback(async (overrides = {}) => {
    if (!user?.id) return
    try {
      const fresh = await features.dashboard(user.id)
      setUser((prev) => ({ ...prev, ...fresh, ...overrides }))
    } catch (e) {
      console.error(e)
    }
  }, [user?.id])

  const handleRoleSwitch = async (newRole) => {
    try {
      const res = await auth.switchRole(newRole)
      if (res.success) {
        setUser((prev) => ({ ...prev, role: res.role, user: res.user }))
        addToast(`Persona role switched to ${res.role}! 🛡️`)
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const publicRoute = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/'

  useEffect(() => {
    if (!token && !publicRoute) navigate('/login')
    if (token && publicRoute) navigate('/dashboard')
  }, [token, publicRoute, navigate])

  if (!token || publicRoute) {
    if (token && publicRoute) return null
    const kind = path === '/register' ? 'register' : path === '/forgot-password' ? 'forgot' : 'login'
    return (
      <AuthPage
        kind={kind}
        onSuccess={(response) => {
          const u = response?.user || response
          setUser(u)
          navigate('/dashboard')
        }}
      />
    )
  }

  const renderContent = () => {
    switch (path) {
      case '/dashboard':
        return <DashboardView user={user} navigate={navigate} onUserUpdate={refreshUser} />
      case '/wellness':
        return <WellnessView user={user} navigate={navigate} onUserUpdate={refreshUser} />
      case '/events':
        return <EventsView user={user} onUserUpdate={refreshUser} />
      case '/community':
        return <CommunityView user={user} onUserUpdate={refreshUser} />
      case '/recognition':
        return <RecognitionView user={user} onUserUpdate={refreshUser} />
      case '/buddy':
        return <BuddyView user={user} navigate={navigate} onUserUpdate={refreshUser} />
      case '/learning':
        return <LearningView user={user} onUserUpdate={refreshUser} />
      case '/clubs':
        return <ClubsView user={user} onUserUpdate={refreshUser} />
      case '/impact':
        return <ImpactView user={user} onUserUpdate={refreshUser} />
      case '/chat':
        return <ChatView user={user} />
      case '/travel':
        return <TravelView user={user} navigate={navigate} />
      case '/directory':
        return <DirectoryView user={user} navigate={navigate} />
      case '/analytics':
        return <AnalyticsView user={user} onRoleSwitch={handleRoleSwitch} />
      case '/profile':
        return <ProfileView user={user} onUserUpdate={(diff) => setUser((p) => ({ ...p, ...diff }))} />
      default:
        return <DashboardView user={user} navigate={navigate} onUserUpdate={refreshUser} />
    }
  }

  return (
    <Shell
      path={path}
      navigate={navigate}
      user={user}
      onRoleSwitch={handleRoleSwitch}
      onUserUpdate={(diff) => setUser((p) => ({ ...p, ...diff }))}
    >
      {renderContent()}
    </Shell>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  )
}
