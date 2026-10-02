import apiClient from './apiClient';

export const learningApi = {
  getCourses: () => {
    return apiClient.get('/learning/courses');
  },

  createCourse: (courseData) => {
    return apiClient.post('/learning/courses', courseData);
  },

  /**
   * Backend requires employeeId as a query param (@RequestParam), not in
   * the request body - EnrollmentRequest only has `courseId`. Sending
   * employeeId only in the body (as this previously did) meant the
   * backend's required query param was never present, and every
   * enrollment call would fail with a 400.
   */
  enrollCourse: (employeeId, courseId) => {
    return apiClient.post(`/learning/courses/enroll?employeeId=${employeeId}`, { courseId });
  },

  getEnrollments: (employeeId = null) => {
    return apiClient.get('/learning/enrollments', employeeId ? { employeeId } : null);
  },

  startEnrollment: (enrollmentId, employeeId) => {
    return apiClient.put(`/learning/enrollments/${enrollmentId}/start${employeeId ? `?employeeId=${employeeId}` : ''}`);
  },

  completeEnrollment: (enrollmentId, employeeId) => {
    return apiClient.put(`/learning/enrollments/${enrollmentId}/complete${employeeId ? `?employeeId=${employeeId}` : ''}`);
  },
};

export default learningApi;
