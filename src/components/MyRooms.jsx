import React from "react";
import { useNavigate } from "react-router-dom";
import RoomsList from "../components/RoomsList";
import { get_rooms } from "../services/roomService";
export default function MyRooms() {
  const navigate = useNavigate();

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    padding: "20px 0",
    borderBottom: "1px solid #e0e0e0",
  };

  const buttonStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", color: "#333" }}>
            Мои комнаты
          </h1>
          <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "1rem" }}>
            Управление вашими объектами
          </p>
        </div>
        <button
          onClick={() => navigate("/create-room")}
          style={buttonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          + Создать комнату
        </button>
      </div>

      <RoomsList
        fetchFunction={get_rooms}
        emptyTitle="Нет комнат"
        emptyText="Добавьте комнату, чтобы начать сдавать жильё."
        showOwnerActions={true}
        showFilters={false}
      />
    </div>
  );
}
