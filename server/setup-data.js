const fs = require('fs');
const path = require('path');

// Создаем папку для загрузок, если она не существует
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Создаем файл заглушки по умолчанию
const defaultImagePath = path.join(uploadsDir, 'default.jpg');
if (!fs.existsSync(defaultImagePath)) {
  // Создаем простой текстовый файл с информацией
  fs.writeFileSync(
    defaultImagePath, 
    "This is a placeholder for an image. In a real app, you'd have actual image files here."
  );
  console.log('Default image placeholder created');
}

console.log('Test data setup completed!');