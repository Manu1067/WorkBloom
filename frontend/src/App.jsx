import { useCallback, useEffect, useMemo, useState } from 'react'
import { auth, clearSession, features, getToken, setSession } from './api'

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
      ['clubs', 'Clubs', 'spark'],
      ['events', 'Events', 'calendar'],
      ['chat', 'Messages', 'chat'],
    ],
  },
  {
    label: 'Your impact',
    items: [['impact', 'Make an impact', 'heart']],
  },
]

const moduleMeta = {
  travel: { title: 'Travel well', eyebrow: 'Room to roam', intro: 'Plan a restorative route, discover a new place, and let your next reset be a little more intentional.', action: 'Plan a route', endpoint: features.destinations, type: 'destination' },
  events: { title: 'Good things, together', eyebrow: 'On the calendar', intro: 'The small moments on this calendar are invitations: learn something, meet someone, or simply take a pause.', action: 'Explore events', endpoint: features.events, type: 'event' },
  community: { title: 'A room for real talk', eyebrow: 'Community notes', intro: 'Ideas, questions, and small wins from people making WorkBloom their own.', action: 'See latest notes', endpoint: features.community, type: 'post' },
  clubs: { title: 'Find your people', eyebrow: 'Clubs & circles', intro: 'Follow a curiosity or bring one with you. There is probably a circle already in motion.', action: 'Browse clubs', endpoint: features.clubs, type: 'club' },
  learning: { title: 'Keep growing, gently', eyebrow: 'Learning shelf', intro: 'Short courses and useful ideas for the pace you actually have today.', action: 'Browse learning', endpoint: features.courses, type: 'course' },
  impact: { title: 'Leave something better', eyebrow: 'Community impact', intro: 'A useful step does not have to be a grand gesture. Choose one that fits this week.', action: 'See opportunities', endpoint: features.impact, type: 'impact' },
  chat: { title: 'Stay in the loop', eyebrow: 'Your conversations', intro: 'The people and threads worth returning to, gathered in one calm place.', action: 'Start a conversation', endpoint: features.conversations, type: 'conversation' },
}

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
}

function Icon({ name, size = 18 }) {
  return <svg className="nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
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

function useRemote(request, active = true) {
  const [state, setState] = useState({ data: null, loading: active, error: '' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ data: null, loading: false, error: '' })
      return () => { alive = false }
    }
    setState((current) => ({ ...current, loading: true, error: '' }))
    request()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((error) => alive && setState({ data: null, loading: false, error: error.message || 'Something went wrong.' }))
    return () => { alive = false }
  }, [request, active, attempt])
  return { ...state, retry: () => setAttempt((value) => value + 1) }
}

function initials(name = 'WB') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function listFrom(data, keys = []) {
  if (Array.isArray(data)) return data
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key]
  return []
}

function Avatar({ name, image, size }) {
  return <div className="avatar" style={size ? { width: size, height: size } : undefined}>{image ? <img src={image} alt="" /> : initials(name)}</div>
}

