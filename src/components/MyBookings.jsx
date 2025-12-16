import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { get_bookings, cancel_booking } from "../services/bookingsService";
import {
  Calendar,
  User,
  Home,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquare,
} from "lucide-react";
import "../css/MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await get_bookings();
        console.log("Полученные брони:", data);
        setBookings(data);
      } catch (error) {
        console.error("Ошибка загрузки броней:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const BOOKING_STATUS = {
    PENDING: 0,
    CONFIRMED: 1,
    CANCELLED: 2,
    COMPLETED: 3,
  };

  const STATUS_INFO = {
    [BOOKING_STATUS.PENDING]: {
      text: "Ожидает подтверждения",
      color: "#FF9800",
      icon: <Clock size={16} />,
    },
    [BOOKING_STATUS.CONFIRMED]: {
      text: "Подтверждено",
      color: "#4CAF50",
      icon: <CheckCircle size={16} />,
    },
    [BOOKING_STATUS.CANCELLED]: {
      text: "Отменено",
      color: "#F44336",
      icon: <XCircle size={16} />,
    },
    [BOOKING_STATUS.COMPLETED]: {
      text: "Завершено",
      color: "#2196F3",
      icon: <CheckCircle size={16} />,
    },
  };

  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Вы уверены, что хотите отменить это бронирование?")) {
      try {
        await cancel_booking(bookingId);
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: BOOKING_STATUS.CANCELLED }
              : booking
          )
        );
        alert("Бронирование успешно отменено");
      } catch (error) {
        console.error("Ошибка отмены бронирования:", error);
        alert("Не удалось отменить бронирование");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Неверная дата";
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка бронирований...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <div>
          <h1>Мои бронирования</h1>
          <p className="subtitle">
            Управляйте своими бронированиями и поездками
          </p>
        </div>
        <div className="header-actions">
          <Link to="/rooms" className="browse-rooms-btn">
            <Home size={20} /> Найти комнаты
          </Link>
        </div>
      </div>

      <div className="bookings-content">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h3>Нет бронирований</h3>
            <Link to="/rooms" className="empty-action-btn">
              Найти комнаты
            </Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div
                  className="booking-summary"
                  onClick={() => toggleBookingDetails(booking.id)}
                >
                  <div className="booking-header">
                    <div className="booking-title">
                      <h3>
                        {booking.rooms?.map((room) => (
                          <div key={room.roomId}>{room.roomName}</div>
                        ))}
                      </h3>
                    </div>
                    <div className="booking-status">
                      <div
                        className="status-badge"
                        style={{
                          backgroundColor: `${
                            STATUS_INFO[booking.status]?.color
                          }20`,
                          color: STATUS_INFO[booking.status]?.color,
                        }}
                      >
                        {STATUS_INFO[booking.status]?.icon}
                        <span>{STATUS_INFO[booking.status]?.text}</span>
                      </div>
                      <button className="expand-btn">
                        {expandedBooking === booking.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="booking-details-grid">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <div className="detail-content">
                        <span className="detail-label">Даты проживания:</span>
                        <span className="detail-value">
                          {formatDate(booking.startDate)} –{" "}
                          {formatDate(booking.endDate)}
                        </span>
                        <span className="detail-hint">{booking.duration}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <User size={16} />
                      <div className="detail-content">
                        <span className="detail-label">Гостей:</span>
                        <span className="detail-value">3 чел.</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <DollarSign size={16} />
                      <div className="detail-content">
                        <span className="detail-label">Стоимость:</span>
                        <span className="detail-value price">
                          {formatPrice(booking.totalPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <div className="detail-content">
                        <span className="detail-label">Забронировано:</span>
                        <span className="detail-value">
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedBooking === booking.id && (
                  <div className="booking-details">
                    <div className="details-grid">
                      <div className="details-section">
                        <h4>Контакты владельца</h4>
                        <div className="info-item">
                          <span className="info-label">Имя:</span>
                          <span className="info-value">
                            Анастасия Владимировна
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Телефон:</span>
                          <span className="info-value">+7 960 556 65 56</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-actions">
                      {/* Ссылка на конкретную первую комнату */}
                      {booking.rooms?.[0] && (
                        <Link
                          to={`/my_rooms/${booking.rooms[0].roomId}`}
                          className="action-btn"
                        >
                          <Eye size={18} /> Посмотреть комнату
                        </Link>
                      )}

                      <button className="action-btn">
                        <MessageSquare size={18} /> Написать владельцу
                      </button>

                      {(booking.status === BOOKING_STATUS.CONFIRMED ||
                        booking.status === BOOKING_STATUS.PENDING) && (
                        <button
                          className="action-btn cancel"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle size={18} /> Отменить бронирование
                        </button>
                      )}

                      {booking.status === BOOKING_STATUS.COMPLETED && (
                        <Link className="action-btn review">
                          <Star size={18} /> Оставить отзыв
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
