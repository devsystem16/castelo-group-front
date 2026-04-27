import React, { useState } from 'react';
import { CurrencyDollarIcon, LinkIcon, UserGroupIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { affiliatesService } from '../services/api';

const BANKS = ['Banco Pichincha','Banco Guayaquil','Banco Pacífico','Banco Internacional','Produbanco','Banco del Austro','Cooperativa JEP','Cooperativa 29 de Octubre','Cooperativa Oscus'];

export default function Affiliates() {
  const [form, setForm] = useState({
    name: '', cedula: '', whatsapp: '', email: '',
    bank_name: '', account_number: '', account_type: 'ahorros',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await affiliatesService.register(form);
      setSuccess(true);
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  const f = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
    className: `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ${errors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#C9922A] focus:ring-[#C9922A]'}`,
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#111111] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9922A] text-sm font-semibold tracking-wider uppercase mb-2">Programa de Afiliados</p>
          <h1 className="text-white text-4xl font-bold mb-4">Gana comisiones vendiendo terrenos</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Únete a nuestra red de afiliados. Comparte tu enlace personal, y cada vez que se concrete una venta, recibes tu comisión directo a tu cuenta bancaria.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-center text-2xl font-bold text-[#111111] mb-8">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: UserGroupIcon, step: '1', title: 'Regístrate', desc: 'Completa el formulario con tus datos y espera la aprobación del administrador.' },
            { icon: LinkIcon, step: '2', title: 'Obtén tu enlace', desc: 'Una vez aprobado, recibes tu URL personal de referido para compartir.' },
            { icon: CheckBadgeIcon, step: '3', title: 'Comparte', desc: 'Comparte tu enlace por WhatsApp, redes sociales o personalmente.' },
            { icon: CurrencyDollarIcon, step: '4', title: 'Cobra tu comisión', desc: 'Cuando se concrete una venta, recibes el 8% en tu cuenta bancaria.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#C9922A] text-black font-bold text-xl flex items-center justify-center mx-auto mb-3">{step}</div>
              <Icon className="w-6 h-6 text-[#C9922A] mx-auto mb-2" />
              <h3 className="font-semibold text-[#111111] mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* Commission info */}
        <div className="bg-[#C9922A] rounded-xl p-6 mt-8 text-center">
          <p className="text-black font-bold text-4xl">8%</p>
          <p className="text-black/80 mt-1">de comisión por cada venta concretada</p>
          <p className="text-black/60 text-sm mt-2">El porcentaje puede variar según el terreno. El administrador confirma cada venta.</p>
        </div>
      </section>

      {/* Registration form */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Solicitar ser Afiliado</h2>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckBadgeIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-green-800 text-lg">¡Solicitud enviada!</h3>
              <p className="text-green-700 text-sm mt-1">Revisaremos tu solicitud y te notificaremos por correo dentro de 24-48 horas.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombres completos *</label>
                  <input {...f('name')} required placeholder="Juan Pérez" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cédula de identidad *</label>
                  <input {...f('cedula')} required placeholder="1712345678" />
                  {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">WhatsApp *</label>
                  <input {...f('whatsapp')} required placeholder="+593 99 000 0000" />
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Correo electrónico *</label>
                  <input {...f('email')} required type="email" placeholder="tu@correo.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-[#111111] mb-3">Datos bancarios</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Banco / Cooperativa *</label>
                    <select {...f('bank_name')} required>
                      <option value="">Seleccionar banco</option>
                      {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.bank_name && <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de cuenta *</label>
                    <select {...f('account_type')}>
                      <option value="ahorros">Ahorros</option>
                      <option value="corriente">Corriente</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Número de cuenta *</label>
                  <input {...f('account_number')} required placeholder="Número de cuenta bancaria" />
                  {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">¿Cómo planeas promocionar los terrenos? *</label>
                <textarea {...f('description')} required rows={3} placeholder="Cuéntanos tu estrategia de ventas..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#C9922A] focus:ring-[#C9922A]'}`} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#C9922A] text-black font-bold py-3 rounded-xl hover:bg-[#a87520] transition-colors disabled:opacity-60">
                {loading ? 'Enviando solicitud...' : 'Enviar solicitud de afiliado'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