function AuthLayout({ children, mode }) {
  const [, navigate] = useRoute()
  return <main className="auth-shell">
    <aside className="auth-aside">
      <button className="brand" onClick={() => navigate('/login')} aria-label="Go to WorkBloom login"><span className="brand-mark" /><span className="brand-name">WorkBloom</span></button>
      <div>
        <div className="auth-quote">“A little room to be human, every day.”</div>
        <h1>{mode === 'login' ? 'Start where you are.' : 'Make room for what matters.'}</h1>
        <p>WorkBloom is a quieter kind of workplace: a place to check in, find your people, and take one useful step.</p>
      </div>
      <span className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>A shared space for better days</span>
    </aside>
    <section className="auth-main">{children}</section>
  </main>
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
      const body = isRegister ? { fullName: form.fullName, email: form.email, password: form.password } : { email: form.email, ...(isForgot ? {} : { password: form.password }) }
      const response = isForgot ? await auth.forgotPassword(body) : isRegister ? await auth.register(body) : await auth.login(body)
      if (isForgot) setStatus({ busy: false, error: '', done: true })
      else {
        setSession(response)
        onSuccess(response)
      }
    } catch (error) {
      setStatus({ busy: false, error: error.message || 'We could not complete that request.', done: false })
    }
  }
    return <AuthLayout mode={kind}>
    <form className="card form-card" onSubmit={submit}>
      <p className="eyebrow">{isForgot ? 'Reset access' : isRegister ? 'Join the room' : 'Welcome back'}</p>
      <h1>{isForgot ? 'A fresh start.' : isRegister ? 'Come on in.' : 'Good morning.'}</h1>
      <p className="subtitle">{isForgot ? 'Enter your work email and we will send reset instructions if the account is found.' : isRegister ? 'Create your space in a couple of minutes.' : 'Your people, plans, and small wins are waiting.'}</p>
      {status.error && <div className="alert" role="alert">{status.error}</div>}
      {status.done && <div className="alert" role="status">If an account matches that email, reset instructions are on their way.</div>}
      {isRegister && <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" required value={form.fullName} onChange={update} autoComplete="name" /></div>}
      <div className="field"><label htmlFor="email">Work email</label><input id="email" name="email" type="email" required value={form.email} onChange={update} autoComplete="email" /></div>
      {!isForgot && <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength="8" value={form.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} /></div>}
      {isRegister && <div className="collection-grid" style={{ gap: 10, marginTop: 4 }}><div className="field"><label htmlFor="department">Department</label><input id="department" name="department" value={form.department} onChange={update} /></div><div className="field"><label htmlFor="designation">Role</label><input id="designation" name="designation" value={form.designation} onChange={update} /></div></div>}
      <div className="form-footer">
        {!isRegister && !isForgot && <button type="button" className="text-link" onClick={() => window.history.pushState({}, '', '/forgot-password') || window.dispatchEvent(new PopStateEvent('popstate'))}>Forgot password?</button>}
        <button className="button button-primary" type="submit" disabled={status.busy}>{status.busy ? 'One moment…' : isForgot ? 'Send instructions' : isRegister ? 'Create my space' : 'Enter WorkBloom'} <Icon name="arrow" size={15} /></button>
      </div>
      <p className="form-note">{isForgot ? 'Remembered it? ' : isRegister ? 'Already have an account? ' : 'New to WorkBloom? '}<a href={isForgot || isRegister ? '/login' : '/register'} onClick={(event) => { event.preventDefault(); window.history.pushState({}, '', event.currentTarget.getAttribute('href')); window.dispatchEvent(new PopStateEvent('popstate')) }}>{isForgot || isRegister ? 'Back to sign in' : 'Create an account'}</a></p>
    </form>
  </AuthLayout>
}

function Sidebar({ path, navigate, user, open, setOpen }) {
  const go = (route) => { navigate(`/${route}`); setOpen(false) }
  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <button className="brand" onClick={() => go('dashboard')} aria-label="Go to dashboard"><span className="brand-mark" /><span className="brand-name">WorkBloom</span></button>
    {navGroups.map((group) => <div key={group.label} style={{ marginBottom: 22 }}><div className="nav-label">{group.label}</div><nav className="nav-group" aria-label={group.label}>{group.items.map(([route, label, icon]) => <button className={`nav-item ${path === `/${route}` ? 'active' : ''}`} key={route} onClick={() => go(route)}><Icon name={icon} />{label}</button>)}</nav></div>)}
    <div className="sidebar-spacer" />
    <div className="sidebar-note"><strong>One useful step.</strong><span>What would make today feel a touch better?</span></div>
    <div className="sidebar-user"><Avatar name={user?.fullName} image={user?.profileImage} /><div className="user-meta"><strong>{user?.fullName || 'Your profile'}</strong><span>{user?.designation || user?.department || 'WorkBloom member'}</span></div><button className="logout-button" onClick={() => { clearSession(); navigate('/login') }} aria-label="Sign out"><Icon name="logout" size={16} /></button></div>
  </aside>
}

function Shell({ path, navigate, user, children }) {
  const [open, setOpen] = useState(false)
  const title = path.slice(1).split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ') || 'Overview'
  return <div className="app-shell">
    <Sidebar path={path} navigate={navigate} user={user} open={open} setOpen={setOpen} />
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Icon name="menu" /></button><span>WorkBloom</span><Icon name="chevron" size={13} /><strong>{title}</strong></div><div className="top-actions"><button className="icon-button" onClick={() => navigate('/chat')} aria-label="Open messages"><Icon name="chat" size={16} /></button><button className="icon-button" onClick={() => navigate('/dashboard')} aria-label="View notifications"><Icon name="bell" size={16} />{user?.unreadNotificationCount > 0 && <span className="notification-dot" />}</button><button className="icon-button" onClick={() => navigate('/profile')} aria-label="Open profile"><Avatar name={user?.fullName} image={user?.profileImage} size={28} /></button></div></header>
      {children}
    </main>
  </div>
}

function LoadingView() {
  return <div className="content page-shell"><div className="loading-grid"><div className="skeleton" /><div className="skeleton" /></div><div className="section-grid"><div className="skeleton" /><div className="skeleton" /></div></div>
}

