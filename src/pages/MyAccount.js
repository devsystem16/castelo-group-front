import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkIcon, CurrencyDollarIcon, UserGroupIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { affiliatesService } from '../services/api';

function StatCard({ icon: Icon, label, value, color = '#C9922A' }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <Icon className="w-6 h-6 mb-2" style={{ color }} />
      <p className="text-2xl font-bold text-[#111111]">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}

export default function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role === 'affiliate' || user.affiliate) {
      setLoading(true);
      affiliatesService.getDashboard()
        .then((res) => setDashboard(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, navigate]);

  const copyLink = () => {
    const link = `${window.location.origin}/terrenos?ref=${dashboard?.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#111111] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#C9922A] flex items-center justify-center text-black font-bold text-2xl">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">{user.name}</h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <span className="text-xs bg-[#C9922A] text-black px-2 py-0.5 rounded-full font-semibold mt-1 inline-block capitalize">{user.role}</span>
            </div>
          </div>

          <div className="p-6">
            {/* Affiliate dashboard */}
            {(user.role === 'affiliate') && (
              <>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#C9922A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : dashboard ? (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-[#111111]">Panel de Afiliado</h2>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard icon={UserGroupIcon} label="Referidos" value={dashboard.total_referrals || 0} />
                      <StatCard icon={CurrencyDollarIcon} label="Ventas" value={dashboard.converted_sales || 0} color="#16a34a" />
                      <StatCard icon={CurrencyDollarIcon} label="Pendiente" value={`$${dashboard.pending_commissions || 0}`} color="#d97706" />
                      <StatCard icon={CurrencyDollarIcon} label="Pagado" value={`$${dashboard.paid_commissions || 0}`} color="#2563eb" />
                    </div>

                    {/* Referral link */}
                    <div className="bg-[#111111] rounded-xl p-5">
                      <h3 className="text-[#C9922A] font-semibold mb-2 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Tu enlace de referido
                      </h3>
                      <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-3">
                        <p className="text-gray-300 text-sm flex-1 truncate">
                          {window.location.origin}/terrenos?ref={dashboard.referral_code}
                        </p>
                        <button onClick={copyLink}
                          className="bg-[#C9922A] text-black text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 hover:bg-[#a87520] transition-colors flex-shrink-0">
                          <ClipboardDocumentIcon className="w-4 h-4" />
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Commission history */}
                    {dashboard.commissions?.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-[#111111] mb-3">Historial de comisiones</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b border-gray-200 text-gray-500">
                              <th className="text-left py-2">Fecha</th>
                              <th className="text-left py-2">Monto</th>
                              <th className="text-left py-2">Estado</th>
                            </tr></thead>
                            <tbody>
                              {dashboard.commissions.map((c) => (
                                <tr key={c.id} className="border-b border-gray-100">
                                  <td className="py-2">{new Date(c.created_at).toLocaleDateString('es-EC')}</td>
                                  <td className="py-2 font-semibold text-[#C9922A]">${c.amount}</td>
                                  <td className="py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.status === 'paid' ? 'bg-green-100 text-green-700' : c.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {c.status === 'paid' ? 'Pagado' : c.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tu solicitud de afiliado está pendiente de aprobación.</p>
                  </div>
                )}
              </>
            )}

            {user.role === 'client' && (
              <div className="py-4">
                <p className="text-gray-500">Aquí podrás ver tus propiedades favoritas y consultas enviadas.</p>
              </div>
            )}

            {/* Logout */}
            <div className="border-t border-gray-100 mt-6 pt-6">
              <button onClick={handleLogout}
                className="bg-red-50 text-red-600 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
