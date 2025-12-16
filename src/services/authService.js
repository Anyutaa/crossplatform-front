import api from "../api/axios";

export async function register(email, name, password) {
  console.log("Отправляем данные на backend:", { email, name, password });
  const response = await api.post("/auth/register", { email, name, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
}
export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
}
export function logout() {
  localStorage.removeItem("token");
}