function ErrorState({ message, retry }) {
  return <div className="empty-state" role="alert"><strong>We could not bring that in.</strong><br />{message}<br /><button className="button button-quiet" style={{ marginTop: 13 }} onClick={retry}>Try again</button></div>
}

function Dashboard({ employeeId, setUser, navigate }) {
  const request = useMemo(() => () => features.dashboard(employeeId), [employeeId])
  const { data, loading, error, retry } = useRemote(request, Boolean(employeeId))
  useEffect(() => { if (data) setUser(data) }, [data, setUser])
  if (loading) return <LoadingView />
  if (error) return <div className="content page-shell"><div className="module-hero"><p className="eyebrow">Your overview</p><h1>We hit a small pause.</h1><p className="subtitle">Your dashboard could not load right now. Your space is still here.</p><ErrorState message={error} retry={retry} /></div></div>
  const user = data || {}
  const events = listFrom(user.upcomingEvents)
  const learning = user.learning || {}
  const impact = user.impact || {}
  const clubs = user.clubs || {}
  const buddy = user.buddy || {}
  const firstName = (user.fullName || 'there').split(' ')[0]
  return <div className="content page-shell">
    <div className="page-heading"><div><p className="eyebrow">Today, {new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</p><h1>Good morning, {firstName}.</h1><p className="subtitle">Here is a gentle read on what is waiting for you.</p></div><button className="button button-primary" onClick={() => navigate('/wellness')}><Icon name="leaf" size={15} /> Check in</button></div>
    <div className="dashboard-grid"><section className="card hero-card"><p className="eyebrow">Your daily rhythm</p><h1>Small steps count<br />more than you think.</h1><p className="subtitle">There is no perfect pace here. Choose one useful thing, then let the rest of the day unfold.</p><div className="hero-meta"><span><Icon name="heart" size={14} /> {user.recognitionReceivedCount ?? 0} recognitions</span><span><Icon name="users" size={14} /> {user.communityPostCount ?? 0} community notes</span></div></section><section className="card daily-card"><p className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>A useful prompt</p><h3>What deserves ten quiet minutes today?</h3><p>Try naming the smallest version of it. Small is a perfectly good place to begin.</p><button className="daily-action" onClick={() => navigate('/wellness')}>Open your check-in <Icon name="arrow" size={14} /></button></section></div>
    <div className="section-grid"><section className="card card-pad"><div className="card-header"><div><h2 className="card-title">Coming up</h2><p className="card-caption">A few places to be, if you want to be there.</p></div><button className="text-link" onClick={() => navigate('/events')}>View calendar</button></div>{events.length ? <div className="event-list">{events.slice(0, 3).map((event, index) => <div className="event-item" key={event.id || index}><div className="event-date"><strong>{event.startDate ? new Date(event.startDate).getDate() : '—'}</strong><span>{event.startDate ? new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(event.startDate)) : 'Soon'}</span></div><div><p className="event-name">{event.title || event.name || 'Community gathering'}</p><p className="event-info">{event.location || event.description || 'WorkBloom event'}</p></div><span className="event-type">{event.eventType || 'Open'}</span></div>)}</div> : <div className="empty-state">No upcoming events just yet.</div>}</section><section className="card card-pad"><div className="card-header"><div><h2 className="card-title">Your check-in</h2><p className="card-caption">The latest signal from you.</p></div><button className="text-link" onClick={() => navigate('/wellness')}>Update</button></div><div className="mood-wrap"><div className="mood-ring"><strong>{user.latestEnergyLevel ?? '—'}</strong></div><div className="mood-copy"><strong>{user.latestMood || 'No check-in yet'}</strong><span>{user.latestStressLevel != null ? `Stress level ${user.latestStressLevel} · energy ${user.latestEnergyLevel ?? '—'}` : 'A two-minute pause can change the texture of a day.'}</span></div></div><div className="bar-list"><div className="bar-line"><span>Energy</span><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, Number(user.latestEnergyLevel || 0) * 10)}%` }} /></div><b>{user.latestEnergyLevel ?? '—'}</b></div><div className="bar-line"><span>Stress</span><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, Number(user.latestStressLevel || 0) * 10)}%` }} /></div><b>{user.latestStressLevel ?? '—'}</b></div></div></section></div>
    <div className="lower-grid"><section className="card card-pad mini-card"><div className="mini-icon sage"><Icon name="book" size={17} /></div><h3>Learning in motion</h3><p>Keep a little momentum going.</p><div className="mini-value">{learning.inProgressCount ?? 0} <small>in progress</small></div></section><section className="card card-pad mini-card"><div className="mini-icon coral"><Icon name="heart" size={17} /></div><h3>Your impact</h3><p>Good things you have signed up for.</p><div className="mini-value">{impact.registeredCount ?? 0} <small>registered</small></div></section><section className="card card-pad mini-card"><div className="mini-icon gold"><Icon name="users" size={17} /></div><h3>Your circles</h3><p>Places where shared interests grow.</p><div className="mini-value">{clubs.activeMembershipCount ?? 0} <small>active clubs</small></div></section></div>
    <div className="card card-pad" style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}><div><p className="eyebrow">A little connection</p><h2 className="card-title">{buddy.activeBuddy ? `You and ${buddy.activeBuddy.fullName || buddy.activeBuddy.name || 'your buddy'} are paired.` : 'Find a wellbeing buddy.'}</h2><p className="card-caption">{buddy.pendingRequestCount ? `${buddy.pendingRequestCount} request waiting for you.` : 'A low-pressure way to have someone in your corner.'}</p></div><button className="button button-quiet" onClick={() => navigate('/community')}>{buddy.activeBuddy ? 'See your circle' : 'Explore community'} <Icon name="arrow" size={14} /></button></div>
  </div>
}

