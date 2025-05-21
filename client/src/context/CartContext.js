import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find(i => i.recordingId === item.recordingId);
      if (exists) {
        return prev.map(i =>
          i.recordingId === item.recordingId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (recordingId) => {
    setCart((prev) => prev.filter(i => i.recordingId !== recordingId));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (recordingId, quantity) => {
    setCart((prev) =>
      prev.map(i =>
        i.recordingId === recordingId ? { ...i, quantity } : i
      )
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};