import { useState, useEffect, useMemo } from 'react';
import { learningApi } from '../api/learningApi';
import { getEmployeeId } from '../api/apiClient';
import { useToast } from '../components/ToastContext';
import { PageHero } from '../components/PageHero';

export function LearningView({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'MY_LEARNING'
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Category filter for catalog
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Create Course modal
  const [createModal, setCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [category, setCategory] = useState('Mindset & Pacing');
  const [durationHours, setDurationHours] = useState(1);
  const [courseUrl, setCourseUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const addToast = useToast();
  const currentEmpId = user?.id || user?.employeeId || getEmployeeId();
  const isHrOrAdmin = user?.role === 'HR' || user?.role === 'ADMIN';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const coursesPromise = learningApi.getCourses();
      const enrollmentsPromise = currentEmpId ? learningApi.getEnrollments(currentEmpId) : Promise.resolve([]);

      const [coursesRes, enrollmentsRes] = await Promise.allSettled([
        coursesPromise,
        enrollmentsPromise,
      ]);

      if (coursesRes.status === 'fulfilled') {
        setCourses(Array.isArray(coursesRes.value) ? coursesRes.value : []);
      } else {
        setCourses([]);
      }

      if (enrollmentsRes.status === 'fulfilled') {
        setEnrollments(Array.isArray(enrollmentsRes.value) ? enrollmentsRes.value : []);
      } else {
        setEnrollments([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load learning shelf');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentEmpId]);

  // Map of courseId -> Enrollment object for fast status check
  const enrollmentsByCourseId = useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      const cId = e.courseId || e.course?.id;
      if (cId) {
        map[cId] = e;
      }
    });
    return map;
  }, [enrollments]);

  // Unique course categories
  const categories = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'ALL') return courses;
    return courses.filter((c) => c.category === selectedCategory);
  }, [courses, selectedCategory]);

  const handleEnroll = async (course) => {
    if (!currentEmpId) {
      addToast('Employee ID missing. Please log in again.', 'error');
      return;
    }
    const cId = course.id ?? course.courseId;
    if (cId === undefined || cId === null) {
      addToast('This course has no ID from the server, so it cannot be enrolled in. Please refresh the page.', 'error');
      return;
    }

    try {
      setActionLoadingId(cId);
      await learningApi.enrollCourse(currentEmpId, cId);
      addToast(`Enrolled in "${course.title}"! Happy learning. 🌿`);
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartEnrollment = async (enrollmentId, courseTitle) => {
    if (!currentEmpId) return;
    try {
      setActionLoadingId(enrollmentId);
      await learningApi.startEnrollment(enrollmentId, currentEmpId);
      addToast(`Started course "${courseTitle}"! 🚀`);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to start course', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteEnrollment = async (enrollmentId, courseTitle) => {
    if (!currentEmpId) return;
    try {
      setActionLoadingId(enrollmentId);
      await learningApi.completeEnrollment(enrollmentId, currentEmpId);
      addToast(`Congratulations! Completed "${courseTitle}". 🎉`);
      await loadData();
      if (onUserUpdate) onUserUpdate();
    } catch (err) {
      addToast(err.message || 'Failed to complete course', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateCourseSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('Please enter title and description.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        instructor: instructor.trim() || 'WorkBloom Academy',
        category: category.trim() || 'Mindset & Pacing',
        durationHours: Number(durationHours) || 1,
        courseUrl: courseUrl.trim() || null,
      };

      await learningApi.createCourse(payload);
      addToast(`New course "${title}" added to the catalog! 🌿`);
      
      setTitle('');
      setDescription('');
      setInstructor('');
      setCourseUrl('');
      setCreateModal(false);

      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to create course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalEnrolled = enrollments.length;
    const inProgress = enrollments.filter((e) => e.status === 'IN_PROGRESS').length;
    const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
    return { totalCourses, totalEnrolled, inProgress, completed };
  }, [courses, enrollments]);

  return (
    <div className="content page-shell">
      <PageHero page="learning" />
      {/* Hero */}
      <div 
        className="module-hero" 
        style={{ 
          marginBottom: 28,
          background: 'linear-gradient(135deg, hsl(var(--paper-warm)), hsl(var(--paper))), radial-gradient(circle at 90% 10%, hsl(var(--sage) / 0.18), transparent 45%)'
        }}
      >
        <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Learning Shelf</p>
        <h1>Keep growing, gently</h1>
        <p className="subtitle" style={{ maxWidth: 620 }}>
          No mandatory quizzes or corporate compliance checklists. Micro-courses crafted to help you master sustainable pacing, deep focus, and team empathy.
        </p>

        {/* Stats Strip */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '8px 16px', borderRadius: 12, background: 'hsl(var(--paper))' }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>CATALOG</span>
            <strong style={{ fontSize: 18, color: 'hsl(var(--ink))' }}>{stats.totalCourses} Courses</strong>
          </div>
          <div className="card" style={{ padding: '8px 16px', borderRadius: 12, background: 'hsl(var(--paper))' }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>MY ENROLLMENTS</span>
            <strong style={{ fontSize: 18, color: 'hsl(var(--sage))' }}>{stats.totalEnrolled} Active</strong>
          </div>
          <div className="card" style={{ padding: '8px 16px', borderRadius: 12, background: 'hsl(var(--paper))' }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>IN PROGRESS</span>
            <strong style={{ fontSize: 18, color: 'hsl(var(--coral))' }}>{stats.inProgress} Courses</strong>
          </div>
          <div className="card" style={{ padding: '8px 16px', borderRadius: 12, background: 'hsl(var(--paper))' }}>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted))', display: 'block' }}>COMPLETED</span>
            <strong style={{ fontSize: 18, color: 'hsl(var(--sage))' }}>{stats.completed} Finished</strong>
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={() => setCreateModal(true)}>
              + Add Course to Shelf
            </button>
          )}
          <button className="button button-quiet" onClick={loadData} disabled={loading}>
            🔄 Refresh Shelf
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid hsl(var(--line))', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`button ${activeTab === 'CATALOG' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          📚 Course Directory ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('MY_LEARNING')}
          className={`button ${activeTab === 'MY_LEARNING' ? 'button-primary' : 'button-quiet'}`}
          style={{ borderRadius: 20, padding: '6px 16px', fontSize: 13 }}
        >
          🎓 My Learning Shelf ({enrollments.length})
        </button>
      </div>

      {/* Category Filter for Catalog */}
      {activeTab === 'CATALOG' && categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted))' }}>Category:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`button ${selectedCategory === 'ALL' ? 'button-primary' : 'button-quiet'}`}
            style={{ padding: '4px 12px', fontSize: 12, borderRadius: 16 }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`button ${selectedCategory === cat ? 'button-primary' : 'button-quiet'}`}
              style={{ padding: '4px 12px', fontSize: 12, borderRadius: 16 }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
        </div>
      )}

      {/* Error Alert */}
      {!loading && error && (
        <div className="card card-pad" style={{ marginBottom: 24, borderColor: 'hsl(var(--coral-soft))', backgroundColor: 'hsl(var(--coral-soft) / 0.15)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'hsl(var(--coral))' }}>Unable to load courses</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14 }}>{error}</p>
          <button className="button button-primary" onClick={loadData}>Try again</button>
        </div>
      )}

      {/* Empty State Catalog */}
      {!loading && !error && activeTab === 'CATALOG' && filteredCourses.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <h3 style={{ margin: '0 0 8px' }}>No courses found</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            {selectedCategory === 'ALL'
              ? 'The learning catalog is currently empty. Check back soon for new micro-courses!'
              : `No courses found in category "${selectedCategory}".`}
          </p>
          {isHrOrAdmin && (
            <button className="button button-primary" onClick={() => setCreateModal(true)}>
              + Add first course
            </button>
          )}
        </div>
      )}

      {/* Empty State My Learning */}
      {!loading && !error && activeTab === 'MY_LEARNING' && enrollments.length === 0 && (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
          <h3 style={{ margin: '0 0 8px' }}>Your shelf is empty</h3>
          <p style={{ color: 'hsl(var(--muted))', maxWidth: 420, margin: '0 auto 20px' }}>
            You haven't enrolled in any micro-courses yet. Browse the catalog and pick a course to begin!
          </p>
          <button className="button button-primary" onClick={() => setActiveTab('CATALOG')}>
            Browse Catalog
          </button>
        </div>
      )}

      {/* CATALOG GRID */}
      {!loading && !error && activeTab === 'CATALOG' && filteredCourses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {filteredCourses.map((course) => {
            const cId = course.id || course.courseId;
            const existingEnrollment = enrollmentsByCourseId[cId];
            const isEnrolled = !!existingEnrollment;
            const status = existingEnrollment?.status;

            return (
              <div
                key={cId}
                className="card card-pad"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  background: 'hsl(var(--paper))',
                  transition: 'transform 0.2s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge-pill badge-cultivator" style={{ fontSize: 11 }}>
                      {course.category || 'Mindset & Pacing'}
                    </span>
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted))' }}>
                      ⏱ {course.durationHours ? `${course.durationHours} hr${course.durationHours > 1 ? 's' : ''}` : '45 mins'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{course.title}</h3>
                  
                  {course.instructor && (
                    <div style={{ fontSize: 12, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 8 }}>
                      By {course.instructor}
                    </div>
                  )}

                  <p style={{ fontSize: 13, color: 'hsl(var(--muted))', lineHeight: 1.5, margin: '0 0 16px' }}>
                    {course.description}
                  </p>
                </div>

                <div>
                  {isEnrolled ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--line) / 0.6)', paddingTop: 12 }}>
                      <span className={`badge-pill ${status === 'COMPLETED' ? 'badge-kind' : status === 'IN_PROGRESS' ? 'badge-calm' : 'badge-cultivator'}`}>
                        {status === 'COMPLETED' ? '✓ Completed' : status === 'IN_PROGRESS' ? '⏳ In Progress' : '📌 Enrolled'}
                      </span>
                      <button
                        className="button button-quiet"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setActiveTab('MY_LEARNING')}
                      >
                        Manage Shelf →
                      </button>
                    </div>
                  ) : (
                    <button
                      className="button button-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={actionLoadingId === cId}
                      onClick={() => handleEnroll(course)}
                    >
                      {actionLoadingId === cId ? 'Enrolling...' : 'Enroll in Course'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY LEARNING SHELF GRID */}
      {!loading && !error && activeTab === 'MY_LEARNING' && enrollments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {enrollments.map((enr) => {
            const enrollmentId = enr.enrollmentId || enr.id;
            const courseTitle = enr.courseTitle || enr.course?.title || 'Micro-course';
            const categoryName = enr.category || enr.course?.category || 'General';
            const duration = enr.durationHours || enr.course?.durationHours;
            const link = enr.courseUrl || enr.course?.courseUrl;
            const status = enr.status || 'ENROLLED';

            return (
              <div
                key={enrollmentId}
                className="card card-pad"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  background: 'linear-gradient(145deg, hsl(var(--paper)), hsl(var(--paper-warm)))',
                  border: '1px solid hsl(var(--line) / 0.8)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge-pill badge-cultivator" style={{ fontSize: 11 }}>
                      {categoryName}
                    </span>
                    <span 
                      className={`badge-pill ${status === 'COMPLETED' ? 'badge-kind' : status === 'IN_PROGRESS' ? 'badge-calm' : 'badge-cultivator'}`}
                      style={{ fontSize: 11 }}
                    >
                      {status === 'COMPLETED' ? '✓ Completed' : status === 'IN_PROGRESS' ? '⏳ In Progress' : '📌 Enrolled'}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 18 }}>{courseTitle}</h3>
                  {enr.instructor && (
                    <div style={{ fontSize: 12, color: 'hsl(var(--sage))', fontWeight: 600, marginBottom: 8 }}>
                      Instructor: {enr.instructor}
                    </div>
                  )}

                  {duration && (
                    <div style={{ fontSize: 12, color: 'hsl(var(--muted))', marginBottom: 12 }}>
                      ⏱ Estimated time: {duration} hour{duration > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid hsl(var(--line) / 0.6)', paddingTop: 14, marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {status === 'ENROLLED' && (
                      <button
                        className="button button-primary"
                        style={{ flex: 1, justifyContent: 'center' }}
                        disabled={actionLoadingId === enrollmentId}
                        onClick={() => handleStartEnrollment(enrollmentId, courseTitle)}
                      >
                        {actionLoadingId === enrollmentId ? 'Starting...' : '▶️ Start Course'}
                      </button>
                    )}

                    {status === 'IN_PROGRESS' && (
                      <button
                        className="button button-coral"
                        style={{ flex: 1, justifyContent: 'center' }}
                        disabled={actionLoadingId === enrollmentId}
                        onClick={() => handleCompleteEnrollment(enrollmentId, courseTitle)}
                      >
                        {actionLoadingId === enrollmentId ? 'Updating...' : '✅ Mark Completed'}
                      </button>
                    )}

                    {status === 'COMPLETED' && (
                      <div style={{ fontSize: 13, color: 'hsl(var(--sage))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        🎉 Finished! Course completed.
                      </div>
                    )}

                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-quiet"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        🔗 Resource Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {createModal && (
        <div className="modal-backdrop" onClick={() => setCreateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'hsl(var(--sage))' }}>Course Authoring</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>Add Micro-Course</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCourseSubmit}>
              <div className="field">
                <label>Course Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sustainable Sprint Pacing & Rest"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Mindset & Pacing"
                    required
                  />
                </div>
                <div className="field">
                  <label>Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Instructor Name</label>
                <input
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g. Dr. Maya Lin"
                />
              </div>

              <div className="field">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share a short summary of course takeaways..."
                  rows={3}
                  required
                />
              </div>

              <div className="field">
                <label>External Course / Resource URL (optional)</label>
                <input
                  value={courseUrl}
                  onChange={(e) => setCourseUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
                <button type="button" className="button button-quiet" onClick={() => setCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningView;
