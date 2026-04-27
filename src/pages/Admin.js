import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeModernIcon, UserGroupIcon, CurrencyDollarIcon, ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { adminService, propertiesService, storageUrl } from '../services/api';
import RichTextEditor from '../components/ui/RichTextEditor';

const TABS = ['Dashboard', 'Propiedades', 'Afiliados', 'Ventas', 'Comisiones'];

const PROVINCES = ['Azuay','Bolívar','Cañar','Carchi','Chimborazo','Cotopaxi','El Oro','Esmeraldas','Galápagos','Guayas','Imbabura','Loja','Los Ríos','Manabí','Morona Santiago','Napo','Orellana','Pastaza','Pichincha','Santa Elena','Santo Domingo','Sucumbíos','Tungurahua','Zamora Chinchipe'];

function ImageUploadBox({ label, accept, multiple, files, onFiles, maxCount, hint }) {
  const inputRef = React.useRef(null);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (multiple) {
      const merged = [...files, ...selected].slice(0, maxCount);
      onFiles(merged);
    } else {
      onFiles(selected.slice(0, 1));
    }
    e.target.value = '';
  };

  const remove = (i) => onFiles(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}

      {/* Previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((f, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(f)}
                alt=""
                className="w-20 h-20 object-cover rounded-lg border-2 border-[#C9922A]"
              />
              {!multiple && <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-[#C9922A] text-black rounded-b-lg font-bold">Portada</span>}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >×</button>
            </div>
          ))}
          {multiple && files.length < maxCount && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-[#C9922A] hover:text-[#C9922A] transition-colors text-2xl">+</button>
          )}
        </div>
      )}

      {files.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-[#C9922A] hover:text-[#C9922A] transition-colors"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm">Haz clic para seleccionar {multiple ? 'imágenes' : 'la portada'}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
    </div>
  );
}

function PropertyForm({ property, onSave, onCancel }) {
  const [form, setForm] = React.useState(property || {
    title: '', description: '', type: 'urbano', province: '', canton: '',
    price: '', area_m2: '', status: 'disponible', latitude: '', longitude: '',
    soil_type: '', access_services: '', legal_documents: '',
  });

  // Imágenes ya guardadas en BD
  const [existingCover, setExistingCover]           = React.useState(property?.cover || null);
  const [existingThumbnails, setExistingThumbnails] = React.useState(property?.thumbnails || []);
  const [toDeleteIds, setToDeleteIds]               = React.useState([]);   // IDs a eliminar al guardar

  // Nuevos archivos a subir
  const [coverFiles, setCoverFiles]         = React.useState([]);
  const [thumbnailFiles, setThumbnailFiles] = React.useState([]);

  const [loading, setLoading]               = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState('');

  const markDelete = (mediaId, type) => {
    setToDeleteIds((prev) => [...prev, mediaId]);
    if (type === 'cover')     setExistingCover(null);
    if (type === 'thumbnail') setExistingThumbnails((prev) => prev.filter((t) => t.id !== mediaId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let savedId = property?.id;

      // 1. Crear o actualizar datos de la propiedad
      if (savedId) {
        await propertiesService.update(savedId, form);
      } else {
        const res = await propertiesService.create(form);
        savedId = res.data?.data?.id || res.data?.id;
      }

      // 2. Eliminar las imágenes marcadas para borrar
      if (toDeleteIds.length > 0) {
        setUploadProgress('Eliminando imágenes...');
        await Promise.all(toDeleteIds.map((mid) => propertiesService.deleteMedia(savedId, mid)));
      }

      // 3. Subir nuevas imágenes
      if (coverFiles.length > 0 || thumbnailFiles.length > 0) {
        setUploadProgress('Subiendo imágenes...');
        const fd = new FormData();
        if (coverFiles[0]) fd.append('cover', coverFiles[0]);
        thumbnailFiles.forEach((f) => fd.append('thumbnails[]', f));
        await propertiesService.uploadMedia(savedId, fd);
      }

      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const inp = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {inp('title', 'Título *', 'text', 'Nombre del terreno')}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Descripción</label>
        <RichTextEditor
          value={form.description}
          onChange={(html) => setForm({ ...form, description: html })}
          placeholder="Escribe la descripción del terreno con formato..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
            {['urbano','rural','agricola','comercial','industrial'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Estado</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
            {['disponible','reservado','vendido'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Provincia</label>
          <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9922A]">
            <option value="">Seleccionar</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {inp('canton', 'Cantón')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {inp('price', 'Precio (USD)', 'number')}
        {inp('area_m2', 'Área (m²)', 'number')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {inp('latitude', 'Latitud GPS', 'text', '-0.1807')}
        {inp('longitude', 'Longitud GPS', 'text', '-78.4678')}
      </div>

      {inp('soil_type', 'Tipo de suelo')}
      {inp('access_services', 'Acceso a servicios')}
      {inp('legal_documents', 'Documentos legales')}

      {/* ── Sección de imágenes ── */}
      <div className="border-t border-gray-100 pt-4 space-y-5">
        <h4 className="text-sm font-semibold text-[#111111]">📷 Imágenes de la propiedad</h4>

        {/* ── Portada ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Imagen de portada</label>
          <p className="text-xs text-gray-400 mb-2">Se muestra en el listado principal. Formato JPG, PNG o WEBP.</p>

          {/* Portada existente */}
          {existingCover && coverFiles.length === 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2">
              <div className="relative group flex-shrink-0">
                <img
                  src={storageUrl(existingCover.url)}
                  alt="Portada actual"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-[#C9922A]"
                />
                <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-[#C9922A] text-black rounded-b-lg font-bold py-0.5">
                  Portada actual
                </span>
                <button
                  type="button"
                  onClick={() => markDelete(existingCover.id, 'cover')}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow transition-colors"
                  title="Eliminar portada"
                >×</button>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Para reemplazarla, elimínala primero con el botón × o sube una nueva imagen abajo y la reemplazará automáticamente.
              </p>
            </div>
          )}

          {/* Upload nueva portada */}
          <ImageUploadBox
            label=""
            accept="image/*"
            multiple={false}
            files={coverFiles}
            onFiles={setCoverFiles}
            hint={existingCover && coverFiles.length === 0 ? '' : ''}
          />
        </div>

        {/* ── Miniaturas ── */}
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Miniaturas adicionales ({existingThumbnails.length + thumbnailFiles.length}/10)
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Se muestran a la derecha de la portada. Puedes tener hasta 10 en total.
          </p>

          {/* Miniaturas existentes */}
          {existingThumbnails.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="w-full text-xs text-gray-500 mb-1 font-medium">Guardadas actualmente:</p>
              {existingThumbnails.map((thumb) => (
                <div key={thumb.id} className="relative group">
                  <img
                    src={storageUrl(thumb.url)}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => markDelete(thumb.id, 'thumbnail')}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar miniatura"
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Upload nuevas miniaturas */}
          <ImageUploadBox
            label=""
            accept="image/*"
            multiple
            maxCount={10 - existingThumbnails.length}
            files={thumbnailFiles}
            onFiles={setThumbnailFiles}
          />
        </div>

        {/* Resumen de cambios pendientes */}
        {toDeleteIds.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
            ⚠️ {toDeleteIds.length} imagen{toDeleteIds.length > 1 ? 'es' : ''} marcada{toDeleteIds.length > 1 ? 's' : ''} para eliminar al guardar.
          </div>
        )}
      </div>

      {uploadProgress && (
        <div className="flex items-center gap-2 text-sm text-[#C9922A]">
          <div className="w-4 h-4 border-2 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
          {uploadProgress}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-[#C9922A] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#a87520] transition-colors disabled:opacity-60">
          {loading ? 'Guardando...' : property?.id ? 'Actualizar propiedad' : 'Crear propiedad'}
        </button>
        <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [properties, setProperties] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loadingEdit, setLoadingEdit]       = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, propsRes, affsRes, commsRes] = await Promise.allSettled([
        adminService.getStats(),
        propertiesService.getAll({ per_page: 50 }),
        adminService.getAffiliates(),
        adminService.getCommissions(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (propsRes.status === 'fulfilled') setProperties(propsRes.value.data.data || propsRes.value.data);
      if (affsRes.status === 'fulfilled') setAffiliates(affsRes.value.data.data || affsRes.value.data);
      if (commsRes.status === 'fulfilled') setCommissions(commsRes.value.data.data || commsRes.value.data);
    } finally { setLoading(false); }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('¿Eliminar esta propiedad?')) return;
    await propertiesService.delete(id);
    setProperties((ps) => ps.filter((p) => p.id !== id));
  };

  const handleEditProperty = async (p) => {
    setLoadingEdit(true);
    setShowForm(false);
    try {
      const res = await propertiesService.getById(p.id);
      const full = res.data?.data || res.data;
      setEditingProperty(full);
      setShowForm(true);
    } catch {
      setEditingProperty(p);
      setShowForm(true);
    } finally {
      setLoadingEdit(false);
    }
  };

  const updateAffiliateStatus = async (id, status) => {
    await adminService.updateAffiliateStatus(id, { status });
    setAffiliates((as) => as.map((a) => a.id === id ? { ...a, status } : a));
  };

  const approveCommission = async (id) => {
    await adminService.approveCommission(id);
    setCommissions((cs) => cs.map((c) => c.id === id ? { ...c, status: 'approved' } : c));
  };

  const markPaid = async (id) => {
    await adminService.markCommissionPaid(id);
    setCommissions((cs) => cs.map((c) => c.id === id ? { ...c, status: 'paid' } : c));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#111111]">Panel de Administración</h1>
          <span className="text-sm text-gray-500">Bienvenido, {user.name}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t ? 'bg-[#C9922A] text-black' : 'text-gray-600 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard */}
            {tab === 'Dashboard' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: HomeModernIcon, label: 'Propiedades', value: stats.total_properties || 0 },
                  { icon: UserGroupIcon, label: 'Usuarios', value: stats.total_users || 0 },
                  { icon: CurrencyDollarIcon, label: 'Ventas', value: stats.total_sales || 0 },
                  { icon: ChatBubbleLeftIcon, label: 'Consultas', value: stats.total_contacts || 0 },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <Icon className="w-6 h-6 text-[#C9922A] mb-2" />
                    <p className="text-3xl font-bold text-[#111111]">{value}</p>
                    <p className="text-gray-500 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Properties */}
            {tab === 'Propiedades' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[#111111]">Propiedades ({properties.length})</h2>
                  <button onClick={() => { setShowForm(true); setEditingProperty(null); }}
                    className="flex items-center gap-2 bg-[#C9922A] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#a87520] transition-colors">
                    <PlusIcon className="w-4 h-4" /> Nueva propiedad
                  </button>
                </div>

                {loadingEdit && (
                  <div className="flex items-center gap-2 text-sm text-[#C9922A] mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="w-4 h-4 border-2 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
                    Cargando imágenes de la propiedad...
                  </div>
                )}

                {showForm && !loadingEdit && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
                    <h3 className="font-semibold text-[#111111] mb-4">{editingProperty ? `Editar: ${editingProperty.title}` : 'Nueva propiedad'}</h3>
                    <PropertyForm
                      property={editingProperty}
                      onSave={() => { setShowForm(false); setEditingProperty(null); loadData(); }}
                      onCancel={() => { setShowForm(false); setEditingProperty(null); }}
                    />
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                        <th className="text-left px-4 py-3">Propiedad</th>
                        <th className="text-left px-4 py-3">Provincia</th>
                        <th className="text-left px-4 py-3">Precio</th>
                        <th className="text-left px-4 py-3">Estado</th>
                        <th className="text-left px-4 py-3">Acciones</th>
                      </tr></thead>
                      <tbody>
                        {properties.map((p) => (
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-[#111111]">{p.title}</td>
                            <td className="px-4 py-3 text-gray-500">{p.province}</td>
                            <td className="px-4 py-3 text-[#C9922A] font-semibold">${Number(p.price).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${p.status === 'disponible' ? 'bg-green-100 text-green-700' : p.status === 'reservado' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <button onClick={() => handleEditProperty(p)}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">Editar</button>
                              <button onClick={() => deleteProperty(p.id)}
                                className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Affiliates */}
            {tab === 'Afiliados' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3">Nombre</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Banco</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {affiliates.map((a) => (
                        <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{a.user?.name || a.name}</td>
                          <td className="px-4 py-3 text-gray-500">{a.user?.email || a.email}</td>
                          <td className="px-4 py-3 text-gray-500">{a.bank_name}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            {a.status === 'pending' && (
                              <>
                                <button onClick={() => updateAffiliateStatus(a.id, 'approved')}
                                  className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors">Aprobar</button>
                                <button onClick={() => updateAffiliateStatus(a.id, 'rejected')}
                                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors">Rechazar</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Commissions */}
            {tab === 'Comisiones' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase">
                      <th className="text-left px-4 py-3">Afiliado</th>
                      <th className="text-left px-4 py-3">Monto</th>
                      <th className="text-left px-4 py-3">Estado</th>
                      <th className="text-left px-4 py-3">Fecha</th>
                      <th className="text-left px-4 py-3">Acciones</th>
                    </tr></thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.affiliate?.user?.name || '-'}</td>
                          <td className="px-4 py-3 text-[#C9922A] font-semibold">${c.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString('es-EC')}</td>
                          <td className="px-4 py-3 flex gap-2">
                            {c.status === 'pending' && (
                              <button onClick={() => approveCommission(c.id)}
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Aprobar</button>
                            )}
                            {c.status === 'approved' && (
                              <button onClick={() => markPaid(c.id)}
                                className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100">Marcar pagado</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
