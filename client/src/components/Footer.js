import React from 'react';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-dark text-white">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Музыкальный магазин</h5>
            <p>Лучший выбор музыкальных записей</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p>&copy; {new Date().getFullYear()} Музыкальный магазин. Все права защищены</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;