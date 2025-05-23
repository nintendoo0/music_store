import React from 'react';
import { 
  BrowserRouter as Router, 
  Route, 
  Routes 
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Компоненты навигации
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Страницы
import Home from './pages/Home';
import RecordingList from './pages/RecordingList';
import RecordingDetails from './pages/RecordingDetails';
import EditRecording from './pages/EditRecording';
import AddRecording from './pages/AddRecording';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import Forbidden from './pages/Forbidden';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Админ-страницы
import AdminDashboard from './pages/admin/Dashboard'; 
import UserManagement from './pages/admin/UserManagement';
import AdminReports from './pages/AdminReports';

// Магазины
import StoreList from './pages/StoreList';
import StoreDetails from './pages/StoreDetails';
import AddStore from './pages/AddStore';
import CatalogList from './pages/CatalogList';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import OrderList from './pages/OrderList';
import BestSellers from './pages/BestSellers';
import BestsellingArtists from './pages/BestsellingArtists';
import OutOfStock from './pages/OutOfStock';
import MaxMargin from './pages/MaxMargin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navigation />
          <main className="container flex-grow-1 py-4">
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/" element={<Home />} />
              <Route path="/recordings" element={<RecordingList />} />
              <Route path="/recordings/bestsellers" element={<BestSellers />} />
              <Route path="/recordings/:id" element={<RecordingDetails />} />
              <Route path="/catalog" element={<CatalogList />} />
              
              {/* Маршруты для магазинов */}
              <Route path="/stores" element={<StoreList />} />
              <Route path="/stores/:id" element={<StoreDetails />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Защищенные маршруты только для администраторов */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/recordings/add" element={<AddRecording />} />
                <Route path="/recordings/edit/:id" element={<EditRecording />} />
                <Route path="/stores/add" element={<AddStore />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
              
              <Route path="/forbidden" element={<Forbidden />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/artists/bestselling" element={<BestsellingArtists />} />
              <Route path="/out-of-stock" element={<OutOfStock />} />
              <Route path="/analysis/max-margin" element={<MaxMargin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;