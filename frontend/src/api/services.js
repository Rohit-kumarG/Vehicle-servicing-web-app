import apiClient from "./client";

export const garageService = {
  getAll: () => apiClient.get("/garages"),
  getById: (id) => apiClient.get(`/garages/${id}`),
  getMyGarage: () => apiClient.get("/garages/owner/my-garage"),
  create: (payload) => apiClient.post("/garages", payload),
  update: (id, payload) => apiClient.put(`/garages/${id}`, payload),
};

export const vehicleService = {
  getAll: () => apiClient.get("/vehicles"),
  create: (payload) => apiClient.post("/vehicles", payload),
  update: (id, payload) => apiClient.put(`/vehicles/${id}`, payload),
  delete: (id) => apiClient.delete(`/vehicles/${id}`),
};

export const bookingService = {
  getMyBookings: () => apiClient.get("/bookings/my-bookings"),
  getGarageBookings: () => apiClient.get("/bookings/garage-bookings"),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  create: (payload) => apiClient.post("/bookings", payload),
  updateStatus: (id, payload) =>
    apiClient.put(`/bookings/${id}/status`, payload),
  cancel: (id) => apiClient.put(`/bookings/${id}/cancel`),
  pay: (id) => apiClient.put(`/bookings/${id}/pay`),
};

export const feedbackService = {
  getGarageReviews: (garageId) => apiClient.get(`/feedback/garage/${garageId}`),
  getMyFeedbacks: () => apiClient.get("/feedback/my-feedbacks"),
  getAllForAdmin: () => apiClient.get("/feedback/admin/all"),
  submit: (payload) => apiClient.post("/feedback", payload),
};

export const notificationService = {
  getAll: () => apiClient.get("/notifications"),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put("/notifications/read-all"),
};

export const adminService = {
  getStats: () => apiClient.get("/admin/stats/public"),
  getUsers: () => apiClient.get("/admin/users"),
  getGarages: () => apiClient.get("/admin/garages"),
  toggleGarageStatus: (id) => apiClient.put(`/admin/garages/${id}/status`),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getBookings: () => apiClient.get("/admin/bookings"),
};
export const authService = {
  register: (payload) => apiClient.post("/auth/register", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (payload) => apiClient.put("/auth/profile", payload),
  forgotPassword: (payload) => apiClient.post("/auth/forgot-password", payload),
  sendOTP: (payload) => apiClient.post("/auth/send-otp", payload),
  resetPassword: (payload) => apiClient.post("/auth/reset-password", payload),
};

export const chatService = {
  getMessages: (bookingId) => apiClient.get(`/chat/${bookingId}`),
  sendMessage: (payload) => apiClient.post("/chat", payload),
};
