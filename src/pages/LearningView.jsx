import { useState, useEffect } from 'react'
import { features } from '../api'
import { useToast } from '../components/ToastContext'

export function LearningView({ user, onUserUpdate }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await features.courses()
      setCourses(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleEnroll = async (courseId, title) => {
    try {
      const res = await features.enrollCourse(courseId)
      if (res.success) {
        addToast(
          res.course.isEnrolled
            ? `Enrolled in "${title}"! Happy learning. 🌿`
            : `Unenrolled from "${title}".`
        )
        loadCourses()
        if (onUserUpdate) onUserUpdate()
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  return (
    <div className="content page-shell">
      <div className="module-hero" style={{ marginBottom: 28 }}>
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Learning shelf</p>
        <h1>Keep growing, gently</h1>
        <p className="subtitle" style={{ maxWidth: 580 }}>
          No mandatory quizzes or corporate compliance checklists. These short, beautiful micro-courses are crafted to help you master sustainable pacing, thoughtful craft, and team empathy.
        </p>
      </div>

      {loading && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="skeleton" style={{ height: 160 }} />
          <div className="skeleton" style={{ height: 160 }} />
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {courses.map((course) => (
          <div key={course.id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="badge-pill badge-cultivator">{course.category || 'Mindset'}</span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted))' }}>⏱ {course.durationMinutes || 45} mins</span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{course.title}</h3>
              <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                {course.description}
              </p>

              {course.isEnrolled && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span>Progress</span>
                    <strong>{course.progress || 0}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${course.progress || 0}%` }} />
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                className={`button ${course.isEnrolled ? 'button-quiet' : 'button-primary'}`}
                style={{ width: '100%' }}
                onClick={() => handleEnroll(course.id, course.title)}
              >
                {course.isEnrolled ? 'In Progress (Manage)' : 'Enroll in course'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
