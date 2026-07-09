import React, { useEffect, useState } from 'react';
import { getSales, createSale, type Sale } from '../../services/saleService';
import { getInventory, type InventoryItem } from '../../services/inventoryService';
import { ShoppingCart, Plus, Minus, Trash2, Check, Search, Printer, FileText, ShoppingBag } from 'lucide-react';

interface CartItem {
  inventoryItem: InventoryItem;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

const VentasView: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos del Cliente
  const [customerName, setCustomerName] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Control de Modal de Venta Exitosa
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState('');
  const [createdSaleTotal, setCreatedSaleTotal] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const salesData = await getSales();
        const invData = await getInventory();
        setSales(salesData);
        setInventory(invData.filter(i => i.stock > 0));
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const addToCart = (item: InventoryItem) => {
    const existing = cart.find(c => c.inventoryItem.id === item.id);
    if (existing) {
      if (existing.quantity >= item.stock) return;
      setCart(cart.map(c => c.inventoryItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { 
        inventoryItem: item, 
        quantity: 1,
        selectedSize: item.size,
        selectedColor: item.color
      }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.inventoryItem.id === id) {
        const nextQty = c.quantity + delta;
        if (nextQty <= 0) return null;
        if (nextQty > c.inventoryItem.stock) return c;
        return { ...c, quantity: nextQty };
      }
      return c;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.inventoryItem.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.inventoryItem.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const saleRequest = {
        saleOriginId: 1,
        items: cart.map(item => ({
          productVariantId: item.inventoryItem.productVariantId,
          quantity: item.quantity
        }))
      };

      const result = await createSale(saleRequest);
      setCreatedInvoiceNumber(result.invoiceNumber || 'FAC-000XXX');
      setCreatedSaleTotal(result.total);
      setShowSuccessModal(true);
      
      setCart([]);
      setCustomerName('');
      setCustomerDoc('');
      
      const updatedInv = await getInventory();
      setInventory(updatedInv.filter(i => i.stock > 0));
      setSales([result, ...sales]);
    } catch (err) {
      console.error("Error procesando checkout:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductSpecs = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('chaqueta')) {
      return {
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop',
        emoji: '🧥'
      };
    } else if (lower.includes('jean')) {
      return {
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop',
        emoji: '👖'
      };
    } else if (lower.includes('camisa')) {
      return {
        image: 'https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=600&auto=format&fit=crop',
        emoji: '👔'
      };
    } else {
      return {
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
        emoji: '👕'
      };
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 md:text-3xl">
          Punto de Venta (POS)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registra y cobra ventas físicas en la boutique con un solo toque.</p>
      </div>

      {inventory.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#161b26] p-12 text-center max-w-xl mx-auto space-y-5 animate-fade-in shadow-md">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-3xl mx-auto border border-amber-500/20 text-amber-500 animate-pulse">
            <ShoppingBag size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Escaparate sin Existencias
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">No hay existencias activas en el inventario para facturar. Añade stock primero.</p>
          </div>
        </div>
      ) : (
        /* POS Layout */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Columna Izquierda: Catálogo Visual */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Catálogo de Venta</h3>
                {/* Buscador */}
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar prenda..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Grid de Cards de Catalogo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[580px] overflow-y-auto pr-1">
                {filteredInventory.map(item => {
                  const specs = getProductSpecs(item.productName);
                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-3.5 hover:border-amber-500/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/40 active:scale-98 transition-all cursor-pointer flex flex-col justify-between h-48 shadow-xs"
                    >
                      {/* Efecto Escaparate */}
                      <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img 
                          src={specs.image} 
                          alt={item.productName} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                        <span className="absolute top-2 right-2 rounded-full bg-slate-950/40 border border-slate-800/30 px-2 py-0.5 text-[8px] font-bold text-slate-200">
                          Stock: {item.stock}
                        </span>
                      </div>

                      <div className="mt-2">
                        <h4 className="font-extrabold text-slate-850 dark:text-slate-100 text-xs truncate group-hover:text-amber-500 transition-colors">
                          {item.productName}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-slate-400 font-mono">{item.sku}</span>
                          <span className="font-extrabold text-slate-900 dark:text-slate-100">
                            ${item.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-850 text-[9px] font-bold">
                        <span className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.2 rounded text-slate-600 dark:text-slate-350">{item.size}</span>
                        <span className="bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded text-indigo-600 dark:text-indigo-400">{item.color}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredInventory.length === 0 && (
                  <div className="col-span-full py-16 text-center text-xs text-slate-400">
                    No se encontraron prendas disponibles con ese filtro.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Carrito de Compras */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
            <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-5 shadow-md flex flex-col justify-between h-full space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-slate-700 dark:text-slate-300" size={18} />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Orden de Compra</h3>
                </div>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 text-xs font-bold text-amber-500">
                  {cart.length} prendas
                </span>
              </div>

              {/* Items del Carrito */}
              <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-850 max-h-[300px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.inventoryItem.id} className="py-3 flex items-center justify-between text-xs animate-fade-in">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{item.inventoryItem.productName}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.2 rounded text-[9px] font-bold text-slate-700 dark:text-slate-350">
                          {item.selectedSize}
                        </span>
                        <span className="bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.2 rounded text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                          {item.selectedColor}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-900 dark:text-slate-100 font-extrabold block mt-2">
                        ${(item.inventoryItem.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>

                    {/* Controles de Cantidad */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 rounded-lg p-1 bg-slate-50/50 dark:bg-slate-900">
                        <button
                          onClick={() => updateCartQty(item.inventoryItem.id, -1)}
                          className="p-0.5 text-slate-400 hover:text-rose-600 active:scale-75 transition-all cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[18px] text-center text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.inventoryItem.id, 1)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 active:scale-75 transition-all cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.inventoryItem.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-16 text-center text-xs text-slate-400">
                    El carrito está vacío. Agrega prendas para facturar.
                  </div>
                )}
              </div>

              {/* Total y Checkout */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-4">
                <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                  <span className="text-sm font-semibold">Total a Cobrar:</span>
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">${cartTotal.toLocaleString('es-CO')} COP</span>
                </div>

                {cart.length > 0 && (
                  <form onSubmit={handleCheckout} className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre del Cliente</label>
                      <input
                        type="text"
                        placeholder="Ej. Carolina Gómez"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none bg-slate-50/30 dark:bg-slate-900 focus:bg-white dark:focus:bg-[#161b26] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Documento de Identidad</label>
                      <input
                        type="text"
                        placeholder="Ej. 1045230987"
                        value={customerDoc}
                        onChange={e => setCustomerDoc(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none bg-slate-50/30 dark:bg-slate-900 focus:bg-white dark:focus:bg-[#161b26] transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 active:scale-95 transition-all py-3.5 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-200"
                    >
                      {isSubmitting ? 'Facturando...' : '⚡ Completar Venta'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* MODAL DE VENTA EXITOSA */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          />

          <div className="relative bg-white dark:bg-[#161b26] rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800/60 animate-fade-in text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
              <Check size={26} />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">¡Venta Registrada!</h3>
              <p className="text-xs text-slate-400">Comprobante guardado con éxito en .NET.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-4 rounded-2xl space-y-1 text-xs text-left">
              <div className="flex justify-between text-slate-455 dark:text-slate-400">
                <span>Número Factura:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{createdInvoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-455 dark:text-slate-400">
                <span>Total Cobrado:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">${createdSaleTotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-slate-455 dark:text-slate-400">
                <span>Canal:</span>
                <span className="font-bold text-indigo-500 dark:text-indigo-400 uppercase">POS (Caja Física)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white py-2.5 px-4 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText size={14} />
                Ver Factura
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 px-3 py-2.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center"
              >
                <Printer size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VentasView;
