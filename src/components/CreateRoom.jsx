import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, DollarSign, Check, X, Info } from "lucide-react";
import { create_room } from "../services/roomService";
import "../css/addRoom.css";

const CreateRoom = () => {
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState({
    name: "",
    pricePerDay: "",
    status: 0,
    description: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    pricePerDay: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setServerError("");
  };

  const validateroom = () => {
    const newErrors = {};
    let isValid = true;

    // Название комнаты
    if (!roomData.name.trim()) {
      newErrors.name = "Название комнаты обязательно";
      isValid = false;
    } else if (roomData.name.trim().length < 3) {
      newErrors.name = "Название должно содержать минимум 3 символа";
      isValid = false;
    }

    if (!roomData.pricePerDay) {
      newErrors.pricePerDay = "Цена обязательна";
      isValid = false;
    } else if (
      isNaN(roomData.pricePerDay) ||
      Number(roomData.pricePerDay) <= 0
    ) {
      newErrors.pricePerDay = "Введите корректную цену (больше 0)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateroom()) return;

    setLoading(true);

    try {
      const payload = {
        name: roomData.name.trim(),
        pricePerDay: Number(roomData.pricePerDay),
        status: Number(roomData.status),
        description: roomData.description.trim() || null,
      };

      console.log("Отправка данных комнаты:", payload);

      const result = await create_room(payload);

      console.log("Комната создана:", result);
      setSuccess(true);

      setTimeout(() => {
        navigate("/my_rooms");
      }, 1500);
    } catch (error) {
      console.error("Ошибка создания комнаты:", error);

      let errorMessage = "Не удалось создать комнату. Попробуйте позже.";

      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Форматирование цены
  const roomatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (success) {
    return (
      <div className="create-room-container success-view">
        <div className="success-card">
          <div className="success-icon">
            <Check size={64} />
          </div>
          <h2>Комната успешно создана!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="create-room-container">
      <div className="breadcrumbs">
        <button onClick={() => navigate("/my_rooms")} className="back-btn">
          <ArrowLeft size={20} />
          Назад к моим комнатам
        </button>
      </div>

      <div className="create-room-card">
        <div className="create-room-header">
          <h1>Добавить новую комнату</h1>
          <p className="subtitle">
            Заполните информацию о комнате для бронирования
          </p>
        </div>

        {serverError && (
          <div className="server-error">
            <X size={20} />
            <p>{serverError}</p>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="create-room-room">
          {/* Название комнаты */}
          <div className="room-section">
            <label className="section-label">
              <Home size={20} />
              <span>Название комнаты</span>
            </label>
            <div className="input-group">
              <input
                type="text"
                name="name"
                value={roomData.name}
                onChange={handleChange}
                placeholder="Например: Люкс номер 301, Стандарт 202..."
                className={`room-input ${errors.name ? "error" : ""}`}
                maxLength={100}
              />
              {errors.name && (
                <div className="error-message">{errors.name}</div>
              )}
            </div>
          </div>

          {/* Цена */}
          <div className="room-section">
            <label className="section-label">
              <DollarSign size={20} />
              <span>Стоимость за день</span>
            </label>
            <div className="input-group">
              <div className="price-input-wrapper">
                <input
                  type="number"
                  name="pricePerDay"
                  value={roomData.pricePerDay}
                  onChange={handleChange}
                  placeholder="Введите сумму"
                  className={`room-input price-input ${
                    errors.pricePerDay ? "error" : ""
                  }`}
                  min="1"
                  step="1"
                />
                <span className="price-suffix">₽ / день</span>
              </div>
              {roomData.pricePerDay && !errors.pricePerDay && (
                <div className="price-preview">
                  <span className="preview-label">Примерная стоимость:</span>
                  <span className="preview-value">
                    {roomatPrice(roomData.pricePerDay * 7)} за неделю
                  </span>
                </div>
              )}
              {errors.pricePerDay && (
                <div className="error-message">{errors.pricePerDay}</div>
              )}
            </div>
          </div>

          {/* Описание */}
          <div className="room-section">
            <label className="section-label">
              <span>Дополнительная информация</span>
            </label>
            <div className="input-group">
              <textarea
                name="description"
                value={roomData.description}
                onChange={handleChange}
                placeholder="Опишите особенности комнаты, удобства, площадь и т.д."
                className="room-textarea"
                rows="4"
                maxLength={500}
              />
              <div className="textarea-counter">
                <span>{roomData.description.length}</span>
                <span>/ 500 символов</span>
              </div>
            </div>
          </div>
          {/* Кнопки действий */}
          <div className="room-actions">
            <button
              type="button"
              onClick={() => navigate("/my_rooms")}
              className="cancel-btn"
              disabled={loading}
            >
              Отмена
            </button>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Создание...
                </span>
              ) : (
                <>
                  <Check size={20} />
                  Создать комнату
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
