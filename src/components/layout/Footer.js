import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-gray-400 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9922A] flex items-center justify-center font-bold text-black text-xl">C</div>
              <div>
                <p className="text-[#C9922A] font-bold">CASTELO GROUP</p>
                <p className="text-xs text-gray-500">Consorcio Bienes Raíces</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Tu socio de confianza en bienes raíces en Ecuador. Terrenos con garantía legal y los mejores precios del mercado.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://wa.me/593990000000" target="_blank" rel="noopener noreferrer"
                className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-2 rounded transition-colors">
                WhatsApp
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Navegación</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Inicio'], ['/terrenos', 'Terrenos'], ['/afiliados', 'Afiliados'], ['/oficinas', 'Oficinas'], ['/contacto', 'Contacto']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-[#C9922A] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>Ecuador</li>
              <li>
                <a href="mailto:info@castelobienes.ec" className="hover:text-[#C9922A] transition-colors">
                  info@castelobienes.ec
                </a>
              </li>
              <li>
                <a href="tel:+593990000000" className="hover:text-[#C9922A] transition-colors">
                  +593 99 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} Castelo Group. Todos los derechos reservados.</p>
          <p>Hecho en Ecuador 🇪🇨</p>
        </div>
      </div>
    </footer>
  );
}
