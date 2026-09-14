import { useState, useEffect } from 'react'
import { employees } from '../api'
import { useToast } from '../components/ToastContext'

export function DirectoryView({ user, navigate }) {
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const addToast = useToast()

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.search = search
      if (dept !== 'All') params.department = dept
      const data = await employees.list(params)
      setList(data.employees || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load colleague directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [search, dept])

  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN'

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>People & Culture</p>
        <h1>Colleague Directory</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          Meet the humans behind WorkBloom. Search by name, craft, or department.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search by name, role, or craft..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 260px',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid hsl(var(--line))',
            background: 'hsl(var(--paper))',
            outline: 'none',
          }}
        />

        <select
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid hsl(var(--line))',
            background: 'hsl(var(--paper))',
            outline: 'none',
          }}
        >
          <option value="All">All Departments</option>
          <option value="Experience & Culture">Experience & Culture</option>
          <option value="Engineering">Engineering</option>
          <option value="Product & Design">Product & Design</option>
          <option value="People & Wellbeing">People & Wellbeing</option>
        </select>
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 120 }} />
          <div className="skeleton" style={{ height: 120 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
        {list.map((emp) => {
          const isSelf = emp.id === user.id
          const canSeeSalary = isHrOrAdmin || isSelf

          return (
            <div
              key={emp.id}
              className="card card-pad"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedEmp(emp)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18 }}>{emp.fullName}</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'hsl(var(--muted))' }}>
                      {emp.designation}
                    </p>
                  </div>
                  <span className={`role-badge ${emp.role === 'ADMIN' ? 'role-admin' : emp.role === 'HR' ? 'role-hr' : 'role-employee'}`}>
                    {emp.role}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'hsl(var(--sage))', fontWeight: 600, marginTop: 6 }}>
                  {emp.department}
                </div>

                <div style={{ marginTop: 12, fontSize: 12, color: 'hsl(var(--muted))' }}>
                  {emp.email}
                </div>
              </div>

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid hsl(var(--line) / 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11 }}>
                  <span style={{ color: 'hsl(var(--muted))' }}>Salary: </span>
                  {canSeeSalary && emp.salary ? (
                    <strong style={{ color: 'hsl(var(--sage-dark))' }}>
                      ${emp.salary.toLocaleString()}
                      {isHrOrAdmin && !isSelf && <span style={{ fontSize: 9, color: 'hsl(var(--coral))' }}> (HR)</span>}
                    </strong>
                  ) : (
                    <span style={{ color: 'hsl(var(--muted))', fontStyle: 'italic' }}>
                      🔒 Confidential
                    </span>
                  )}
                </div>

                <button
                  className="button button-quiet"
                  style={{ fontSize: 10, padding: '4px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedEmp(emp)
                  }}
                >
                  View details →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {selectedEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Colleague Profile</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>{selectedEmp.fullName}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedEmp(null)}>✕</button>
            </div>

            <div className="detail-list">
              <div className="detail-row">
                <span>Role & Title</span>
                <strong>{selectedEmp.designation}</strong>
              </div>
              <div className="detail-row">
                <span>Department</span>
                <strong>{selectedEmp.department}</strong>
              </div>
              <div className="detail-row">
                <span>System Role</span>
                <strong className={`role-badge ${selectedEmp.role === 'ADMIN' ? 'role-admin' : selectedEmp.role === 'HR' ? 'role-hr' : 'role-employee'}`}>
                  {selectedEmp.role}
                </strong>
              </div>
              <div className="detail-row">
                <span>Email</span>
                <strong>{selectedEmp.email}</strong>
              </div>
              <div className="detail-row">
                <span>Annual Compensation</span>
                <strong>
                  {isHrOrAdmin || selectedEmp.id === user.id ? (
                    `$${(selectedEmp.salary || 120000).toLocaleString()}`
                  ) : (
                    '🔒 Masked by Privacy Policy (HR only)'
                  )}
                </strong>
              </div>
              <div className="detail-row">
                <span>Latest Mindful Mood</span>
                <strong>{selectedEmp.latestMood || 'Steady'}</strong>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="button button-quiet" onClick={() => setSelectedEmp(null)}>Close</button>
              <button
                className="button button-primary"
                onClick={() => {
                  setSelectedEmp(null)
                  navigate('/chat')
                }}
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
