import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  DollarSign,
  Wrench,
  Check,
  X,
  Info,
  Save,
} from "lucide-react";
import { get_room_by_id, update_room } from "../services/roomService";
import "../css/addRoom.css";

const EditRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [roomData, setRoomData] = useState({
    name: "",
    pricePerDay: "",
    status: 0,
    description: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({
    name: "",
    pricePerDay: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Загрузка данных комнаты при монтировании
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoadingData(true);
        const room = await get_room_by_id(id);

        if (room) {
          setRoomData({
            name: room.name || "",
            pricePerDay: room.pricePerDay?.toString() || "",
            status: room.status || 0,
            description: room.description || "",
          });
          setOriginalData({
            name: room.name || "",
            pricePerDay: room.pricePerDay?.toString() || "",
            status: room.status || 0,
            description: room.description || "",
          });
        } else {
          setServerError("Комната не найдена");
        }
      } catch (error) {
        console.error("Ошибка загрузки данных комнаты:", error);
        setServerError("Не удалось загрузить данные комнаты");
      } finally {
        setLoadingData(false);
      }
    };

    fetchRoomData();
  }, [id]);

  // Проверка изменений
  useEffect(() => {
    const isChanged =
      roomData.name !== originalData.name ||
      roomData.pricePerDay !== originalData.pricePerDay ||
      roomData.status !== originalData.status ||
      roomData.description !== originalData.description;

    setHasChanges(isChanged);
  }, [roomData, originalData]);

  // Обработка изменения полей
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

  // Валидация формы
  const validateRoom = () => {
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

    // Цена
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

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateRoom()) return;

    setLoading(true);

    try {
      // Подготовка данных
      const payload = {
        name: roomData.name.trim(),
        pricePerDay: Number(roomData.pricePerDay),
        status: Number(roomData.status),
        description: roomData.description.trim() || null,
      };

      console.log("Отправка данных для обновления комнаты:", payload);

      const result = await update_room(id, payload);

      console.log("Комната обновлена:", result);
      setSuccess(true);

      setTimeout(() => {
        navigate("/my_rooms");
      }, 1500);
    } catch (error) {
      console.error("Ошибка обновления комнаты:", error);

      let errorMessage = "Не удалось обновить комнату. Попробуйте позже.";

      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Сброс изменений
  const handleReset = () => {
    setRoomData({ ...originalData });
    setErrors({});
    setServerError("");
  };

  // Форматирование цены
  const formatPrice = (price) => {
    if (!price) return "";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Если успех
  if (success) {
    return (
      <div className="create-room-container success-view">
        <div className="success-card">
          <div className="success-icon">
            <Check size={64} />
          </div>
          <h2>Комната успешно обновлена!</h2>
        </div>
      </div>
    );
  }

  // Если загрузка данных
  if (loadingData) {
    return (
      <div className="create-room-container">
        <div className="loading-overlay">
          <div className="loading-spinner-large"></div>
          <p>Загрузка данных комнаты...</p>
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
        {hasChanges && (
          <div className="unsaved-changes-badge">
            Есть несохранённые изменения
          </div>
        )}
      </div>

      <div className="create-room-card">
        {/* Заголовок */}
        <div className="create-room-header">
          <h1>Редактирование комнаты</h1>
          <p className="subtitle">
            Измените информацию о комнате для бронирования
          </p>
          <div className="room-id">
            <span className="id-label">ID комнаты:</span>
            <span className="id-value">{id}</span>
          </div>
        </div>

        {/* Ошибка сервера */}
        {serverError && (
          <div className="server-error">
            <X size={20} />
            <p>{serverError}</p>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="create-room-form">
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
                className={`room-input ${errors.name ? "error" : ""}`}
                maxLength={100}
              />
              <div className="input-hint">
                <Info size={14} />
                <span>Будет отображаться в поиске и бронированиях</span>
              </div>
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
                    {formatPrice(roomData.pricePerDay * 7)} за неделю
                  </span>
                </div>
              )}
              {errors.pricePerDay && (
                <div className="error-message">{errors.pricePerDay}</div>
              )}
            </div>
          </div>

          {/* Статус */}
          <div className="room-section">
            <label className="section-label">
              <Wrench size={20} />
              <span>Статус комнаты</span>
            </label>
            <div className="input-group">
              <div className="status-selector">
                <select
                  name="status"
                  value={roomData.status}
                  onChange={handleChange}
                  className="status-select"
                >
                  <option value="0">Доступна</option>
                  <option value="1">На обслуживании</option>
                </select>
                <div className="status-hint">
                  {roomData.status == 0 && (
                    <>
                      <Check size={14} className="status-icon available" />
                      <span>Комната доступна для бронирования</span>
                    </>
                  )}
                  {roomData.status == 1 && (
                    <>
                      <Wrench size={14} className="status-icon maintenance" />
                      <span>Комната на техническом обслуживании</span>
                    </>
                  )}
                </div>
              </div>
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

            <div className="edit-action-buttons">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="reset-btn"
                  disabled={loading}
                >
                  <X size={18} />
                  Сбросить изменения
                </button>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !hasChanges}
              >
                {loading ? (
                  <span className="loading-spinner">
                    <span className="spinner"></span>
                    Сохранение...
                  </span>
                ) : (
                  <>
                    <Save size={20} />
                    Сохранить изменения
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
