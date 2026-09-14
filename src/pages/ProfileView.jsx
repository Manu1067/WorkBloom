import { useState } from 'react'
import { useToast } from '../components/ToastContext'

export function ProfileView({ user, onUserUpdate }) {
  const [designation, setDesignation] = useState(user.designation || 'Senior Experience Designer')
  const [department, setDepartment] = useState(user.department || 'Experience & Culture')
  const [saving, setSaving] = useState(false)
  const addToast = useToast()

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addToast('Profile updated gently. 🌸')
      if (onUserUpdate) onUserUpdate({ designation, department })
    }, 400)
  }

  return (
    <div className="content page-shell">
      <div className="profile-grid">
        <div className="card profile-card">
          <div
            className="avatar"
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              margin: '0 auto 16px',
              background: 'hsl(var(--sage-dark))',
              color: 'hsl(43 46% 96%)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 28,
            }}
          >
            {user.fullName?.charAt(0) || 'M'}
          </div>
          <h2 style={{ fontSize: 24, margin: '0 0 4px' }}>{user.fullName}</h2>
          <p style={{ margin: '0 0 12px', color: 'hsl(var(--muted))' }}>{user.email}</p>
          <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : user.role === 'HR' ? 'role-hr' : 'role-employee'}`}>
            {user.role} Role
          </span>

          <div style={{ marginTop: 24, borderTop: '1px solid hsl(var(--line))', paddingTop: 18, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginBottom: 4 }}>Annual Compensation</div>
            <strong style={{ fontSize: 20, color: 'hsl(var(--sage-dark))' }}>
              ${(user.salary || 115000).toLocaleString()}
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: 'hsl(var(--muted))' }}>
              Visible to you and People Ops only. Protected by WorkBloom privacy policy.
            </p>
          </div>
        </div>

        <div className="card card-pad">
          <h2 className="card-title">Personal settings & details</h2>
          <p className="card-caption">Manage your presence across WorkBloom</p>

          <form onSubmit={handleSave} style={{ marginTop: 20 }}>
            <div className="field">
              <label>Full Name</label>
              <input value={user.fullName} disabled />
            </div>
            <div className="field">
              <label>Work Email</label>
              <input value={user.email} disabled />
            </div>
            <div className="field">
              <label>Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </div>
            <div className="field">
              <label>Designation / Title</label>
              <input value={designation} onChange={(e) => setDesignation(e.target.value)} required />
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Saving changes...' : 'Save profile details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
