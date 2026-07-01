import { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, MessageSquare, ExternalLink, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { subscribeToOrders, Order } from '../firebaseService';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerUid: string;
  customerName: string;
  onLogout?: () => void;
}

const getStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 animate-pulse" />
          Delivered
        </span>
      );
    case 'Dispatched':
      return (
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          <Truck className="w-3 h-3 text-indigo-600" />
          Dispatched
        </span>
      );
    case 'Processing':
      return (
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          <Clock className="w-3 h-3 text-amber-600 animate-spin" />
          Processing
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          <AlertCircle className="w-3 h-3 text-red-600" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">
          <Clock className="w-3 h-3 text-sky-600 animate-pulse" />
          Pending
        </span>
      );
  }
};

export default function MyOrdersModal({ isOpen, onClose, customerUid, customerName, onLogout }: MyOrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !customerUid) return;

    setLoading(true);
    const unsubscribe = subscribeToOrders(
      (orderList) => {
        setOrders(orderList);
        setLoading(false);
      },
      customerUid,
      (error) => {
        console.error('Failed to subscribe to customer orders:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [isOpen, customerUid]);

  if (!isOpen) return null;

  const handleSendWhatsAppSupport = (order: Order) => {
    const message = `Hello, I wanted to inquire about the status of my Order ID: *${order.id}*.\nName: ${order.customerName}\nStatus: ${order.status}\nTotal: ₹${order.totalAmount.toLocaleString('en-IN')}`;
    const url = `https://wa.me/918319696985?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[var(--theme-accent)]" />
              <div>
                <span className="text-sm font-extrabold uppercase tracking-widest text-stone-900 block leading-tight">
                  My Orders / मेरे ऑर्डर
                </span>
                <span className="text-[10px] text-stone-400 font-mono tracking-wider">
                  Logged in as {customerName}
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orders list area */}
          <div className="flex-grow overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="flex items-center gap-1.5 justify-center">
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full animate-bounce" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-mono font-bold">
                  Loading order history...
                </span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-stone-200 mb-4 animate-pulse" />
                <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-1">
                  No Orders Placed Yet
                </h4>
                <p className="text-xs text-stone-400 font-medium max-w-[240px] leading-relaxed mx-auto">
                  Your luxury cosmetics order history is empty. Go ahead and add formulations to your bag!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-stone-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--theme-accent)] transition-all cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border border-stone-200 hover:border-stone-300 transition-all p-4 bg-stone-50/30 space-y-3"
                  >
                    {/* Top Order details */}
                    <div className="flex justify-between items-start border-b border-stone-100 pb-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block mb-0.5">Order ID</span>
                        <span className="text-xs font-bold text-stone-900 font-mono select-all">#{order.id}</span>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={`${order.id}-item-${idx}`} className="flex justify-between text-xs">
                          <span className="text-stone-700 font-medium max-w-[75%] truncate">
                            {item.name} {item.qtyVal ? `(${item.qtyVal} ${item.qtyUnit})` : ''} <span className="text-stone-400 font-mono text-[11px]">x{item.orderedQty}</span>
                          </span>
                          <span className="font-semibold text-stone-900 font-mono">₹{(item.price * item.orderedQty).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer summary */}
                    <div className="flex justify-between items-center border-t border-stone-100 pt-3 mt-2.5 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-right flex items-baseline gap-1.5">
                        <span className="text-[10px] uppercase font-semibold text-stone-400">Total:</span>
                        <span className="text-sm font-bold text-stone-950 font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100/50">
                      <a
                        href={`#/invoice/${order.id}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 py-2 border border-stone-200 hover:border-stone-900 bg-white text-stone-700 hover:text-stone-900 font-bold text-[9px] uppercase tracking-wider transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> Invoice
                      </a>
                      <button
                        onClick={() => handleSendWhatsAppSupport(order)}
                        className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" /> Support
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer note & Logout option */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-medium text-center sm:text-left">
              Riya Cosmetics Order Tracking System
            </p>
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-sm"
              >
                Log Out / लॉग आउट
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
