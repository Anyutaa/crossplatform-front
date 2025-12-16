import { Link } from "react-router-dom";
import { Heart, User, CreditCard, LogOut } from "lucide-react";
import { register, logout } from "../services/authService";
import "../css/Header.css";

export default function Header() {
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  const handleRegistr = () => {
    register();
    window.location.href = "/register";
  };

  return (
    <header className="wonday-header">
      <div className="header-container">
        {/* Логотип */}
        <Link to="/" className="logo-link">
          <svg
            width="42"
            height="43"
            viewBox="0 0 42 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-svg"
          >
            <path
              d="M1.51728 23.166C1.29599 18.6313 3.11073 8.43388 12.1396 3.92107C21.4167 -0.715777 27.06 2.73382 27.06 2.73382M6.82867 35.1113C10.4801 38.9825 20.1066 45.3311 32.0567 38.4294C37.0359 35.1113 44.3388 26.1525 40.3554 14.8709C39.907 13.4798 38.479 10.2328 36.3545 8.37469M19.4252 9.37012C19.4252 9.37012 27.06 7.37926 31.3753 13.02C32.9244 14.9003 35.6906 19.8553 34.3629 24.6334M15.7913 17.8572C18.1149 14.2073 22.2089 14.6497 24.09 15.5346M27.7414 19.1845C28.2725 20.7772 27.9627 22.8344 27.7414 23.8298C26.4136 27.2806 23.0941 28.2539 21.7663 28.1433C21.0966 28.19 19.4252 28.1506 18.0974 27.6197M13.1182 11.6928C10.9797 13.02 9.80454 15.2494 9.48426 16.1982C8.15647 19.1845 7.16062 25.1571 11.4759 30.1342C13.7996 32.4569 17.6502 35.5095 23.758 34.4477C24.7422 34.3838 27.2452 33.924 29.3836 32.5968"
              stroke="#2E2E2E"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="21.5" cy="21.5" r="2" fill="#2E2E2E" />
          </svg>
          <span className="brand-name">WONDAY</span>
        </Link>

        {/* Навигация */}
        <nav className="main-nav">
          <Link to="/profile" className="nav-link">
            Личный кабинет
          </Link>
          <Link to="/bookings" className="nav-link">
            Мои бронирования
          </Link>
          <Link to="/my_rooms" className="nav-link">
            Мои комнаты
          </Link>
        </nav>

        {/* Иконки справа */}
        <div className="actions-container">
          <button aria-label="Избранное" className="icon-button">
            <Heart className="icon" />
          </button>
          <button
            aria-label="Профиль"
            className="profile-button"
            onClick={handleRegistr}
          >
            <User className="icon-small" />
          </button>
          <button aria-label="Платежи" className="icon-button">
            <CreditCard className="icon" />
          </button>
          <button
            aria-label="Выйти"
            className="icon-button"
            onClick={handleLogout}
          >
            <LogOut className="icon" />
          </button>
        </div>
      </div>
    </header>
  );
}
