import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/RoomsList.css";
import { restore_room, delete_room } from "../services/roomService";

/* ====== UI ====== */
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ROOM_STATUS = {
  AVAILABLE: 0,
  MAINTENANCE: 1,
  BLOCKED: 2,
  ARCHIVED: 3,
};

const STATUS_MAP = {
  [ROOM_STATUS.AVAILABLE]: {
    text: "Доступна",
    className: "status-available",
  },
  [ROOM_STATUS.MAINTENANCE]: {
    text: "На обслуживании",
    className: "status-maintenance",
  },
  [ROOM_STATUS.BLOCKED]: {
    text: "Заблокирована",
    className: "status-blocked",
  },
  [ROOM_STATUS.ARCHIVED]: {
    text: "В архиве",
    className: "status-archived",
  },
};

const getStatusInfo = (status) =>
  STATUS_MAP[status] || {
    text: "Неизвестно",
    className: "status-unknown",
  };

const RoomsList = ({
  title,
  subtitle,
  fetchFunction,
  emptyTitle,
  emptyText,
  showOwnerActions = false,
  showFilters = false,
}) => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({
    min: "",
    max: "",
  });

  const handleDeleteRoom = async (roomId) => {
    try {
      await delete_room(roomId);

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, status: ROOM_STATUS.ARCHIVED } : room
        )
      );
    } catch (error) {
      console.error("Ошибка при удалении комнаты", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchFunction();
        setRooms(data);

        localStorage.setItem("availableRooms", JSON.stringify(data));

        data.forEach((room) => {
          localStorage.setItem(`room_${room.id}`, JSON.stringify(room));
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchFunction]);

  const filtered = rooms.filter((room) => {
    const matchesSearch = (room.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const price = room.pricePerDay || 0;
    const matchesMinPrice =
      priceFilter.min === "" || price >= Number(priceFilter.min);
    const matchesMaxPrice =
      priceFilter.max === "" || price <= Number(priceFilter.max);

    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });
  const handleRestoreRoom = async (roomId) => {
    try {
      await restore_room(roomId);

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, status: ROOM_STATUS.AVAILABLE } : room
        )
      );
    } catch (error) {
      console.error("Ошибка при разархивации комнаты", error);
    }
  };
  const handlePriceFilterChange = (e, type) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setPriceFilter((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  };

  const clearPriceFilters = () => {
    setPriceFilter({ min: "", max: "" });
  };

  const handleBookRoom = (roomId) => {
    navigate(`/add-booking?roomId=${roomId}`);
  };

  const minPrice =
    rooms.length > 0 ? Math.min(...rooms.map((r) => r.pricePerDay || 0)) : 0;
  const maxPrice =
    rooms.length > 0 ? Math.max(...rooms.map((r) => r.pricePerDay || 0)) : 0;

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="my-rooms-container">
      <div className="rooms-header">
        <div>
          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>

      {showFilters && (
        <>
          <div className="rooms-toolbar">
            <div className="search-section">
              <div className="search-input-wrapper">
                <div className="search-icon">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по названию комнаты..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filters-section">
              <div className="price-filter">
                <h3>Фильтр по цене</h3>
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label htmlFor="min-price">От</label>
                    <input
                      id="min-price"
                      type="text"
                      placeholder={`Мин: ${minPrice} ₽`}
                      value={priceFilter.min}
                      onChange={(e) => handlePriceFilterChange(e, "min")}
                      className="price-input"
                    />
                    <span className="currency">₽</span>
                  </div>

                  <div className="price-input-group">
                    <label htmlFor="max-price">До</label>
                    <input
                      id="max-price"
                      type="text"
                      placeholder={`Макс: ${maxPrice} ₽`}
                      value={priceFilter.max}
                      onChange={(e) => handlePriceFilterChange(e, "max")}
                      className="price-input"
                    />
                    <span className="currency">₽</span>
                  </div>

                  <button
                    onClick={clearPriceFilters}
                    className="clear-filters-btn"
                    disabled={!priceFilter.min && !priceFilter.max}
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="filter-info">
            {priceFilter.min && (
              <span className="filter-tag">От {priceFilter.min} ₽</span>
            )}
            {priceFilter.max && (
              <span className="filter-tag">До {priceFilter.max} ₽</span>
            )}
            {(priceFilter.min || priceFilter.max) && (
              <span className="filter-count">
                Найдено: {filtered.length} из {rooms.length}
              </span>
            )}
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyText}</p>
          {(priceFilter.min || priceFilter.max || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setPriceFilter({ min: "", max: "" });
              }}
              className="reset-filters-btn"
            >
              Сбросить все фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="rooms-grid">
          {filtered.map((room) => {
            const statusInfo = getStatusInfo(room.status);

            return (
              <div className="room-card" key={room.id}>
                <div className="room-card-header">
                  <h3>{room.name}</h3>
                  <span className={`room-status ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>

                <p className="room-price">
                  Цена: <strong>{room.pricePerDay} ₽</strong> / сутки
                </p>

                <div className="room-details">
                  {room.capacity && (
                    <span className="room-detail">👥 {room.capacity} чел.</span>
                  )}
                  {room.area && (
                    <span className="room-detail">📐 {room.area} м²</span>
                  )}
                  {room.description && (
                    <p className="room-description">{room.description}</p>
                  )}
                </div>

                {showOwnerActions ? (
                  <div className="room-actions">
                    {room.status === ROOM_STATUS.ARCHIVED ? (
                      <button onClick={() => handleRestoreRoom(room.id)}>
                        Разархивировать
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/edit-room/${room.id}`)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          В архив
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="room-actions">
                    <button
                      onClick={() => handleBookRoom(room.id)}
                      disabled={room.status !== ROOM_STATUS.AVAILABLE}
                    >
                      {room.status === ROOM_STATUS.AVAILABLE
                        ? "Забронировать"
                        : "Недоступно"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsList;
