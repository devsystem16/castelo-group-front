import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Squares2X2Icon, Bars3Icon } from '@heroicons/react/24/outline';
import PropertyCard from '../components/ui/PropertyCard';
import SearchFilters from '../components/ui/SearchFilters';
import { propertiesService } from '../services/api';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    province: searchParams.get('province') || '',
    type: searchParams.get('type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
    sort: 'created_at_desc',
    page: 1,
  });

  const fetchProperties = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null));
    propertiesService.getAll(params)
      .then((res) => {
        setProperties(res.data.data || res.data);
        setMeta(res.data.meta || {});
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleFiltersChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
    const params = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.province) params.province = newFilters.province;
    if (newFilters.type) params.type = newFilters.type;
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#111111]">Terrenos en Ecuador</h1>
          <p className="text-gray-500 mt-1">
            {meta.total ? `${meta.total} propiedades encontradas` : 'Cargando...'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <SearchFilters filters={filters} onChange={handleFiltersChange} />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* View toggle + count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {properties.length} resultado{properties.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button onClick={() => setView('grid')}
                  className={`p-2 rounded ${view === 'grid' ? 'bg-[#C9922A] text-white' : 'text-gray-500 hover:text-[#C9922A]'}`}>
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')}
                  className={`p-2 rounded ${view === 'list' ? 'bg-[#C9922A] text-white' : 'text-gray-500 hover:text-[#C9922A]'}`}>
                  <Bars3Icon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`bg-white rounded-xl animate-pulse ${view === 'grid' ? 'h-72' : 'h-40'}`} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No se encontraron propiedades con esos filtros.</p>
              </div>
            ) : (
              <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
                {properties.map((p) => <PropertyCard key={p.id} property={p} view={view} />)}
              </div>
            )}

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(meta.last_page)].map((_, i) => (
                  <button key={i} onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === i + 1 ? 'bg-[#C9922A] text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