function ModulePage({ module }) {
  const request = useMemo(() => module.endpoint, [module.endpoint])
  const { data, loading, error, retry } = useRemote(request)
  const items = listFrom(data, ['content', 'items', 'data', 'results', 'events', 'posts', 'clubs', 'courses', 'destinations', 'conversations'])
  const [search, setSearch] = useState('')
  const filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
  return <div className="content page-shell"><div className="page-heading"><div><p className="eyebrow">{module.eyebrow}</p><h1>{module.title}</h1><p className="subtitle">{module.intro}</p></div><button className="button button-primary" onClick={() => document.getElementById('module-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Icon name="arrow" size={15} /> {module.action}</button></div><div className="module-hero"><p className="eyebrow">Make it yours</p><h2>There is always a next small thing.</h2><p className="subtitle">Browse what is active now, save what catches your eye, and return when the timing feels right.</p></div><section id="module-content" className="card card-pad" style={{ marginTop: 18 }}><div className="card-header"><div><h2 className="card-title">{module.type === 'post' ? 'Latest from the room' : `Explore ${module.type}s`}</h2><p className="card-caption">{loading ? 'Gathering the latest…' : `${filtered.length} ${module.type}${filtered.length === 1 ? '' : 's'} available`}</p></div>{items.length > 2 && <div className="field" style={{ margin: 0, minWidth: 180 }}><label className="sr-only" htmlFor="module-search">Search</label><input id="module-search" placeholder="Search" value={search} onChange={(event) => setSearch(event.target.value)} /></div>}</div>{loading ? <div className="collection-grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div> : error ? <ErrorState message={error} retry={retry} /> : filtered.length ? <div className="collection-grid">{filtered.map((item, index) => <ModuleItem key={item.id || item.title || index} item={item} type={module.type} />)}</div> : <div className="empty-state">Nothing is here yet. Check back soon, or be the first to start something.</div>}</section></div>
}

function ModuleItem({ item, type }) {
  const title = item.title || item.name || item.courseName || item.clubName || item.destinationName || item.subject || `${type[0].toUpperCase()}${type.slice(1)} ${item.id || ''}`
  const description = item.description || item.summary || item.location || item.shortDescription || 'A place to explore at your own pace.'
  const date = item.startDate || item.date || item.createdAt
  const icon = type === 'course' ? 'book' : type === 'event' ? 'calendar' : type === 'conversation' ? 'chat' : type === 'impact' ? 'heart' : type === 'destination' ? 'compass' : type === 'club' ? 'users' : 'spark'
  return <article className="collection-item"><span className="tag"><Icon name={icon} size={12} /> {date ? formatDate(date) : type}</span><h3>{title}</h3><p>{description}</p></article>
}

function WellnessPage({ user, employeeId }) {
  const [mood, setMood] = useState(user?.latestMood || '')
  const [status, setStatus] = useState({ busy: false, done: false, error: '' })
  const choices = ['Steady', 'Bright', 'Tired', 'Full']
  const save = async () => {
    setStatus({ busy: true, done: false, error: '' })
    try {
      await features.recordMood(employeeId, { mood })
      setStatus({ busy: false, done: true, error: '' })
    } catch (error) {
      setStatus({ busy: false, done: false, error: error.message || 'We could not save your check-in.' })
    }
  }
  return <div className="content page-shell"><div className="page-heading"><div><p className="eyebrow">A pause for you</p><h1>How is the day landing?</h1><p className="subtitle">No score to chase. Just a useful signal, if you feel like sharing it.</p></div></div><div className="module-layout"><section className="card card-pad"><p className="eyebrow">Today’s check-in</p><h2>What word fits best?</h2><p className="subtitle" style={{ marginBottom: 24 }}>You can change this any time. It is yours.</p>{status.error && <div className="alert" role="alert">{status.error}</div>}{status.done && <div className="alert" role="status">Your check-in is saved. Thank you for making a little room for yourself.</div>}<div className="collection-grid">{choices.map((choice) => <button key={choice} className="collection-item" style={{ textAlign: 'left', borderColor: mood === choice ? 'hsl(var(--coral))' : undefined, background: mood === choice ? 'hsl(var(--coral-soft))' : undefined }} onClick={() => { setMood(choice); setStatus({ busy: false, done: false, error: '' }) }}><span className="tag">{choice === 'Steady' ? 'A' : choice === 'Bright' ? 'B' : choice === 'Tired' ? 'C' : 'D'}</span><h3>{choice}</h3><p>{choice === 'Steady' ? 'I have a little ground beneath me.' : choice === 'Bright' ? 'There is some lift in the day.' : choice === 'Tired' ? 'I am carrying more than usual.' : 'There is a lot moving through me.'}</p></button>)}</div><button className="button button-primary" style={{ marginTop: 22 }} onClick={save} disabled={!mood || status.busy}>{status.busy ? 'Saving…' : status.done ? 'Check-in saved' : 'Save this check-in'} <Icon name="arrow" size={14} /></button></section><aside className="card daily-card"><p className="eyebrow" style={{ color: 'hsl(var(--gold))' }}>A softer metric</p><h3>Your energy is information, not a verdict.</h3><p>Take what you need. A glass of water, a walk to the window, or a message to someone safe all count.</p></aside></div></div>
}

function ProfilePage({ user }) {
  return <div className="content page-shell"><div className="page-heading"><div><p className="eyebrow">Your space</p><h1>Profile</h1><p className="subtitle">The details that help WorkBloom feel like yours.</p></div><button className="button button-quiet" onClick={() => window.alert('Profile editing will be available when the profile endpoint is connected.')}>Edit profile</button></div><div className="profile-grid"><section className="card profile-card"><Avatar name={user?.fullName} image={user?.profileImage} /><h2>{user?.fullName || 'WorkBloom member'}</h2><p>{user?.designation || 'Your role'}{user?.department ? ` · ${user.department}` : ''}</p><div className="mini-icon coral" style={{ margin: '24px auto 0' }}><Icon name="heart" size={16} /></div></section><section className="card card-pad"><p className="eyebrow">Your details</p><div className="detail-list"><div className="detail-row"><span>Email</span><strong>{user?.email || 'Not available'}</strong></div><div className="detail-row"><span>Department</span><strong>{user?.department || 'Not available'}</strong></div><div className="detail-row"><span>Designation</span><strong>{user?.designation || 'Not available'}</strong></div><div className="detail-row"><span>Member since</span><strong>{user?.generatedAt ? formatDate(user.generatedAt) : 'Welcome'}</strong></div></div></section></div></div>
}

export default function App() {
  const [path, navigate] = useRoute()
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('workbloom_user') || 'null') } catch { return null }
  })
  const token = getToken()
  const employeeId = user?.employeeId || user?.id || localStorage.getItem('workbloom_employee')
  useEffect(() => { if (user) localStorage.setItem('workbloom_user', JSON.stringify(user)) }, [user])
  const publicRoute = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/'
  useEffect(() => {
    if (!token && !publicRoute) navigate('/login')
    if (token && publicRoute) navigate('/dashboard')
  }, [token, publicRoute, navigate])
  if (!token || publicRoute) {
    if (token && publicRoute) return null
    const kind = path === '/register' ? 'register' : path === '/forgot-password' ? 'forgot' : 'login'
    return <AuthPage kind={kind} onSuccess={(response) => { setUser(response?.user || response); navigate('/dashboard') }} />
  }
  const content = path === '/dashboard' ? <Dashboard employeeId={employeeId} setUser={setUser} navigate={navigate} /> : path === '/wellness' ? <WellnessPage user={user} employeeId={employeeId} /> : path === '/profile' ? <ProfilePage user={user} /> : moduleMeta[path.slice(1)] ? <ModulePage module={moduleMeta[path.slice(1)]} /> : <Dashboard employeeId={employeeId} setUser={setUser} navigate={navigate} />
  return <Shell path={path} navigate={navigate} user={user}>{content}</Shell>
}