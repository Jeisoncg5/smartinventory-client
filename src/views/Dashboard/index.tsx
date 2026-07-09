import React, { useEffect, useState } from 'react';
import { getSales, type Sale } from '../../services/saleService';
import { getLowStock, type InventoryItem } from '../../services/inventoryService';
import { TrendingUp, ShoppingBag, AlertTriangle, FileText, Smartphone, Monitor } from 'lucide-react';

const DashboardView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await getSales();
        const lowStockData = await getLowStock();
        setSales(salesData);
        setLowStock(lowStockData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalVentas = sales.reduce((sum, s) => sum + s.total, 0);
  const totalChatbot = sales.filter(s => s.saleOrigin === 'CHATBOT').reduce((sum, s) => sum + s.total, 0);
  const totalPOS = sales.filter(s => s.saleOrigin === 'POS').reduce((sum, s) => sum + s.total, 0);

  const chatbotPercent = totalVentas > 0 ? Math.round((totalChatbot / totalVentas) * 100) : 0;
  const posPercent = totalVentas > 0 ? Math.round((totalPOS / totalVentas) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium">Cargando el centro de control de No Es Shein, Pero Casi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 md:text-3xl">
          Dashboard de No Es Shein, Pero Casi
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Resumen operativo de la tienda, ventas del drop y alertas del stock viral.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-sm transition duration-350 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ingresos del Drop</span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">${totalVentas.toLocaleString('es-CO')}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">Hoy desde todos los canales</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-sm transition duration-350 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pedidos Totales</span>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{sales.length}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">Compras cerradas</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-sm transition duration-350 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Crítico</span>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{lowStock.length}</h3>
            <p className="mt-1 text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wide">Prendas por revisar</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-sm transition duration-350 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Promedio</span>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">${sales.length > 0 ? Math.round(totalVentas / sales.length).toLocaleString('es-CO') : '0'}</h3>
            <p className="mt-1 text-[10px] font-semibold text-slate-400">Promedio por compra</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-6 shadow-sm lg:col-span-1">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg uppercase tracking-tight">Origen de Ventas</h3>
          <p className="text-xs text-slate-400 mb-5 mt-1">Qué tanto venden el widget inteligente y la caja manual.</p>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Smartphone size={16} />
                  <span>Bot de compras</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300">{chatbotPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${chatbotPercent}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-right text-slate-400 mt-1">${totalChatbot.toLocaleString('es-CO')}</p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Monitor size={16} />
                  <span>POS / Caja</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300">{posPercent}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800" style={{ width: `${posPercent}%` }}></div>
              </div>
              <p className="text-[10px] font-bold text-right text-slate-400 mt-1">${totalPOS.toLocaleString('es-CO')}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg uppercase tracking-tight">Alertas de Inventario</h3>
            <p className="text-xs text-slate-400 mt-1">Prendas que se están agotando y podrían desaparecer del siguiente drop.</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60">
            <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {lowStock.length > 0 ? (
                lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#161b26] hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{item.productName}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">SKU: {item.sku} | Talla: <span className="text-slate-600 dark:text-slate-300 font-black">{item.size}</span> | Color: {item.color}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${item.stock === 0 ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' : 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}`}>
                        {item.stock === 0 ? 'Agotado' : `${item.stock} unidades`}
                      </span>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">MÍNIMO: {item.minStock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-[#161b26]">No hay alertas críticas. El drop sigue sano.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;