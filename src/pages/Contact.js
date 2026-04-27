import React, { useState } from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { contactService } from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', property_id: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactService.send(form);
      setSent(true);
    } catch {
      setError('Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <section className="bg-[#111111] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9922A] text-sm font-semibold tracking-wider uppercase mb-2">Contáctanos</p>
          <h1 className="text-white text-4xl font-bold mb-3">¿Tienes alguna consulta?</h1>
          <p className="text-gray-400">Nuestro equipo está disponible para ayudarte a encontrar el terreno ideal.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#111111]">Información de contacto</h2>

          {[
            { icon: PhoneIcon, label: 'Teléfono', value: '+593 99 000 0000', href: 'tel:+593990000000' },
            { icon: EnvelopeIcon, label: 'Correo', value: 'info@castelobienes.ec', href: 'mailto:info@castelobienes.ec' },
            { icon: MapPinIcon, label: 'Sede principal', value: 'Ecuador' },
            { icon: ClockIcon, label: 'Horario', value: 'Lun - Vie: 8:00 - 18:00 | Sáb: 9:00 - 13:00' },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#C9922A]/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#C9922A]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {href ? (
                  <a href={href} className="text-[#111111] hover:text-[#C9922A] font-medium transition-colors">{value}</a>
                ) : (
                  <p className="text-[#111111] font-medium">{value}</p>
                )}
              </div>
            </div>
          ))}

          <a
            href="https://wa.me/593990000000?text=Hola! Me gustaría consultar sobre terrenos disponibles."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            Escribirnos por WhatsApp
          </a>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-[#111111] mb-6">Envíanos un mensaje</h2>

          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-700 font-bold text-lg">¡Mensaje enviado!</p>
              <p className="text-green-600 text-sm mt-1">Nos comunicaremos contigo a la brevedad posible.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', message: '', property_id: '' }); }}
                className="mt-4 text-[#C9922A] text-sm hover:underline">Enviar otro mensaje</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Nombre completo *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9922A]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono *</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+593 99 000 0000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9922A]" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Correo electrónico *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9922A]" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje *</label>
                <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Escribe tu consulta aquí..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9922A] resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#C9922A] text-black font-bold py-3 rounded-xl hover:bg-[#a87520] transition-colors disabled:opacity-60">
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
