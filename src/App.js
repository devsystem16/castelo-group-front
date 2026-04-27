import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Affiliates from './pages/Affiliates';
import Contact from './pages/Contact';
import Offices from './pages/Offices';
import MyAccount from './pages/MyAccount';
import Admin from './pages/Admin';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function Layout({ children, noFooter = false }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      {!noFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/terrenos" element={<Layout><Properties /></Layout>} />
          <Route path="/terrenos/:id" element={<Layout><PropertyDetail /></Layout>} />
          <Route path="/afiliados" element={<Layout><Affiliates /></Layout>} />
          <Route path="/oficinas" element={<Layout><Offices /></Layout>} />
          <Route path="/contacto" element={<Layout><Contact /></Layout>} />
          <Route path="/login" element={<Layout noFooter><Login /></Layout>} />
          <Route path="/registro" element={<Layout noFooter><Register /></Layout>} />
          <Route path="/mi-cuenta" element={
            <ProtectedRoute>
              <Layout><MyAccount /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout noFooter><Admin /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <Layout>
              <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-[#C9922A]">404</h1>
                  <p className="text-gray-500 mt-2">Página no encontrada</p>
                  <a href="/" className="text-[#C9922A] hover:underline mt-4 inline-block">← Ir al inicio</a>
                </div>
              </div>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
