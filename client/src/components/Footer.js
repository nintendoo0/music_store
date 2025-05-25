import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем футер с задержкой для анимации
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <footer className={`footer ${isVisible ? 'visible' : ''}`}>
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Музыкальный магазин. Все права защищены.</p>
        <p>
          <a href="/about">О нас</a> | <a href="/contact">Контакты</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;