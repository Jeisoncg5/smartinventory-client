import React, { useEffect, useRef, useState } from 'react';
import { sendChatMessage, type ChatState } from '../../services/chatService';
import { AlertCircle, Bot, CheckCircle, SearchX, Send, User, X } from 'lucide-react';

interface UIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  state?: ChatState;
  invoiceNumber?: string;
}

interface ChatbotViewProps {
  compact?: boolean;
  onClose?: () => void;
}

const ChatbotView: React.FC<ChatbotViewProps> = ({ compact = false, onClose }) => {
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'Hola. Puedes preguntarme por una prenda, color o talla, y te ayudo a comprarla usando el inventario real.',
      timestamp: new Date(),
      state: 'SEARCHING_PRODUCT'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Math.floor(Math.random() * 100000)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        sessionId,
        message: textToSend
      });

      const aiMsg: UIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.response,
        timestamp: new Date(),
        state: response.state,
        invoiceNumber: response.invoiceNumber
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Ocurrio un error inesperado al procesar tu solicitud.';

      const errorMsg: UIMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error del servidor: ${errorMessage}`,
        timestamp: new Date(),
        state: 'ERROR'
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const shellClasses = compact
    ? 'fixed bottom-24 right-4 z-40 flex h-[min(78vh,640px)] w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md transition-colors duration-300 dark:border-slate-800/70 dark:bg-[#161b26]/95 md:bottom-28 md:right-6'
    : 'flex flex-col h-[calc(100vh-140px)] max-h-[750px] rounded-3xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#161b26]/90 shadow-xl overflow-hidden backdrop-blur-md transition-colors duration-300';

  return (
    <div className={shellClasses}>
      <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white border-b border-slate-800/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-2.5 shadow-md flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">Asistente Virtual Premium</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-300 font-medium">En linea | FastAPI + .NET</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
            Moda Assist
          </span>
          {compact && onClose && (
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              aria-label="Cerrar chatbot"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/50 dark:bg-[#0b0f19]/30">
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} items-start gap-3`}>
              {isAI && (
                <div className="rounded-full bg-white dark:bg-[#1e2536] border border-slate-200/60 dark:border-slate-800/60 p-2 text-amber-500 flex-shrink-0 shadow-sm mt-0.5">
                  <Bot size={16} />
                </div>
              )}

              <div className="max-w-[85%] sm:max-w-[78%] space-y-3">
                <div className={`rounded-2xl px-4 py-3 text-sm shadow-xs leading-relaxed ${
                  isAI
                    ? 'bg-slate-100 border border-slate-250 dark:bg-[#1e2536] dark:border-slate-800/60 text-slate-800 dark:text-slate-100 rounded-tl-none'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-tr-none shadow-md animate-fade-in'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] text-right mt-1.5 ${isAI ? 'text-slate-400 dark:text-slate-500' : 'text-amber-100'}`}>
                    {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isAI && msg.state === 'WAITING_CONFIRMATION' && (
                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-[#161b26] p-4 shadow-md space-y-3 animate-fade-in max-w-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      El pedido ya fue validado contra el inventario real. Si confirmas, FastAPI registrara la venta en .NET y generara la factura.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        onClick={() => handleSendMessage('si')}
                        className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 active:scale-95 transition-all py-2.5 px-4 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleSendMessage('no')}
                        className="flex-1 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 active:scale-95 transition-all py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {isAI && msg.state === 'PRODUCT_NOT_FOUND' && (
                  <div className="rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 p-4 shadow-xs flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300 max-w-sm animate-fade-in">
                    <SearchX className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <span className="font-bold">No encontre coincidencias</span>
                      <p className="mt-1 text-[11px] text-amber-800/90 dark:text-amber-300/90">
                        Intenta con otro nombre, color o talla. Ejemplo: pantalon negro talla 32.
                      </p>
                    </div>
                  </div>
                )}

                {isAI && msg.state === 'ERROR' && (
                  <div className="rounded-2xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 p-4 shadow-xs flex items-start gap-3 text-xs text-rose-900 dark:text-rose-300 max-w-sm animate-fade-in">
                    <AlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <span className="font-bold">Hubo un problema en la integracion</span>
                      <p className="mt-1 text-[11px] text-rose-800/90 dark:text-rose-300/90">
                        Revisa que el backend .NET y FastAPI esten arriba, luego intenta de nuevo.
                      </p>
                    </div>
                  </div>
                )}

                {isAI && msg.state === 'SALE_COMPLETED' && (
                  <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-xs flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-450 animate-pulse max-w-sm">
                    <CheckCircle className="text-emerald-600 flex-shrink-0" size={18} />
                    <div>
                      <span className="font-bold">Factura Autorizada</span>
                      <p className="text-[10px] text-emerald-650 mt-0.5">
                        Comprobante: <strong className="font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">{msg.invoiceNumber}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="rounded-full bg-slate-900 dark:bg-slate-800 p-2 text-white mt-0.5 flex-shrink-0 shadow-sm">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start items-center gap-3">
            <div className="rounded-full bg-white dark:bg-[#1e2536] border border-slate-200/60 dark:border-slate-800/60 p-2 text-amber-500 flex-shrink-0 animate-bounce shadow-sm">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white border border-slate-250 dark:bg-[#1e2536] dark:border-slate-800 text-slate-400 text-xs shadow-xs flex items-center gap-2">
              <span className="flex space-x-1">
                <span className="h-1.5 w-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-slate-450 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-400">Consultando inventario real...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-[#161b26] border-t border-slate-100 dark:border-slate-850 shadow-lg relative">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xs focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all"
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ej: Busco una camiseta negra talla S"
            className="flex-1 bg-transparent border-0 px-3 py-2 text-sm focus:outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="rounded-xl bg-slate-900 dark:bg-slate-800 text-white p-2.5 hover:bg-amber-500 dark:hover:bg-amber-500 hover:shadow-md active:scale-95 transition-all flex-shrink-0 cursor-pointer disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotView;