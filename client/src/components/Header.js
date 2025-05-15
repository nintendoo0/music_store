import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Музыкальный магазин</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">Главная</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/recordings">Каталог записей</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/stores">Магазины</NavLink>
              </li>
              
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="analysisDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Аналитика
                </a>
                <ul className="dropdown-menu" aria-labelledby="analysisDropdown">
                  <li><Link className="dropdown-item" to="/bestsellers">Самые продаваемые записи</Link></li>
                  <li><Link className="dropdown-item" to="/bestartist">Лучший исполнитель</Link></li>
                  <li><Link className="dropdown-item" to="/max-margin">Максимальная маржа</Link></li>
                </ul>
              </li>
            </ul>
            <Link to="/add-recording" className="btn btn-outline-light">Добавить запись</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;