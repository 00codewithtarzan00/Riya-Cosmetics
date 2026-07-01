import { useState, useEffect } from 'react';
import { dbGetOrder, Order } from '../firebaseService';
import { Sparkles, Printer, ArrowLeft, CheckCircle2, ShoppingBag, Phone, MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

interface InvoicePageProps {
  orderId: string;
  onBackToShop: () => void;
}

export default function InvoicePage({ orderId, onBackToShop }: InvoicePageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await dbGetOrder(orderId);
        if (data) {
          setOrder(data);
        } else {
          setError('Order not found. Please verify the order ID.');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to fetch the order details.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div id="invoice-loading" className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[var(--theme-bg)] py-12 px-4">
        <div className="w-10 h-10 border-4 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-stone-500">Loading Digital Invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div id="invoice-error" className="min-h-[70vh] flex flex-col items-center justify-center gap-6 bg-[var(--theme-bg)] py-12 px-4 max-w-md mx-auto text-center">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-full">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-wider uppercase mb-2">Invoice Error</h2>
          <p className="text-sm text-stone-600 mb-6">{error || 'Unable to load invoice.'}</p>
        </div>
        <button
          onClick={onBackToShop}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--theme-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--theme-accent-hover)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>
      </div>
    );
  }

  const dateFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Calculate status colors
  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Dispatched': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div id="invoice-view-container" className="min-h-screen bg-stone-50/50 py-8 px-4 sm:px-6 md:py-14 select-none">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation & Print Actions (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 print:hidden">
          <button
            onClick={onBackToShop}
            className="flex items-center justify-center gap-2 self-start px-4 py-2 bg-white border border-[var(--theme-border)] text-xs font-bold uppercase text-stone-700 hover:text-stone-900 hover:border-stone-400 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--theme-accent-hover)] transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        {/* Invoice Body Card */}
        <div id="invoice-sheet" className="bg-white border border-[var(--theme-border)] p-6 sm:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative print:border-0 print:shadow-none print:p-0">
          
          {/* Aesthetic design element */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--theme-accent)] via-rose-400 to-[var(--theme-accent)] print:hidden"></div>

          {/* Invoice Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6 border-b border-stone-200 pb-8 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-black uppercase tracking-[0.22em] text-[#1A1A1A] font-sans">
                  Riya <span className="font-serif italic text-[var(--theme-accent)] font-semibold lowercase">Cosmetics</span>
                </span>
                <Sparkles className="w-4 h-4 text-[var(--theme-accent)] animate-pulse print:hidden" />
              </div>
              <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">Premium Aesthetics & Styling</p>
              <div className="text-xs text-stone-500 mt-3 font-medium space-y-0.5">
                <p>Luxurious Cosmetics & Bridal Solutions</p>
                <p>Support / Contact: 91+ Customer Helpline</p>
              </div>
            </div>

            <div className="md:text-right flex flex-col md:items-end justify-between">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-wider uppercase">INVOICE</h1>
                <p className="text-xs font-mono text-stone-500 uppercase mt-1">Order ID: <span className="text-stone-800 font-bold select-all">{order.id}</span></p>
              </div>
              
              <div className={`mt-4 md:mt-0 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest border self-start md:self-auto ${getStatusClass(order.status)}`}>
                {order.status}
              </div>
            </div>
          </div>

          {/* Client & Shipping Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-stone-200">
            <div>
              <h3 className="text-[10px] font-mono tracking-widest text-stone-400 uppercase mb-3">BILLED TO</h3>
              <div className="space-y-2">
                <p className="text-sm font-bold text-stone-900 font-sans">{order.customerName}</p>
                <p className="text-xs text-stone-600 flex items-center gap-2 font-medium">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  {order.customerPhone}
                </p>
                <p className="text-xs text-stone-600 flex items-start gap-2 font-medium leading-relaxed max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                  {order.customerAddress}
                </p>
              </div>
            </div>

            <div className="md:text-right flex flex-col justify-start">
              <h3 className="text-[10px] font-mono tracking-widest text-stone-400 uppercase mb-3">INVOICE DETAILS</h3>
              <div className="space-y-2 text-xs font-medium text-stone-600 md:items-end">
                <div className="flex justify-between md:justify-end gap-4">
                  <span className="text-stone-400">Date Ordered:</span>
                  <span className="text-stone-800 font-bold">{dateFormatted}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-4">
                  <span className="text-stone-400">Payment Mode:</span>
                  <span className="text-stone-800 font-bold uppercase tracking-wider text-[10px]">Cash on Delivery (COD)</span>
                </div>
                <div className="flex justify-between md:justify-end gap-4">
                  <span className="text-stone-400">Currency:</span>
                  <span className="text-stone-800">INR (₹)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Itemized Breakdown Table */}
          <div className="py-8">
            <h3 className="text-[10px] font-mono tracking-widest text-stone-400 uppercase mb-4">ITEMIZED BREAKDOWN</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-200 text-[10px] font-mono tracking-wider uppercase text-stone-500">
                    <th className="py-3 font-semibold">Item & Size</th>
                    <th className="py-3 text-right font-semibold">Rate</th>
                    <th className="py-3 text-center font-semibold">Quantity</th>
                    <th className="py-3 text-right font-semibold">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {order.items.map((item, idx) => {
                    const hasSize = item.qtyVal && item.qtyUnit;
                    const subtotal = item.price * item.orderedQty;
                    return (
                      <tr key={idx} className="text-stone-800 font-medium">
                        <td className="py-4">
                          <span className="font-bold text-stone-900 block">{item.name}</span>
                          {hasSize && (
                            <span className="inline-block bg-stone-100 text-stone-600 font-mono text-[9px] px-1.5 py-0.5 rounded-sm mt-1 uppercase">
                              Pack size: {item.qtyVal} {item.qtyUnit}
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="py-4 text-center font-mono">{item.orderedQty}</td>
                        <td className="py-4 text-right font-mono font-bold text-stone-950">₹{subtotal.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total Summary Row */}
            <div className="border-t-2 border-stone-200 mt-6 pt-6 flex flex-col items-end">
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-stone-500">
                  <span>Cart Subtotal:</span>
                  <span className="font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-stone-500">
                  <span>Shipping & Delivery:</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[10px] tracking-wider">FREE</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-stone-200 pt-3 text-sm font-black text-stone-950 uppercase tracking-wider">
                  <span>GRAND TOTAL:</span>
                  <span className="font-mono text-base text-[var(--theme-accent)]">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thank You & Footer */}
          <div className="border-t border-stone-200 pt-8 mt-4 text-center">
            <div className="inline-flex items-center justify-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">Thank You for Shopping with Riya Cosmetics!</p>
            </div>
            <p className="text-[10px] text-stone-400 font-medium leading-relaxed max-w-md mx-auto">
              This is a computer-generated digital invoice. Thank you very much for choosing us.
            </p>
          </div>

        </div>

        {/* Back To Shop footer banner */}
        <div className="mt-6 text-center print:hidden">
          <p className="text-[10px] text-stone-400 font-mono tracking-widest uppercase">
            Riya Cosmetics Billing System • Secure & Automated
          </p>
        </div>

      </div>
    </div>
  );
}
