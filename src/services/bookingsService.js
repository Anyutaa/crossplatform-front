import api from "../api/axios";

export async function get_bookings() {
  const response = await api.get("/bookings");
  return response.data;
}
export async function create_bookings(bookingsData) {
  const params = new URLSearchParams({
    roomIds: bookingsData.roomIds.join(","),
    start: bookingsData.startDate,
    end: bookingsData.endDate,
  });

  const response = await api.post(`/bookings?${params.toString()}`);
  return response.data;
}
export async function cancel_booking(bookingId) {
  await api.delete(`/bookings/${bookingId}`);
}
export const restore_room = (bookingId) =>
  api.put(`/bookings/${bookingId}/cancel`, {
    status: 0,
  });
