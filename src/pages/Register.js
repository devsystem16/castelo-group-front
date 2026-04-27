import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', cedula: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Las contraseñas no coinciden.' });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else setError(err.response?.data?.message || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <input type={type} required value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${errors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#C9922A] focus:ring-[#C9922A]'}`} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#C9922A] flex items-center justify-center font-bold text-black text-2xl mx-auto mb-3">C</div>
          <h1 className="text-2xl font-bold text-[#111111]">Crear Cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Únete a Castelo Group</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Nombres completos', 'text', 'Juan Pérez')}
          {field('cedula', 'Cédula de identidad', 'text', '1712345678')}
          {field('email', 'Correo electrónico', 'email', 'tu@correo.com')}
          {field('phone', 'Teléfono / WhatsApp', 'tel', '+593 99 000 0000')}
          {field('password', 'Contraseña', 'password', 'Mínimo 8 caracteres')}
          {field('password_confirmation', 'Confirmar contraseña', 'password', 'Repite la contraseña')}

          <button type="submit" disabled={loading}
            className="w-full bg-[#C9922A] text-black font-bold py-3 rounded-xl hover:bg-[#a87520] transition-colors disabled:opacity-60">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#C9922A] font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
