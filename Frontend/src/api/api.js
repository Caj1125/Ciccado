import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginRequest(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getMeRequest() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function changePasswordRequest(payload) {
  const { data } = await api.put("/auth/change-password", payload);
  return data;
}

export async function getBugsRequest(params) {
  const { data } = await api.get("/bugs", { params });
  return data;
}

export async function getBugByIdRequest(id) {
  const { data } = await api.get(`/bugs/${id}`);
  return data;
}

export async function createBugRequest(payload) {
  const { data } = await api.post("/bugs", payload);
  return data;
}

export async function updateBugRequest(id, payload) {
  const { data } = await api.put(`/bugs/${id}`, payload);
  return data;
}

export async function changeBugStatusRequest(id, status) {
  const { data } = await api.patch(`/bugs/${id}/status`, { status });
  return data;
}

export async function assignBugRequest(id, assignedTo) {
  const { data } = await api.patch(`/bugs/${id}/assign`, { assignedTo });
  return data;
}

export async function addCommentRequest(id, text) {
  const { data } = await api.post(`/bugs/${id}/comments`, { text });
  return data;
}

export async function deleteBugRequest(id) {
  const { data } = await api.delete(`/bugs/${id}`);
  return data;
}

export async function getProjectsRequest() {
  const { data } = await api.get("/projects");
  return data;
}

export async function createProjectRequest(payload) {
  const { data } = await api.post("/projects", payload);
  return data;
}

export async function getProjectByIdRequest(id) {
  const { data } = await api.get(`/projects/${id}`);
  return data;
}

export async function getDevelopersRequest() {
  const { data } = await api.get("/users/developers");
  return data;
}

export async function getUsersRequest() {
  const { data } = await api.get("/users");
  return data;
}

// ---- Subtasks ----

export async function createSubtaskRequest(payload) {
  const { data } = await api.post("/subtasks", payload);
  return data;
}

export async function getSubtasksByBugIdRequest(bugId) {
  const { data } = await api.get(`/subtasks/${bugId}`);
  return data;
}

export async function updateSubtaskRequest(id, payload) {
  const { data } = await api.put(`/subtasks/${id}`, payload);
  return data;
}

export async function updateSubtaskStatusRequest(id, status) {
  const { data } = await api.patch(`/subtasks/${id}/status`, { status });
  return data;
}

export async function deleteSubtaskRequest(id) {
  const { data } = await api.delete(`/subtasks/${id}`);
  return data;
}

export default api;
