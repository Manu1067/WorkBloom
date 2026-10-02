import { useState, useEffect } from 'react'
import { employeeApi } from '../api/employeeApi'
import { getEmployeeId } from '../api/apiClient'
import { useToast } from '../components/ToastContext'

export function ProfileView({ user, onUserUpdate }) {
  const empId = user?.id || user?.employeeId || getEmployeeId()

  const [phone, setPhone] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const addToast = useToast()

  const loadProfile = async () => {
    if (!empId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await employeeApi.getById(empId)
      setProfileData(data)
      setPhone(data?.phone || '')
      setProfileImage(data?.profileImage || '')
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not fetch profile details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [empId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!empId) return

    try {
      setSaving(true)
      const updated = await employeeApi.updateProfile(empId, {
        phone,
        profileImage,
      })

      addToast('Profile updated successfully! 🌸')
      setProfileData(updated)

      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          phone: updated?.phone,
          profileImage: updated?.profileImage,
        })
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="content page-shell">
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    )
  }

  const displayName = profileData
    ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
    : user?.fullName || 'Colleague'

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>Personal Space</p>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>My Profile</h1>
        <p className="subtitle" style={{ maxWidth: 580, color: 'hsl(var(--ink) / 0.85)' }}>
          Manage your personal contact info and avatar preferences.
        </p>
      </div>

      {error && <div className="alert" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Left Profile Overview Card */}
        <div className="card profile-card" style={{ padding: 24, textAlign: 'center' }}>
          {profileImage || profileData?.profileImage ? (
            <img
              src={profileImage || profileData?.profileImage}
              alt={displayName}
              style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', border: '2px solid hsl(var(--sage-dark))' }}
            />
          ) : (
            <div
              className="avatar"
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                margin: '0 auto 16px',
                background: 'hsl(var(--sage-dark))',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {displayName.charAt(0)}
            </div>
          )}

          <h2 style={{ fontSize: 22, margin: '0 0 4px' }}>{displayName}</h2>
          <p style={{ margin: '0 0 12px', color: 'hsl(var(--muted))', fontSize: 13 }}>{profileData?.email || user?.email}</p>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              background: 'hsl(var(--sage-soft))',
              color: 'hsl(var(--sage-dark))',
            }}
          >
            {profileData?.status || user?.role || 'ACTIVE'}
          </span>

          <div style={{ marginTop: 24, borderTop: '1px solid hsl(var(--line))', paddingTop: 18, textAlign: 'left', fontSize: 13 }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--muted))' }}>Department:</span>
              <strong>{profileData?.department || user?.department || 'N/A'}</strong>
            </div>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--muted))' }}>Designation:</span>
              <strong>{profileData?.designation || user?.designation || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--muted))' }}>Employee ID:</span>
              <strong>{profileData?.employeeCode || `#${empId}`}</strong>
            </div>
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="card card-pad" style={{ padding: 24 }}>
          <h2 className="card-title" style={{ margin: '0 0 4px', fontSize: 20 }}>Personal Contact & Avatar</h2>
          <p className="card-caption" style={{ margin: '0 0 20px', fontSize: 12, color: 'hsl(var(--muted))' }}>
            Update permitted employee details via real Spring Boot API
          </p>

          <form onSubmit={handleSave}>
            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Full Name (Read-Only)</label>
              <input value={displayName} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--canvas) / 0.5)' }} />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Work Email (Read-Only)</label>
              <input value={profileData?.email || user?.email || ''} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--canvas) / 0.5)' }} />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Department (HR Managed)</label>
              <input value={profileData?.department || user?.department || ''} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--canvas) / 0.5)' }} />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Designation (HR Managed)</label>
              <input value={profileData?.designation || user?.designation || ''} disabled style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--canvas) / 0.5)' }} />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Phone Number (Editable)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
              />
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Profile Image URL (Editable)</label>
              <input
                type="url"
                placeholder="https://..."
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid hsl(var(--line))', background: 'hsl(var(--paper))' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
