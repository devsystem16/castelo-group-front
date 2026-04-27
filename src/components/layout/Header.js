import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/terrenos', label: 'Terrenos' },
  { to: '/afiliados', label: 'Afiliados' },
  { to: '/oficinas', label: 'Oficinas' },
  { to: '/contacto', label: 'Contacto' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#C9922A] flex items-center justify-center font-bold text-black text-xl">C</div>
            <div className="hidden sm:block">
              <p className="text-[#C9922A] font-bold text-sm leading-none">CASTELO GROUP</p>
              <p className="text-gray-400 text-xs">Bienes Raíces Ecuador</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-[#C9922A]' : 'text-gray-300 hover:text-[#C9922A]'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-[#C9922A] transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="text-sm">{user.name?.split(' ')[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                    <Link to="/mi-cuenta" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#C9922A] hover:text-black transition-colors" onClick={() => setDropOpen(false)}>Mi Cuenta</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#C9922A] hover:text-black transition-colors" onClick={() => setDropOpen(false)}>Panel Admin</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900 hover:text-white transition-colors">Cerrar Sesión</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-300 hover:text-[#C9922A] transition-colors">Ingresar</Link>
                <Link to="/registro" className="bg-[#C9922A] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#a87520] transition-colors">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-300 hover:text-[#C9922A]">
            {open ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1a1a1a] border-t border-gray-700">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                className={({ isActive }) => `block text-sm font-medium ${isActive ? 'text-[#C9922A]' : 'text-gray-300'}`}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to="/mi-cuenta" className="block text-sm text-gray-300" onClick={() => setOpen(false)}>Mi Cuenta</Link>
                {user.role === 'admin' && <Link to="/admin" className="block text-sm text-gray-300" onClick={() => setOpen(false)}>Panel Admin</Link>}
                <button onClick={handleLogout} className="text-sm text-red-400">Cerrar Sesión</button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="text-sm text-gray-300" onClick={() => setOpen(false)}>Ingresar</Link>
                <Link to="/registro" className="bg-[#C9922A] text-black px-4 py-2 rounded text-sm font-semibold" onClick={() => setOpen(false)}>Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
