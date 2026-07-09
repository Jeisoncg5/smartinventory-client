import React, { useEffect, useState } from 'react';
import { getInvoices, getInvoiceByNumber, type Invoice } from '../../services/invoiceService';
import { FileText, Eye, Printer, X, Download, Search, RefreshCw, Calendar } from 'lucide-react';

const FacturasView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Detalle de factura seleccionada
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadData = async () => {
    setLoading(true);
    setSearchError('');
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    setIsSearching(true);
    setSearchError('');
    try {
      const data = await getInvoiceByNumber(searchQuery.trim().toUpperCase());
      if (data) {
        setInvoices([data]);
      } else {
        setInvoices([]);
        setSearchError(`No se encontró ninguna factura con el número "${searchQuery}".`);
      }
    } catch (err: any) {
      setSearchError('Error de red al consultar la factura.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const viewInvoiceDetail = async (invoiceNumber: string) => {
    try {
      const data = await getInvoiceByNumber(invoiceNumber);
      setSelectedInvoice(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium">Cargando comprobantes fiscales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 md:text-3xl">
            Historial de Facturas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consulta y descarga los comprobantes fiscales y ventas realizadas.</p>
        </div>
      </div>

      {/* Caja de Buscador Avanzado por Número de Factura */}
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por número de factura exacto (ej. FAC-000001)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-xl bg-slate-900 dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-500 dark:hover:bg-amber-500/80 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              {isSearching ? <RefreshCw className="animate-spin" size={14} /> : 'Buscar'}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadData();
                }}
                className="rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {searchError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2 rounded-xl animate-fade-in">
            {searchError}
          </p>
        )}
      </div>

      {/* Detalle de Factura Modal */}
      {selectedInvoice && (
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-6 shadow-xl max-w-2xl space-y-5 relative animate-fade-in text-slate-800 dark:text-slate-100 mx-auto">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                Factura Electrónica Validada
              </span>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mt-2">{selectedInvoice.invoiceNumber}</h3>
              <p className="text-xs text-slate-450 dark:text-slate-400 flex items-center gap-1 mt-1">
                <Calendar size={12} />
                {new Date(selectedInvoice.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
            
            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold border ${
              selectedInvoice.saleOrigin === 'CHATBOT' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:text-emerald-400' 
                : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:text-indigo-400'
            }`}>
              Canal: {selectedInvoice.saleOrigin === 'CHATBOT' ? '🤖 Chatbot AI' : '🔌 POS / Caja'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Cliente</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInvoice.customerName || 'Cliente Chatbot Anónimo'}</span>
            </div>
            {selectedInvoice.customerDocument && (
              <div>
                <span className="text-slate-400 block font-bold uppercase tracking-wider mb-0.5">Documento</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInvoice.customerDocument}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Artículos Facturados</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-850 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs">
              {selectedInvoice.items.map(item => (
                <div key={item.id} className="p-3.5 bg-white dark:bg-[#161b26] flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <div>
                    <p className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">{item.productName}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.2 rounded text-[9px] font-bold text-slate-600 dark:text-slate-350 border border-slate-200/50 dark:border-slate-800/50">Talla {item.size}</span>
                      <span className="bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold text-indigo-600 dark:text-indigo-400">{item.color}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-500 dark:text-slate-400">{item.quantity} x ${item.unitPrice.toLocaleString('es-CO')}</p>
                    <p className="font-bold text-slate-850 dark:text-slate-100 mt-0.5">${item.total.toLocaleString('es-CO')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-2 text-xs text-right max-w-xs ml-auto">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">${selectedInvoice.subTotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">IVA (19%):</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">${selectedInvoice.tax.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2 text-sm font-black text-slate-900 dark:text-slate-100">
              <span>Total Comprobante:</span>
              <span className="text-emerald-600 dark:text-emerald-450">${selectedInvoice.total.toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
              <Printer size={14} />
              Imprimir
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-indigo-650 text-white px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer">
              <Download size={14} />
              Descargar PDF
            </button>
          </div>
        </div>
      )}

      {/* LISTADO DE FACTURAS / ESTADO VACÍO */}
      {invoices.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161b26] p-12 text-center max-w-xl mx-auto space-y-5 animate-fade-in shadow-md">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-3xl mx-auto border border-amber-500/20 text-amber-500 animate-pulse">
            <FileText size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Sin Comprobantes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">No se encontraron facturas registradas en este canal o número de búsqueda.</p>
          </div>
        </div>
      ) : (
        <>
          {/* MODO ESCRITORIO (Oculto en móvil < sm) */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] shadow-md animate-fade-in">
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4.5">Número Factura</th>
                  <th className="px-6 py-4.5">Fecha Emisión</th>
                  <th className="px-6 py-4.5">Cliente</th>
                  <th className="px-6 py-4.5 text-center">Canal Origen</th>
                  <th className="px-6 py-4.5 text-right">Monto Total</th>
                  <th className="px-6 py-4.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {invoices.map((fac, idx) => {
                  const isChatbot = fac.saleOrigin === 'CHATBOT';
                  return (
                    <tr 
                      key={fac.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                        idx % 2 === 1 ? 'bg-slate-50/20' : 'bg-white dark:bg-[#161b26]'
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-1.5 text-slate-400 border border-slate-200/50 dark:border-slate-800/50">
                            <FileText size={16} />
                          </div>
                          {fac.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-450 dark:text-slate-400 font-medium">
                        {new Date(fac.createdAt).toLocaleDateString('es-CO')} {new Date(fac.createdAt).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-300 font-medium">{fac.customerName || 'Cliente Genérico'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          isChatbot 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                            : 'bg-indigo-500/10 text-indigo-650 border-indigo-500/20 dark:text-indigo-400'
                        }`}>
                          {isChatbot ? '🤖 Chatbot AI' : '🔌 Caja Física'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">
                        ${fac.total.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => viewInvoiceDetail(fac.invoiceNumber)}
                          className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye size={12} />
                          Detalles
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MODO MÓVIL / CELULAR (Oculto en pantallas grandes < sm) */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {invoices.map(fac => {
              const isChatbot = fac.saleOrigin === 'CHATBOT';
              return (
                <div key={fac.id} className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-md space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-1.5 text-slate-400 border border-slate-200/50 dark:border-slate-800/50">
                        <FileText size={16} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{fac.invoiceNumber}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(fac.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-950 dark:text-slate-100 text-sm">
                      ${fac.total.toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* Detalle Origen y Cliente */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Cliente</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{fac.customerName || 'Cliente Genérico'}</span>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${
                      isChatbot 
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:text-indigo-400'
                    }`}>
                      {isChatbot ? '🤖 Chatbot' : '🔌 POS'}
                    </span>
                  </div>

                  <button
                    onClick={() => viewInvoiceDetail(fac.invoiceNumber)}
                    className="w-full text-center rounded-xl bg-amber-500/10 border border-amber-500/20 py-2.5 text-xs font-bold text-amber-500 hover:bg-amber-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={12} />
                    Ver Detalle Factura
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default FacturasView;
