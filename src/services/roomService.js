import api from "../api/axios";

export async function get_rooms() {
  const response = await api.get("/rooms");
  return response.data;
}
export const get_room_by_id = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};
export async function get_available_room() {
  const response = await api.get("/rooms/available");
  return response.data;
}

export async function create_room(roomData) {
  const response = await api.post("/rooms", roomData);
  return response.data;
}
export const update_room = async (roomId, data) => {
  const response = await api.patch(`/rooms/${roomId}`, data);
  return response.data;
};
export async function delete_room(roomId) {
  await api.delete(`/rooms/${roomId}`);
}
export const restore_room = (roomId) =>
  api.patch(`/rooms/${roomId}`, {
    status: 0,
  });
