import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Компоненты навигации
import Header from './components/Header';
import Footer from './components/Footer';

// Страницы
import Home from './pages/Home';
import RecordingList from './pages/RecordingList';
import RecordingDetails from './pages/RecordingDetails';
import RecordingsByGenre from './pages/RecordingsByGenre';
import BestSellers from './pages/BestSellers';
import BestArtist from './pages/BestArtist';
import StoreList from './pages/StoreList';
import StoreDetails from './pages/StoreDetails';
import OutOfStock from './pages/OutOfStock';
import TotalSales from './pages/TotalSales';
import MaxMargin from './pages/MaxMargin';
import AddRecording from './pages/AddRecording';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recordings" element={<RecordingList />} />
            <Route path="/recordings/:id" element={<RecordingDetails />} />
            <Route path="/recordings/genre/:genre" element={<RecordingsByGenre />} />
            <Route path="/bestsellers" element={<BestSellers />} />
            <Route path="/bestartist" element={<BestArtist />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/stores/:id" element={<StoreDetails />} />
            <Route path="/stores/:id/out-of-stock" element={<OutOfStock />} />
            <Route path="/stores/:id/total-sales" element={<TotalSales />} />
            <Route path="/max-margin" element={<MaxMargin />} />
            <Route path="/add-recording" element={<AddRecording />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;