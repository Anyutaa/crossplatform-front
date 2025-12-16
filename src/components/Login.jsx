import React, { useState } from "react";
import "../css/Login.css";
import { login } from "../services/authService";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    let isValid = true;
    // Email
    if (!formData.email) {
      newErrors.email = "Email обязателен";
      isValid = false;
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (validateForm()) {
      try {
        const result = await login(formData.email, formData.password);
        console.log("Вы успешло зашли:", result);
        alert("Вход успешен!");
      } catch (err) {
        console.error(err);
        setServerError(err.response?.data?.error || "Ошибка сервера");
      }
    }
  };
  return (
    <div className="login-container">
      <main className="login-form-container">
        <h1 className="login-title">Авторизация</h1>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <button type="login" className="login-button">
            Войти
          </button>
          <p className="login-register-link">
            <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Login;
