import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPinIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';

const OFFICES = [
  {
    id: 1,
    name: 'Sede Principal',
    address: 'Av. Principal y Calle Secundaria, Quito, Pichincha',
    phone: '+593 99 000 0000',
    hours: 'Lun - Vie: 8:00 - 18:00 | Sáb: 9:00 - 13:00',
    lat: -0.1807,
    lng: -78.4678,
  },
  {
    id: 2,
    name: 'Sucursal Guayaquil',
    address: 'Av. 9 de Octubre y Malecón, Guayaquil, Guayas',
    phone: '+593 98 000 0001',
    hours: 'Lun - Vie: 9:00 - 17:00',
    lat: -2.1900,
    lng: -79.8875,
  },
];

export default function Offices() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <section className="bg-[#111111] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9922A] text-sm font-semibold tracking-wider uppercase mb-2">Nuestras Oficinas</p>
          <h1 className="text-white text-4xl font-bold mb-3">Encuéntranos</h1>
          <p className="text-gray-400">Visítanos en cualquiera de nuestras sedes a nivel nacional.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Map */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div style={{ height: '400px' }}>
            <MapContainer center={[-1.2, -78.5]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
              {OFFICES.map((o) => (
                <Marker key={o.id} position={[o.lat, o.lng]}>
                  <Popup>
                    <strong>{o.name}</strong><br />
                    {o.address}<br />
                    {o.phone}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Office cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFICES.map((office) => (
            <div key={office.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#111111] mb-4">{office.name}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#C9922A] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">{office.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-[#C9922A] flex-shrink-0" />
                  <a href={`tel:${office.phone}`} className="text-gray-600 hover:text-[#C9922A] transition-colors">{office.phone}</a>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-[#C9922A] flex-shrink-0 mt-0.5" />
                  <p className="text-gray-600">{office.hours}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`https://wa.me/${office.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  WhatsApp
                </a>
                <a href={`https://maps.google.com/?q=${office.lat},${office.lng}`} target="_blank" rel="noopener noreferrer"
                  className="bg-[#C9922A] text-black text-sm px-4 py-2 rounded-lg hover:bg-[#a87520] transition-colors font-semibold">
                  Ver en Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
