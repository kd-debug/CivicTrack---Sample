import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import { MyReportsPage } from './pages/MyReportsPage';
import AdminDashboard from './pages/AdminDashboard';
import UserProfilePage from './pages/UserProfilePage';
import NotificationToast from './components/NotificationToast';
import './App.css';
import TotalReportsPage from './pages/TotalReportsPage';
const AppContent = () => {
  const { state } = useApp();
  const { currentPage } = state;

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'my-reports':
        return <MyReportsPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'profile':
        return <UserProfilePage />;
      case 'total-reports':
        return <TotalReportsPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
      <Sidebar />
      <NotificationToast />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
