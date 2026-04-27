import React from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const PROVINCES = ['Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro','Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí','Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena','Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'];
const TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'rural', label: 'Rural' },
  { value: 'agricola', label: 'Agrícola' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'industrial', label: 'Industrial' },
];
const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'Más reciente' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'views_desc', label: 'Más vistos' },
];

export default function SearchFilters({ filters, onChange, compact = false }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar terrenos..."
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#C9922A]"
          />
        </div>
        <select value={filters.province || ''} onChange={(e) => update('province', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
          <option value="">Provincia</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.type || ''} onChange={(e) => update('type', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#111111] flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-[#C9922A]" /> Filtros
        </h3>
        <button onClick={() => onChange({})} className="text-xs text-gray-500 hover:text-[#C9922A] transition-colors">
          Limpiar filtros
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.search || ''}
          onChange={(e) => update('search', e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9922A]"
        />
      </div>

      {/* Province */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Provincia</label>
        <select value={filters.province || ''} onChange={(e) => update('province', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
          <option value="">Todas las provincias</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de terreno</label>
        <select value={filters.type || ''} onChange={(e) => update('type', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Precio (USD)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={filters.min_price || ''}
            onChange={(e) => update('min_price', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]" />
          <input type="number" placeholder="Máx" value={filters.max_price || ''}
            onChange={(e) => update('max_price', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]" />
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Área (m²)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={filters.min_area || ''}
            onChange={(e) => update('min_area', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]" />
          <input type="number" placeholder="Máx" value={filters.max_area || ''}
            onChange={(e) => update('max_area', e.target.value)}
            className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]" />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Ordenar por</label>
        <select value={filters.sort || 'created_at_desc'} onChange={(e) => update('sort', e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
