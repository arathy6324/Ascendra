import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ascendra_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 & token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login/") || originalRequest.url?.includes("/auth/refresh/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("ascendra_refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("ascendra_access_token");
        localStorage.removeItem("ascendra_user");
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem("ascendra_access_token", data.access);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
        processQueue(null, data.access);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("ascendra_access_token");
        localStorage.removeItem("ascendra_refresh_token");
        localStorage.removeItem("ascendra_user");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

/* ==================== API SERVICE FUNCTIONS ==================== */

// Auth
export const authApi = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (data) => api.post("/auth/register/", data),
  refresh: (refreshToken) => api.post("/auth/refresh/", { refresh: refreshToken }),
  getMe: () => api.get("/auth/me/"),
  updateMe: (data) => api.patch("/auth/me/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
};

// Admin
export const adminApi = {
  getAnalyticsSummary: () => api.get("/accounts/admin-summary/"),
  getUsers: (params) => api.get("/accounts/users/", { params }),
  createUser: (data) => api.post("/accounts/users/", data),
  updateUser: (id, data) => api.patch(`/accounts/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/accounts/users/${id}/`),
};

// Students & Profiles
export const studentApi = {
  getProfiles: (params) => api.get("/students/profiles/", { params }),
  getProfileById: (id) => api.get(`/students/profiles/${id}/`),
  getMyProfile: () => api.get("/students/profiles/me/"),
  updateMyProfile: (data) => api.patch("/students/profiles/me/", data),
  completeCourse: (id) => api.post(`/students/profiles/${id}/complete_course/`),
  activateAlumni: (id, data) => api.post(`/students/profiles/${id}/activate_alumni/`, data),
  updateProfessional: (id, data) => api.patch(`/students/professionals/${id}/`, data),
  createProfessional: (data) => api.post("/students/professionals/", data),
};

// Academics
export const academicsApi = {
  getCourses: (params) => api.get("/academics/courses/", { params }),
  createCourse: (data) => api.post("/academics/courses/", data),
  updateCourse: (id, data) => api.patch(`/academics/courses/${id}/`, data),
  deleteCourse: (id) => api.delete(`/academics/courses/${id}/`),
  
  getModules: (params) => api.get("/academics/modules/", { params }),
  createModule: (data) => api.post("/academics/modules/", data),
  
  getMaterials: (params) => api.get("/academics/materials/", { params }),
  createMaterial: (data) => api.post("/academics/materials/", data),
  
  getBatches: (params) => api.get("/academics/batches/", { params }),
  createBatch: (data) => api.post("/academics/batches/", data),
  updateBatch: (id, data) => api.patch(`/academics/batches/${id}/`, data),
  
  getEnrollments: (params) => api.get("/academics/enrollments/", { params }),
  createEnrollment: (data) => api.post("/academics/enrollments/", data),
  deleteEnrollment: (id) => api.delete(`/academics/enrollments/${id}/`),
  
  getAttendance: (params) => api.get("/academics/attendance/", { params }),
  recordAttendance: (data) => api.post("/academics/attendance/", data),
  
  getTrainerSummary: () => api.get("/academics/trainer-summary/"),
};

// Assessments
export const assessmentsApi = {
  getAssessments: (params) => api.get("/assessments/assessments/", { params }),
  getAssessmentById: (id) => api.get(`/assessments/assessments/${id}/`),
  createAssessment: (data) => api.post("/assessments/assessments/", data),
  updateAssessment: (id, data) => api.patch(`/assessments/assessments/${id}/`, data),
  submitAssessment: (id, data) => api.post(`/assessments/assessments/${id}/submit/`, data),
  
  createQuestion: (data) => api.post("/assessments/questions/", data),
  
  getSubmissions: (params) => api.get("/assessments/submissions/", { params }),
  getSubmissionById: (id) => api.get(`/assessments/submissions/${id}/`),
  evaluateSubmission: (id, data) => api.post(`/assessments/submissions/${id}/evaluate/`, data),
};

// Skills & Certifications
export const skillsApi = {
  getCategories: () => api.get("/skills/categories/"),
  getSkills: (params) => api.get("/skills/items/", { params }),
  createSkill: (data) => api.post("/skills/items/", data),
  
  getStudentSkills: (params) => api.get("/skills/student-skills/", { params }),
  addStudentSkill: (data) => api.post("/skills/student-skills/", data),
  deleteStudentSkill: (id) => api.delete(`/skills/student-skills/${id}/`),
  verifyStudentSkill: (id) => api.post(`/skills/student-skills/${id}/verify_skill/`),
  
  getCertifications: (params) => api.get("/skills/certifications/", { params }),
  addCertification: (data) => api.post("/skills/certifications/", data),
  deleteCertification: (id) => api.delete(`/skills/certifications/${id}/`),
};

// Projects
export const projectsApi = {
  getProjects: (params) => api.get("/projects/projects/", { params }),
  getProjectById: (id) => api.get(`/projects/projects/${id}/`),
  createProject: (data) => api.post("/projects/projects/", data),
  updateProject: (id, data) => api.patch(`/projects/projects/${id}/`, data),
  deleteProject: (id) => api.delete(`/projects/projects/${id}/`),
  reviewProject: (id, data) => api.post(`/projects/projects/${id}/review/`, data),
};

// Placements
export const placementsApi = {
  getSummary: () => api.get("/placements/summary/"),
  getCompanies: (params) => api.get("/placements/companies/", { params }),
  createCompany: (data) => api.post("/placements/companies/", data),
  updateCompany: (id, data) => api.patch(`/placements/companies/${id}/`, data),
  
  getVacancies: (params) => api.get("/placements/vacancies/", { params }),
  getVacancyById: (id) => api.get(`/placements/vacancies/${id}/`),
  createVacancy: (data) => api.post("/placements/vacancies/", data),
  updateVacancy: (id, data) => api.patch(`/placements/vacancies/${id}/`, data),
  applyVacancy: (id, data) => api.post(`/placements/vacancies/${id}/apply/`, data),
  
  getApplications: (params) => api.get("/placements/applications/", { params }),
  updateApplicationStatus: (id, data) => api.post(`/placements/applications/${id}/update_status/`, data),
  
  getInterviews: (params) => api.get("/placements/interviews/", { params }),
  createInterview: (data) => api.post("/placements/interviews/", data),
  updateInterview: (id, data) => api.patch(`/placements/interviews/${id}/`, data),
  
  getPlacementRecords: (params) => api.get("/placements/records/", { params }),
  createPlacementRecord: (data) => api.post("/placements/records/", data),
};

// Careers & Alumni
export const careersApi = {
  getMilestones: (params) => api.get("/careers/milestones/", { params }),
  createMilestone: (data) => api.post("/careers/milestones/", data),
  
  getEvents: (params) => api.get("/careers/events/", { params }),
  createEvent: (data) => api.post("/careers/events/", data),
  
  getMentorships: (params) => api.get("/careers/mentorship/", { params }),
  requestMentorship: (data) => api.post("/careers/mentorship/", data),
  updateMentorshipStatus: (id, data) => api.post(`/careers/mentorship/${id}/update_status/`, data),
  
  getAlumniDirectory: (params) => api.get("/careers/directory/", { params }),
  getActivationLogs: () => api.get("/careers/activation-logs/"),
};

// Common & Announcements
export const commonApi = {
  getStatus: () => api.get("/status/status/"),
  getAnnouncements: () => api.get("/common/announcements/"),
  createAnnouncement: (data) => api.post("/common/announcements/", data),
  updateAnnouncement: (id, data) => api.patch(`/common/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/common/announcements/${id}/`),
  getNotifications: () => api.get("/common/notifications/"),
  markNotificationRead: (id) => api.post(`/common/notifications/${id}/mark_read/`),
  markAllNotificationsRead: () => api.post("/common/notifications/mark_all_read/"),
};

export default api;
