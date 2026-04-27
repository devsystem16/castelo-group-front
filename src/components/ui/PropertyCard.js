import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ArrowsPointingOutIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { storageUrl } from '../../services/api';

const STATUS_CLASSES = {
  disponible: 'badge-disponible',
  reservado: 'badge-reservado',
  vendido: 'badge-vendido',
};

const STATUS_LABELS = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

const TYPE_LABELS = {
  urbano: 'Urbano',
  rural: 'Rural',
  agricola: 'Agrícola',
  comercial: 'Comercial',
  industrial: 'Industrial',
};

export default function PropertyCard({ property, view = 'grid' }) {
  const mainImage = storageUrl(property.media?.[0]?.url) || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80';
  const isGrid = view === 'grid';

  return (
    <Link
      to={`/terrenos/${property.id}`}
      className={`property-card bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 ${isGrid ? 'flex flex-col' : 'flex flex-row'}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isGrid ? 'h-52' : 'w-48 min-h-40 flex-shrink-0'}`}>
        <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
        <div className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full ${STATUS_CLASSES[property.status] || 'bg-gray-500 text-white'}`}>
          {STATUS_LABELS[property.status] || property.status}
        </div>
        {property.type && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {TYPE_LABELS[property.type] || property.type}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-[#111111] text-base leading-tight line-clamp-2">{property.title}</h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <MapPinIcon className="w-4 h-4 text-[#C9922A]" />
          <span>{property.canton}, {property.province}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <ArrowsPointingOutIcon className="w-4 h-4" />
            {property.area_m2?.toLocaleString()} m²
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <CurrencyDollarIcon className="w-5 h-5 text-[#C9922A]" />
            <span className="text-[#C9922A] font-bold text-lg">
              {Number(property.price).toLocaleString('es-EC', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-xs text-[#C9922A] font-semibold bg-yellow-50 px-3 py-1 rounded-full hover:bg-[#C9922A] hover:text-white transition-colors">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  );
}
