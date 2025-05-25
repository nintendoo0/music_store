import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navigation = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Музыкальный магазин
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
              <NavLink className="nav-link" to="/recordings">
                Каталог записей
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/catalog">
                Каталог произведений
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/stores">
                Магазины
              </NavLink>
            </li>
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link"
                id="navbarAnalytics"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ 
                  background: 'transparent', 
                  border: 'none',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem'
                }}
              >
                Аналитика
              </button>
              <ul className="dropdown-menu" aria-labelledby="navbarAnalytics">
                <li>
                  <Link className="dropdown-item" to="/recordings/bestsellers">
                    Бестселлеры
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/artists/bestselling">
                    Лучшие исполнители
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/analysis/max-margin">
                    Анализ маржи
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
          
          <div className="d-flex align-items-center">
            {currentUser ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {currentUser.username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>Мой профиль
                    </Link>
                  </li>
                  {isAdmin() && (
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        <i className="bi bi-gear me-2"></i>Панель администратора
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Выйти
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <Link to="/login" className="btn btn-outline-light me-2">
                  Войти
                </Link>
                <Link to="/register" className="btn btn-light">
                  Регистрация
                </Link>
              </div>
            )}
            
            {currentUser && (
              <Link to="/recordings/add" className="btn btn-success ms-3">
                <i className="bi bi-plus-lg"></i> Добавить запись
              </Link>
            )}

            {currentUser && (
            <Link to="/cart" className="btn btn-outline-light position-relative ms-3">
              <i className="bi bi-cart"></i>
              {cart.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
              Корзина
            </Link>
            )}

            {currentUser && (
            <Link to="/groups/manage" className="btn btn-outline-primary position-relative ms-3">
              Группы
            </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;