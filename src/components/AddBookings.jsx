import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { create_bookings } from "../services/bookingsService";
import "../css/AddBookings.css";

const AddBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialRoomId = searchParams.get("roomId");

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookingDates, setBookingDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);

  // Загружаем комнаты и добавляем комнату из URL
  useEffect(() => {
    const loadRooms = () => {
      try {
        const savedRooms = localStorage.getItem("availableRooms");
        if (savedRooms) {
          const rooms = JSON.parse(savedRooms);
          setAvailableRooms(rooms);

          // Добавляем комнату из URL если есть
          if (initialRoomId) {
            const roomId = parseInt(initialRoomId);
            const roomToAdd = rooms.find((room) => room.id === roomId);
            if (roomToAdd) {
              setSelectedRooms([roomToAdd]);
            }
          }
        }
      } catch (err) {
        console.error("Ошибка при загрузке комнат:", err);
      }
    };

    loadRooms();
  }, [initialRoomId]);

  // Пересчитываем стоимость
  useEffect(() => {
    if (
      !bookingDates.startDate ||
      !bookingDates.endDate ||
      selectedRooms.length === 0
    ) {
      setTotalPrice(0);
      setNights(0);
      return;
    }

    const start = new Date(bookingDates.startDate);
    const end = new Date(bookingDates.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setTotalPrice(0);
      setNights(0);
      return;
    }

    setNights(diffDays);

    const total = selectedRooms.reduce((sum, room) => {
      return sum + (room.pricePerDay || 0) * diffDays;
    }, 0);

    setTotalPrice(total);
  }, [selectedRooms, bookingDates]);

  const handleRoomSelect = (room) => {
    const isSelected = selectedRooms.some((r) => r.id === room.id);

    if (isSelected) {
      setSelectedRooms((prev) => prev.filter((r) => r.id !== room.id));
    } else {
      setSelectedRooms((prev) => [...prev, room]);
    }
  };

  const handleDateChange = (e, type) => {
    const value = e.target.value;
    setBookingDates((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRooms.length === 0) {
      setError("Выберите хотя бы одну комнату");
      return;
    }

    if (!bookingDates.startDate || !bookingDates.endDate) {
      setError("Укажите даты бронирования");
      return;
    }

    if (nights <= 0) {
      setError("Дата окончания должна быть позже даты начала");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Подготавливаем данные для API
      const bookingsData = {
        roomIds: selectedRooms.map((room) => room.id),
        startDate: bookingDates.startDate,
        endDate: bookingDates.endDate,
      };

      console.log("Отправка данных:", bookingsData);

      // Используем вашу функцию API
      const result = await create_bookings(bookingsData);

      console.log("Ответ сервера:", result);

      // Предполагаем, что сервер возвращает успешный результат
      setSuccess(true);

      // Через 2 секунды перенаправляем
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
    } catch (err) {
      console.error("Полная ошибка бронирования:", err);

      // Проверяем, что возвращает сервер
      if (err.response) {
        console.error("Ответ сервера (raw):", err.response);

        // Если сервер вернул HTML вместо JSON
        const contentType = err.response.headers["content-type"];
        if (contentType && contentType.includes("text/html")) {
          setError("Сервер вернул HTML вместо JSON. Проверьте URL API.");
        } else {
          // Пробуем получить текст ошибки
          try {
            const errorData =
              typeof err.response.data === "string"
                ? JSON.parse(err.response.data)
                : err.response.data;
            setError(errorData.error || errorData.message || "Ошибка сервера");
          } catch (parseError) {
            // Если не удалось распарсить JSON
            setError(
              `Ошибка сервера: ${err.response.status} ${err.response.statusText}`
            );
          }
        }
      } else if (err.request) {
        // Запрос был сделан, но ответ не получен
        setError(
          "Нет ответа от сервера. Проверьте подключение к интернету и URL."
        );
      } else {
        // Ошибка при настройке запроса
        setError(`Ошибка при настройке запроса: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinEndDate = () => {
    if (!bookingDates.startDate) return "";
    const start = new Date(bookingDates.startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split("T")[0];
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const removeRoom = (roomId) => {
    setSelectedRooms((prev) => prev.filter((room) => room.id !== roomId));
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h1>Бронирование комнат</h1>
        <p>Выберите комнаты и укажите даты проживания</p>
      </div>

      {success ? (
        <div className="success-message">
          <h2>✅ Бронирование успешно создано!</h2>
          <p>Вы будете перенаправлены на страницу бронирований...</p>
        </div>
      ) : (
        <div className="booking-content">
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="date-section">
              <h3>Даты проживания</h3>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="startDate">Заезд</label>
                  <input
                    type="date"
                    id="startDate"
                    value={bookingDates.startDate}
                    onChange={(e) => handleDateChange(e, "startDate")}
                    min={getTodayDate()}
                    required
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="endDate">Выезд</label>
                  <input
                    type="date"
                    id="endDate"
                    value={bookingDates.endDate}
                    onChange={(e) => handleDateChange(e, "endDate")}
                    min={getMinEndDate()}
                    disabled={!bookingDates.startDate}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rooms-section">
              <h3>Выберите комнаты</h3>
              <p className="selection-info">
                Выбрано: {selectedRooms.length} комнат
              </p>

              {selectedRooms.length > 0 && (
                <div className="selected-rooms-preview">
                  <h4>Вы выбрали:</h4>
                  <div className="selected-rooms-list">
                    {selectedRooms.map((room) => (
                      <div key={room.id} className="selected-room-item">
                        <span>
                          {room.name} - {room.pricePerDay} ₽/сутки
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRoom(room.id)}
                          className="remove-room-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rooms-grid">
                {availableRooms.map((room) => {
                  const isSelected = selectedRooms.some(
                    (r) => r.id === room.id
                  );
                  return (
                    <div
                      key={room.id}
                      className={`room-select-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="room-select-header">
                        <h4>{room.name}</h4>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="room-checkbox"
                        />
                      </div>
                      <p className="room-price">{room.pricePerDay} ₽ / сутки</p>
                      <p className="room-description">
                        {room.description || "Уютная комната"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="summary-section">
              <h3>Сводка бронирования</h3>

              {selectedRooms.length > 0 && (
                <div className="selected-rooms-summary">
                  <h4>Выбранные комнаты ({selectedRooms.length}):</h4>
                  <ul>
                    {selectedRooms.map((room) => (
                      <li key={room.id}>
                        <span>{room.name}</span>
                        <span>{room.pricePerDay} ₽/сутки</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {bookingDates.startDate && bookingDates.endDate && nights > 0 && (
                <div className="dates-info">
                  <h4>Период проживания:</h4>
                  <p>
                    {new Date(bookingDates.startDate).toLocaleDateString(
                      "ru-RU"
                    )}{" "}
                    -{" "}
                    {new Date(bookingDates.endDate).toLocaleDateString("ru-RU")}
                    <br />
                    <span className="nights">({nights} ночей)</span>
                  </p>
                </div>
              )}

              {totalPrice > 0 && (
                <div className="price-summary">
                  <div className="price-total">
                    <strong>Итого к оплате:</strong>
                    <strong>{totalPrice.toLocaleString()} ₽</strong>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                className="submit-btn"
                disabled={
                  loading ||
                  selectedRooms.length === 0 ||
                  !bookingDates.startDate ||
                  !bookingDates.endDate ||
                  nights <= 0
                }
              >
                {loading ? "Создание бронирования..." : "Забронировать"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddBookings;
