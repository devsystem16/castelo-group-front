import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  MapPinIcon, ArrowsPointingOutIcon, PhoneIcon, EnvelopeIcon,
  MagnifyingGlassPlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { propertiesService, contactService, storageUrl } from '../services/api';

const STATUS_LABELS = { disponible: 'Disponible', reservado: 'Reservado', vendido: 'Vendido' };
const STATUS_COLORS = { disponible: '#16a34a', reservado: '#d97706', vendido: '#dc2626' };
const TYPE_LABELS   = { urbano: 'Urbano', rural: 'Rural', agricola: 'Agrícola', comercial: 'Comercial', industrial: 'Industrial' };

/* ─── Zoom Modal ─────────────────────────────────────────────────────────── */
function ZoomModal({ images, initialIndex, onClose }) {
  const [idx, setIdx]       = useState(initialIndex);
  const [scale, setScale]   = useState(1);
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const dragging            = useRef(false);
  const lastPos             = useRef({ x: 0, y: 0 });
  const imgRef              = useRef(null);

  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  const navigate = useCallback((dir) => {
    reset();
    setIdx((i) => (i + dir + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  navigate(1);
      if (e.key === 'ArrowLeft')   navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, navigate]);

  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.min(5, Math.max(1, s - e.deltaY * 0.002)));
    if (scale <= 1) setPos({ x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
    if (scale <= 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y });
  };
  const onMouseUp = () => { dragging.current = false; };

  return (
    <div
      className="fixed inset-0 bg-black/95 flex flex-col"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/60 text-sm">{idx + 1} / {images.length}</span>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs hidden sm:block">Rueda del ratón para hacer zoom · Arrastra para mover</span>
          <button
            onClick={reset}
            className="text-white/60 hover:text-white text-xs border border-white/20 px-2 py-1 rounded transition-colors"
          >
            {scale > 1 ? `${Math.round(scale * 100)}%` : 'Zoom'} ↺
          </button>
          <button onClick={onClose} className="text-white hover:text-[#C9922A] transition-colors">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
      >
        <img
          ref={imgRef}
          src={storageUrl(images[idx]?.url)}
          alt=""
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onDragStart={(e) => e.preventDefault()}
          style={{
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: dragging.current ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: '80vh',
            objectFit: 'contain',
            userSelect: 'none',
          }}
        />

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#C9922A] text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-[#C9922A] text-white rounded-full p-2 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex-shrink-0 flex gap-2 justify-center px-4 py-3 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { reset(); setIdx(i); }}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? 'border-[#C9922A]' : 'border-white/20 opacity-60 hover:opacity-100'}`}
            >
              <img src={storageUrl(img.url)} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Gallery ────────────────────────────────────────────────────────────── */
function Gallery({ cover, thumbnails, title, statusLabel, statusColor, typeLabel }) {
  const allImages   = [cover, ...thumbnails].filter(Boolean);
  const [active, setActive]   = useState(0);
  const [zoomed, setZoomed]   = useState(false);
  const thumbsRef             = useRef(null);

  if (allImages.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm h-80 flex items-center justify-center bg-gray-100">
        <p className="text-gray-400">Sin imágenes</p>
      </div>
    );
  }

  const hasThumbs = allImages.length > 1;

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className={`flex gap-3 p-3 ${hasThumbs ? 'items-stretch' : ''}`}>

          {/* ── Portada principal ── */}
          <div className="flex-1 relative group min-w-0">
            <div
              className="relative rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ height: hasThumbs ? '420px' : '380px' }}
              onClick={() => setZoomed(true)}
            >
              <img
                src={storageUrl(allImages[active]?.url)}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {/* Zoom hint */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-3">
                  <MagnifyingGlassPlusIcon className="w-6 h-6" />
                </div>
              </div>
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full text-white shadow"
                  style={{ background: statusColor }}>{statusLabel}</span>
                {typeLabel && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/70 text-white shadow">{typeLabel}</span>
                )}
              </div>
              {/* Counter */}
              {hasThumbs && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {active + 1} / {allImages.length}
                </div>
              )}
            </div>
          </div>

          {/* ── Tira de miniaturas (derecha, vertical) ── */}
          {hasThumbs && (
            <div
              ref={thumbsRef}
              className="flex flex-col gap-2 overflow-y-auto"
              style={{ width: '88px', maxHeight: '420px' }}
            >
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 ${
                    i === active
                      ? 'border-[#C9922A] ring-1 ring-[#C9922A]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ width: '84px', height: '84px' }}
                  title={i === 0 ? 'Portada' : `Imagen ${i + 1}`}
                >
                  <img src={storageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="relative -mt-5 text-center">
                      <span className="text-[9px] bg-[#C9922A] text-black px-1 rounded font-semibold">Portada</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Miniaturas horizontales en mobile (solo se muestran si hay más de 1 y pantalla pequeña) */}
        {hasThumbs && (
          <div className="sm:hidden flex gap-2 px-3 pb-3 overflow-x-auto">
            {allImages.map((img, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === active ? 'border-[#C9922A]' : 'border-transparent opacity-60'}`}>
                <img src={storageUrl(img.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {zoomed && (
        <ZoomModal
          images={allImages}
          initialIndex={active}
          onClose={() => setZoomed(false)}
        />
      )}
    </>
  );
}

/* ─── Contact Form ───────────────────────────────────────────────────────── */
function ContactForm({ propertyId }) {
  const [form, setForm]   = useState({ name: '', phone: '', email: '', message: '', property_id: propertyId });
  const [sending, setSending] = useState(false);
  const [sent, setSent]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try { await contactService.send(form); setSent(true); }
    catch {} finally { setSending(false); }
  };

  if (sent) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
      <p className="text-green-700 font-semibold">¡Mensaje enviado!</p>
      <p className="text-green-600 text-sm mt-1">Te contactaremos pronto.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required placeholder="Tu nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9922A]" />
      <input required placeholder="Teléfono / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9922A]" />
      <input type="email" required placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9922A]" />
      <textarea required placeholder="Tu mensaje..." rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9922A] resize-none" />
      <button type="submit" disabled={sending}
        className="w-full bg-[#C9922A] text-black font-bold py-3 rounded-lg hover:bg-[#a87520] transition-colors disabled:opacity-50">
        {sending ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    propertiesService.getById(id)
      .then((res) => setProperty(res.data.data || res.data))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen pt-20 flex items-center justify-center text-center">
      <div>
        <p className="text-gray-500 text-lg">Propiedad no encontrada.</p>
        <Link to="/terrenos" className="text-[#C9922A] hover:underline mt-2 inline-block">← Volver al listado</Link>
      </div>
    </div>
  );

  // Soporta tanto el nuevo formato {cover, thumbnails} como el legacy {media[]}
  const cover      = property.cover || property.media?.find((m) => m.is_cover) || property.media?.[0] || null;
  const thumbnails = property.thumbnails
    || property.media?.filter((m) => !m.is_cover && m.media_type === 'photo')
    || [];
  const videos     = property.media?.filter((m) => m.media_type === 'video') || [];
  const hasLocation = property.latitude && property.longitude;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-[#C9922A]">Inicio</Link>
          <span>/</span>
          <Link to="/terrenos" className="hover:text-[#C9922A]">Terrenos</Link>
          <span>/</span>
          <span className="text-[#111111] truncate max-w-xs">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Contenido principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Galería */}
            <Gallery
              cover={cover}
              thumbnails={thumbnails}
              title={property.title}
              statusLabel={STATUS_LABELS[property.status]}
              statusColor={STATUS_COLORS[property.status]}
              typeLabel={TYPE_LABELS[property.type] || property.type}
            />

            {/* Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <h1 className="text-2xl font-bold text-[#111111]">{property.title}</h1>
                <p className="text-3xl font-bold text-[#C9922A]">
                  ${Number(property.price).toLocaleString('es-EC')}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4 text-[#C9922A]" />{property.canton}, {property.province}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowsPointingOutIcon className="w-4 h-4" />{Number(property.area_m2).toLocaleString()} m²
                </span>
              </div>
              <div
                className="prose-castelo"
                dangerouslySetInnerHTML={{ __html: property.description || '' }}
              />

              {(property.soil_type || property.access_services || property.legal_documents) && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <h3 className="font-semibold text-[#111111] mb-3">Información técnica</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {property.soil_type && <div><span className="text-gray-500">Tipo de suelo: </span><span className="font-medium">{property.soil_type}</span></div>}
                    {property.access_services && <div><span className="text-gray-500">Servicios: </span><span className="font-medium">{property.access_services}</span></div>}
                    {property.legal_documents && <div><span className="text-gray-500">Documentos: </span><span className="font-medium">{property.legal_documents}</span></div>}
                  </div>
                </div>
              )}
            </div>

            {/* Video */}
            {videos.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#111111] mb-3">Video del terreno</h3>
                {videos[0].url.includes('youtube') ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe src={videos[0].url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title="Video" />
                  </div>
                ) : (
                  <video src={storageUrl(videos[0].url)} controls className="w-full rounded-lg" />
                )}
              </div>
            )}

            {/* Mapa */}
            {hasLocation && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-[#111111] mb-3">Ubicación en el mapa</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <MapContainer center={[Number(property.latitude), Number(property.longitude)]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                    <Marker position={[Number(property.latitude), Number(property.longitude)]}>
                      <Popup>{property.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            <a
              href={`https://wa.me/593990000000?text=Hola! Me interesa el terreno: ${encodeURIComponent(property.title)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-green-700 transition-colors w-full"
            >
              <PhoneIcon className="w-5 h-5" /> Contactar por WhatsApp
            </a>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5 text-[#C9922A]" /> Enviar consulta
              </h3>
              <ContactForm propertyId={property.id} />
            </div>

            <div className="bg-[#111111] rounded-xl p-5 text-white">
              <h3 className="font-semibold text-[#C9922A] mb-3">Resumen</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📍 {property.province} - {property.canton}</li>
                <li>📐 {Number(property.area_m2).toLocaleString()} m²</li>
                <li>💵 ${Number(property.price).toLocaleString('es-EC')}</li>
                <li>🏷️ {TYPE_LABELS[property.type]}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
