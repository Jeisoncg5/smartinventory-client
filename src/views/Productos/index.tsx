import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, type Product } from '../../services/productService';
import { getCategories, type Category } from '../../services/catalogService';
import { Plus, ToggleLeft, ToggleRight, Sparkles, X, Tag } from 'lucide-react';

const ProductosView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const prodData = await getProducts();
        const catData = await getCategories();
        setProducts(prodData);
        setCategories(catData);
        if (catData.length > 0) {
          setNewProductCategory(catData[0].id);
        }
        const states: Record<string, boolean> = {};
        prodData.forEach(p => {
          states[p.id] = true;
        });
        setActiveStates(states);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleProductActive = (id: string) => {
    setActiveStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || newProductPrice <= 0 || !newProductCategory) {
      setSubmitError('Por favor completa todos los campos obligatorios.');
      return;
    }
    setSubmitError('');
    try {
      const created = await createProduct({
        name: newProductName,
        description: newProductDesc,
        price: Number(newProductPrice),
        categoryId: newProductCategory
      });
      const catObj = categories.find(c => c.id === created.categoryId);
      created.categoryName = catObj ? catObj.name : 'Desconocida';

      setProducts([created, ...products]);
      setActiveStates(prev => ({ ...prev, [created.id]: true }));
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice(0);
      setShowForm(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al crear el producto.');
    }
  };

  const getProductStock = (productId: string) => {
    switch (productId) {
      case 'prod-1': return 5;
      case 'prod-2': return 17;
      case 'prod-3': return 22;
      case 'prod-4': return 0;
      default: return 10;
    }
  };

  const getProductSpecs = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('baby tee') || lower.includes('top')) {
      return {
        sizes: ['S', 'M', 'L'],
        colors: ['Blanco', 'Negro', 'Rojo'],
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('camisa') || lower.includes('blusa')) {
      return {
        sizes: ['S', 'M', 'L'],
        colors: ['Blanco', 'Beige'],
        image: 'https://images.unsplash.com/photo-1620012253295-c05518e99309?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('cargo') || lower.includes('falda')) {
      return {
        sizes: ['S', 'M', 'L'],
        colors: ['Negro', 'Gris', 'Verde'],
        image: 'https://images.unsplash.com/photo-1506629905607-d9a4877d2c64?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('jean')) {
      return {
        sizes: ['S', 'M', 'L'],
        colors: ['Azul', 'Gris'],
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('bomber') || lower.includes('chaqueta') || lower.includes('blazer')) {
      return {
        sizes: ['M', 'L', 'XL'],
        colors: ['Verde', 'Negro', 'Gris'],
        image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('vestido')) {
      return {
        sizes: ['S', 'M'],
        colors: ['Rojo', 'Negro', 'Blanco'],
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('tenis') || lower.includes('zapato') || lower.includes('sandalia')) {
      return {
        sizes: ['38', '39', '40', '41'],
        colors: ['Blanco', 'Beige', 'Negro'],
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop'
      };
    }
    if (lower.includes('bolso') || lower.includes('gorra')) {
      return {
        sizes: ['XS'],
        colors: ['Negro', 'Rojo', 'Beige', 'Azul'],
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop'
      };
    }
    return {
      sizes: ['S', 'M', 'L'],
      colors: ['Negro', 'Blanco', 'Gris'],
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'
    };
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-500">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="text-sm font-medium">Montando el escaparate de No Es Shein, Pero Casi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative overflow-visible">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center relative">
        <div className="relative overflow-visible z-0">
          <div className="text-slate-200/40 dark:text-slate-800/15 font-black text-6xl sm:text-7xl md:text-8xl absolute -top-8 sm:-top-10 md:-top-12 -left-3 sm:-left-5 -z-10 select-none pointer-events-none tracking-widest font-serif">
            CASI
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 md:text-3xl">
            No Es Shein, Pero Casi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tendencias virales, catalogo amplio y looks que se agotan rapido.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer z-10"
        >
          <Plus size={16} />
          {showForm ? 'Cancelar' : 'Anadir Prenda'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-[#161b26] p-6 shadow-xl space-y-5 max-w-3xl animate-fade-in mx-auto relative z-10">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <Sparkles className="text-amber-500 animate-pulse" size={18} />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Subir nueva prenda al drop</h3>
          </div>

          {submitError && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-xl">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre de la prenda *</label>
              <input type="text" placeholder="Ej. Mini falda cargo" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full rounded-xl border border-slate-200/40 dark:border-slate-800/65 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#161b26] focus:border-amber-500 focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria *</label>
              <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="w-full rounded-xl border border-slate-200/40 dark:border-slate-800/65 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#161b26] focus:border-amber-500 focus:outline-none transition-all bg-white dark:bg-[#161b26]" required>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Precio base ($ COP) *</label>
              <input type="number" placeholder="99000" value={newProductPrice || ''} onChange={e => setNewProductPrice(Number(e.target.value))} className="w-full rounded-xl border border-slate-200/40 dark:border-slate-800/65 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#161b26] focus:border-amber-500 focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Descripcion corta</label>
              <input type="text" placeholder="Ej. Drop limitado con vibra Y2K" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} className="w-full rounded-xl border border-slate-200/40 dark:border-slate-800/65 bg-slate-50/50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-[#161b26] focus:border-amber-500 focus:outline-none transition-all" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">Cancelar</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-95 cursor-pointer">Guardar prenda</button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 dark:border-slate-800 bg-[#fcfbf9] dark:bg-[#161b26] p-12 text-center max-w-xl mx-auto space-y-5 animate-fade-in shadow-md relative z-10">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-3xl mx-auto border border-amber-500/20 text-amber-500">
            <Tag size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">El drop esta vacio</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sube la primera prenda y convierte esta tienda en el "no es Shein, pero casi" favorito.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5">
            <Plus size={14} />
            Anadir prenda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {products.map((p, idx) => {
            const isActive = activeStates[p.id] !== false;
            const specs = getProductSpecs(p.name);
            const stockCount = getProductStock(p.id);

            return (
              <div key={p.id} style={{ animationDelay: `${idx * 80}ms` }} className={`relative bg-[#fcfbf9] dark:bg-[#161b26] p-4.5 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between h-full group text-center animate-fade-in-up rounded-tl-3xl rounded-br-3xl rounded-tr-xs rounded-bl-xs ${!isActive ? 'opacity-60' : ''}`}>
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => toggleProductActive(p.id)} className="cursor-pointer text-slate-450 hover:text-amber-500 transition-colors">
                    {isActive ? <ToggleRight className="text-amber-500 dark:text-amber-400" size={24} /> : <ToggleLeft className="text-slate-300 dark:text-slate-700" size={24} />}
                  </button>
                </div>

                <div>
                  <div className="relative h-48 w-full rounded-tl-2xl rounded-br-2xl rounded-tr-xs rounded-bl-xs overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30">
                    <img src={specs.image} alt={p.name} className="object-cover w-full h-48 rounded-tl-2xl rounded-br-2xl rounded-tr-xs rounded-bl-xs transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  </div>

                  <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm sm:text-base mt-4 line-clamp-1 group-hover:text-amber-500 transition-colors duration-300">{p.name}</h3>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-1">{p.categoryName || categories.find(c => c.id === p.categoryId)?.name || 'General'}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">${p.price.toLocaleString('es-CO')} COP</p>
                </div>

                <div className="mt-3">
                  {stockCount > 0 ? <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">En stock</span> : <span className="inline-flex items-center text-[10px] font-bold text-rose-600 dark:text-rose-455 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/10">Agotado</span>}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/30 dark:border-slate-800/40 overflow-hidden">
                  <button onClick={() => setSelectedProduct(p)} className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 active:scale-95 text-white py-2.5 text-xs font-bold transition-all duration-300 transform translate-y-1.5 group-hover:translate-y-0 hover:shadow-md hover:shadow-amber-500/10 cursor-pointer block">Ver detalles</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedProduct && (() => {
        const specs = getProductSpecs(selectedProduct.name);
        const stockCount = getProductStock(selectedProduct.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setSelectedProduct(null)} />

            <div className="relative bg-[#fcfbf9] dark:bg-[#161b26] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm p-6 shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800/60 animate-fade-in space-y-5 text-slate-800 dark:text-slate-100">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                <X size={18} />
              </button>

              <div className="text-center space-y-3">
                <div className="h-28 w-full rounded-tl-2xl rounded-br-2xl rounded-tr-xs rounded-bl-xs overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-xs relative">
                  <img src={specs.image} alt={selectedProduct.name} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-slate-950/20" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {selectedProduct.categoryName || categories.find(c => c.id === selectedProduct.categoryId)?.name || 'General'}
                  </span>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mt-2">{selectedProduct.name}</h3>
                  <p className="text-sm font-semibold text-slate-400 mt-1">${selectedProduct.price.toLocaleString('es-CO')} COP</p>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Descripcion</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/40">
                  {selectedProduct.description || 'Prenda viral, combinable y lista para convertirse en tu nuevo look favorito.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Tallas</h4>
                  <div className="flex flex-wrap gap-1">
                    {['XS', 'S', 'M', 'L', 'XL', '38', '39', '40', '41'].map(sz => {
                      const isAvailable = specs.sizes.includes(sz);
                      return (
                        <span key={sz} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isAvailable ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600'}`}>
                          {sz}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Colores</h4>
                  <div className="flex flex-wrap gap-1">
                    {specs.colors.map(col => (
                      <span key={col} className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-500">{col}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
                <div>
                  <span className="text-slate-400">Inventario disponible:</span>
                  <span className={`ml-1.5 font-bold ${stockCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {stockCount > 0 ? `${stockCount} unidades` : 'Agotado'}
                  </span>
                </div>

                <button onClick={() => setSelectedProduct(null)} className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white cursor-pointer transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProductosView;
