import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🎵 Музыкальный магазин
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/catalog">
                Каталог записей
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stores">
                Магазины
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                Корзина
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/groups/manage">
                Группы
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;