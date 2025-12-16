import RoomsList from "../components/RoomsList";
import { get_available_room } from "../services/roomService";

export default function AvailableRooms() {
  return (
    <RoomsList
      title="Комнаты"
      subtitle="Все доступные комнаты"
      fetchFunction={get_available_room}
      emptyTitle="Нет комнат"
      emptyText="Попробуйте изменить фильтры"
      showFilters={true}
    />
  );
}
