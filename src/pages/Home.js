import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, HomeModernIcon, UserGroupIcon, TrophyIcon } from '@heroicons/react/24/outline';
import PropertyCard from '../components/ui/PropertyCard';
import { propertiesService } from '../services/api';

const HERO_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'rural', label: 'Rural' },
  { value: 'agricola', label: 'Agrícola' },
  { value: 'comercial', label: 'Comercial' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    propertiesService.getAll({ per_page: 6, status: 'disponible', sort: 'views_desc' })
      .then((res) => setFeatured(res.data.data || res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    navigate(`/terrenos?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 60%, #2a1a00 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9922A] text-sm font-semibold tracking-widest uppercase mb-3">Consorcio Bienes Raíces</p>
          <h1 className="text-white text-4xl sm:text-6xl font-bold leading-tight mb-4">
            Encuentra tu terreno<br />
            <span className="text-[#C9922A]">ideal en Ecuador</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            Terrenos urbanos, rurales, agrícolas y comerciales con garantía legal y los mejores precios del mercado.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por provincia, cantón..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
              />
            </div>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="border-l border-gray-200 px-4 py-3 text-sm focus:outline-none text-gray-600 rounded-xl">
              {HERO_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button type="submit" className="bg-[#C9922A] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#a87520] transition-colors whitespace-nowrap">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#C9922A] py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: HomeModernIcon, value: '200+', label: 'Terrenos' },
            { icon: UserGroupIcon, value: '1,500+', label: 'Clientes' },
            { icon: TrophyIcon, value: '10+', label: 'Años exp.' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon className="w-8 h-8 mx-auto text-black/60 mb-1" />
              <p className="text-black font-bold text-3xl">{value}</p>
              <p className="text-black/70 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-[#C9922A] text-sm font-semibold tracking-wider uppercase">Propiedades</p>
          <h2 className="text-3xl font-bold text-[#111111] mt-1">Terrenos Destacados</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay propiedades disponibles aún.</p>
        )}

        <div className="text-center mt-10">
          <button onClick={() => navigate('/terrenos')} className="bg-[#111111] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#C9922A] hover:text-black transition-colors">
            Ver todos los terrenos →
          </button>
        </div>
      </section>

      {/* Affiliates CTA */}
      <section className="bg-[#111111] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[#C9922A] text-sm font-semibold tracking-wider uppercase mb-2">Programa de Afiliados</p>
          <h2 className="text-white text-3xl font-bold mb-4">Gana comisiones vendiendo terrenos</h2>
          <p className="text-gray-400 mb-8">Únete a nuestra red de afiliados y recibe hasta el 8% de comisión por cada terreno vendido a través de tu enlace personal.</p>
          <button onClick={() => navigate('/afiliados')} className="bg-[#C9922A] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#F0C96A] transition-colors">
            Quiero ser afiliado
          </button>
        </div>
      </section>
    </div>
  );
}
