import React, { useEffect, useState } from 'react';
import { getInventory, getLowStock, adjustStock, type InventoryItem } from '../../services/inventoryService';
import { AlertTriangle, RefreshCw, Check, Plus, Minus, Search, Boxes } from 'lucide-react';

const InventarioView: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Feedback visual de guardado por ítem
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustSuccessId, setAdjustSuccessId] = useState<string | null>(null);

  const loadData = async (onlyLow = false) => {
    setLoading(true);
    try {
      if (onlyLow) {
        const data = await getLowStock();
        setInventory(data);
      } else {
        const data = await getInventory();
        setInventory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filterLowStock);
  }, [filterLowStock]);

  const handleStepAdjust = async (item: InventoryItem, delta: number) => {
    const nextQty = item.stock + delta;
    if (nextQty < 0) return;
    
    setAdjustingId(item.id);
    try {
      await adjustStock({
        productVariantId: item.productVariantId,
        quantity: delta,
        reason: delta > 0 ? 'Aumento rápido por POS/Inventario' : 'Disminución rápida por POS/Inventario'
      });
      
      setInventory(prev => prev.map(inv => {
        if (inv.id === item.id) {
          return { ...inv, stock: nextQty };
        }
        return inv;
      }));

      setAdjustSuccessId(item.id);
      setTimeout(() => {
        setAdjustSuccessId(null);
      }, 1000);
    } catch (err) {
      console.error("Error al ajustar stock:", err);
    } finally {
      setAdjustingId(null);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && inventory.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium">Cargando existencias reales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Cabecera */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 md:text-3xl">
            Control de Inventario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Supervisa las existencias físicas de prendas por talla y color en tiempo real.</p>
        </div>
        
        {/* Controles de Filtro */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition shadow-xs cursor-pointer ${
              filterLowStock 
                ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300' 
                : 'bg-white border-slate-200 dark:bg-[#161b26] dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <AlertTriangle size={16} />
            {filterLowStock ? 'Ver Todo el Inventario' : 'Filtrar Stock Crítico (< 5)'}
          </button>
        </div>
      </div>

      {/* Buscador y Contenido */}
      {inventory.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161b26] p-12 text-center max-w-xl mx-auto space-y-5 animate-fade-in shadow-md">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-3xl mx-auto border border-amber-500/20 text-amber-500 animate-pulse">
            <Boxes size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Inventario Vacío
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">No hay existencias registradas en la base de datos de .NET. Ingresa prendas al catálogo para poblarlo.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Buscador */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#161b26] text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
            />
          </div>

          {/* VISTA DE INVENTARIO: Híbrido Table-to-Card */}

          {/* 1. MODO ESCRITORIO (Oculto en móvil < sm) */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] shadow-md">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4.5">Prenda / SKU</th>
                  <th className="px-6 py-4.5">Talla</th>
                  <th className="px-6 py-4.5">Color</th>
                  <th className="px-6 py-4.5 text-center">Stock Actual</th>
                  <th className="px-6 py-4.5 text-center">Ajuste Rápido</th>
                  <th className="px-6 py-4.5 text-right">Precio unitario</th>
                  <th className="px-6 py-4.5 text-center">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredInventory.map((item, idx) => {
                  const isCritical = item.stock < 5;
                  const isOut = item.stock === 0;
                  const isSuccess = adjustSuccessId === item.id;
                  const isAdjusting = adjustingId === item.id;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                        isOut 
                          ? 'bg-rose-500/10 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                          : isCritical 
                            ? 'bg-rose-500/5 dark:bg-rose-950/10 text-rose-500 dark:text-rose-350' 
                            : idx % 2 === 1 ? 'bg-slate-50/20' : 'bg-white dark:bg-[#161b26]'
                      }`}
                    >
                      {/* Prenda / SKU */}
                      <td className="px-6 py-4 font-semibold">
                        <div className="flex items-center gap-2.5">
                          {isCritical && (
                            <span className="h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-500 animate-pulse flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                              {item.productName}
                              {isCritical && (
                                <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                                  ⚠️ Stock Crítico
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Talla */}
                      <td className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400">{item.size}</td>

                      {/* Color */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.color}</td>

                      {/* Stock Actual */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${
                          isOut 
                            ? 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400' 
                            : isCritical 
                              ? 'bg-rose-500/5 text-rose-600 border-rose-500/10 dark:bg-rose-950/20 dark:text-rose-400' 
                              : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                        }`}>
                          {item.stock} uds
                        </span>
                      </td>

                      {/* Ajuste Rápido */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 p-1 rounded-xl">
                          <button
                            onClick={() => handleStepAdjust(item, -1)}
                            disabled={isOut || isAdjusting}
                            className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-8 text-center">{item.stock}</span>
                          <button
                            onClick={() => handleStepAdjust(item, 1)}
                            disabled={isAdjusting}
                            className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 active:scale-90 transition-all cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        ${item.price.toLocaleString('es-CO')}
                      </td>

                      {/* Feedback */}
                      <td className="px-6 py-4 text-center">
                        {isSuccess && (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-500 dark:text-emerald-400 animate-fade-in">
                            <Check size={14} className="mr-1" /> ¡Guardado!
                          </span>
                        )}
                        {isAdjusting && (
                          <RefreshCw className="animate-spin text-amber-500 mx-auto" size={14} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 2. MODO MÓVIL / CELULAR (Oculto en pantallas grandes < sm) */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filteredInventory.map(item => {
              const isCritical = item.stock < 5;
              const isOut = item.stock === 0;
              const isSuccess = adjustSuccessId === item.id;
              const isAdjusting = adjustingId === item.id;

              return (
                <div 
                  key={item.id} 
                  className={`rounded-2xl border p-5 shadow-sm space-y-4 bg-white dark:bg-[#161b26] transition-all duration-350 ${
                    isOut 
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/20' 
                      : isCritical 
                        ? 'border-rose-200 dark:border-rose-900/30 bg-rose-50/5 dark:bg-rose-950/10' 
                        : 'border-slate-200/60 dark:border-slate-800/60'
                  }`}
                >
                  {/* Encabezado Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                        {item.productName}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">SKU: {item.sku}</span>
                    </div>
                    
                    {/* Badge Stock Crítico */}
                    {isCritical && (
                      <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 border border-rose-500/25 animate-pulse">
                        ⚠️ Stock Crítico
                      </span>
                    )}
                  </div>

                  {/* Talla y Color */}
                  <div className="flex gap-2 text-xs border-y border-slate-100 dark:border-slate-850 py-2.5">
                    <div className="flex-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Talla</span>
                      <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 mt-1 inline-block">
                        {item.size}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Color</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium mt-1 inline-block">{item.color}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Precio Unit.</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 mt-1 inline-block">${item.price.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  {/* Ajustador de Stock en la Card Móvil */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs text-slate-450 dark:text-slate-400">Existencia:</span>
                      <span className={`ml-1.5 text-sm font-bold ${isCritical ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.stock} uds
                      </span>
                    </div>

                    {/* Controles de + / - táctiles */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
                      <button
                        onClick={() => handleStepAdjust(item, -1)}
                        disabled={isOut || isAdjusting}
                        className="h-8 w-8 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 active:scale-75 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-6 text-center">{item.stock}</span>
                      <button
                        onClick={() => handleStepAdjust(item, 1)}
                        disabled={isAdjusting}
                        className="h-8 w-8 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 active:scale-75 transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Feedback en móvil */}
                  {(isSuccess || isAdjusting) && (
                    <div className="flex justify-end text-xs font-bold pt-1">
                      {isSuccess && (
                        <span className="text-emerald-500 dark:text-emerald-400 flex items-center animate-fade-in">
                          <Check size={14} className="mr-1" /> ¡Guardado con éxito!
                        </span>
                      )}
                      {isAdjusting && (
                        <span className="text-amber-500 flex items-center gap-1.5">
                          <RefreshCw className="animate-spin" size={14} /> Guardando...
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default InventarioView;
