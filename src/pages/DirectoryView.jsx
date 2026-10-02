import { useState, useEffect } from 'react'
import { employeeApi } from '../api/employeeApi'
import { useToast } from '../components/ToastContext'

export function DirectoryView({ user, navigate }) {
  const [employees, setEmployees] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedEmp, setSelectedEmp] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [empDetail, setEmpDetail] = useState(null)
  const addToast = useToast()

  const loadDirectory = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        size: 9,
      }
      if (search.trim()) params.search = search.trim()
      if (department) params.department = department
      if (status) params.status = status

      const res = await employeeApi.getAll(params)
      // Spring Boot Page object handles both pageable structure and direct arrays
      if (res && Array.isArray(res.content)) {
        setEmployees(res.content)
        setTotalPages(res.totalPages || 1)
        setTotalElements(res.totalElements || res.content.length)
      } else if (Array.isArray(res)) {
        setEmployees(res)
        setTotalPages(1)
        setTotalElements(res.length)
      } else {
        setEmployees([])
        setTotalPages(1)
        setTotalElements(0)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load employee directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDirectory()
  }, [page, department, status])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(0)
    loadDirectory()
  }

  const handleOpenDetail = async (empId) => {
    try {
      setSelectedEmp(empId)
      setDetailLoading(true)
      setEmpDetail(null)
      const detail = await employeeApi.getById(empId)
      setEmpDetail(detail)
    } catch (err) {
      addToast(err.message || 'Could not load employee details', 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>People & Culture</p>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Employee Directory</h1>
        <p className="subtitle" style={{ maxWidth: 580, color: 'hsl(var(--ink) / 0.85)' }}>
          Discover and connect with your colleagues across departments.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search by name or keyword..."
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
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value)
            setPage(0)
          }}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid hsl(var(--line))',
            background: 'hsl(var(--paper))',
            outline: 'none',
          }}
        >
          <option value="">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="Product">Product</option>
          <option value="Design">Design</option>
          <option value="HR">HR</option>
          <option value="People & Culture">People & Culture</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(0)
          }}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid hsl(var(--line))',
            background: 'hsl(var(--paper))',
            outline: 'none',
          }}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>

        <button type="submit" className="button button-primary" style={{ padding: '10px 18px' }}>
          Search
        </button>
      </form>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {/* Error Alert */}
      {error && !loading && (
        <div className="alert" style={{ background: 'hsl(var(--coral-soft) / 0.4)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && employees.length === 0 && (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 40, color: 'hsl(var(--muted))' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'hsl(var(--ink))' }}>No employees match your search.</h3>
          <p style={{ margin: '4px 0 16px', fontSize: 13 }}>Try adjusting your search filters or clearing the search query.</p>
          <button
            className="button button-quiet"
            onClick={() => {
              setSearch('')
              setDepartment('')
              setStatus('')
              setPage(0)
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Employee Cards Grid */}
      {!loading && !error && employees.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16, marginBottom: 24 }}>
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="card card-pad"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid hsl(var(--line))',
                  borderRadius: 14,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => handleOpenDetail(emp.id)}
              >
                <div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    {emp.profileImage ? (
                      <img
                        src={emp.profileImage}
                        alt={emp.fullName}
                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'hsl(var(--sage-dark))',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {emp.fullName ? emp.fullName.charAt(0) : 'E'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{emp.fullName}</h3>
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>{emp.employeeCode || `ID: #${emp.id}`}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: 'hsl(var(--sage-dark))' }}>{emp.department || 'General'}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        background: emp.status === 'ACTIVE' ? 'hsl(var(--sage-soft))' : 'hsl(var(--canvas))',
                        color: emp.status === 'ACTIVE' ? 'hsl(var(--sage-dark))' : 'hsl(var(--muted))',
                      }}
                    >
                      {emp.status || 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid hsl(var(--line) / 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="text-link" style={{ fontSize: 11, color: 'hsl(var(--sage-dark))', fontWeight: 600 }}>
                    View full profile →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 }}>
              <button
                className="button button-quiet"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Previous
              </button>
              <span style={{ fontSize: 13, color: 'hsl(var(--muted))' }}>
                Page {page + 1} of {totalPages} ({totalElements} employees)
              </span>
              <button
                className="button button-quiet"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Employee Detail Modal */}
      {selectedEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedEmp(null)}>
          <div className="modal-dialog" style={{ maxWidth: 480, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Colleague Details</h2>
              <button className="modal-close-btn" onClick={() => setSelectedEmp(null)}>✕</button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 20, textAlign: 'center' }}>
                <div className="skeleton" style={{ height: 120, borderRadius: 12 }} />
              </div>
            ) : empDetail ? (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  {empDetail.profileImage ? (
                    <img
                      src={empDetail.profileImage}
                      alt={empDetail.fullName || `${empDetail.firstName} ${empDetail.lastName}`}
                      style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'hsl(var(--sage-dark))',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 26,
                        fontWeight: 700,
                        margin: '0 auto 10px',
                      }}
                    >
                      {empDetail.firstName ? empDetail.firstName.charAt(0) : 'E'}
                    </div>
                  )}
                  <h3 style={{ margin: '0 0 2px', fontSize: 20 }}>
                    {empDetail.firstName} {empDetail.lastName}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'hsl(var(--muted))' }}>
                    {empDetail.designation || 'Team Member'} · {empDetail.department}
                  </p>
                </div>

                <div className="detail-list" style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 8 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Employee Code</span>
                    <strong>{empDetail.employeeCode || `#${empDetail.id}`}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 8 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Work Email</span>
                    <strong>{empDetail.email || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 8 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Phone</span>
                    <strong>{empDetail.phone || 'Not provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 8 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Joining Date</span>
                    <strong>{empDetail.joiningDate ? new Date(empDetail.joiningDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--canvas) / 0.5)', borderRadius: 8 }}>
                    <span style={{ color: 'hsl(var(--muted))' }}>Status</span>
                    <strong style={{ color: 'hsl(var(--sage-dark))' }}>{empDetail.status || 'ACTIVE'}</strong>
                  </div>
                  {/* Security Scoping: Only display salary if backend actually returned it */}
                  {empDetail.salary !== undefined && empDetail.salary !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'hsl(var(--paper-warm))', borderRadius: 8, border: '1px solid hsl(var(--gold) / 0.4)' }}>
                      <span style={{ color: 'hsl(var(--muted))' }}>Annual Compensation</span>
                      <strong>${Number(empDetail.salary).toLocaleString()}</strong>
                    </div>
                  )}
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
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
