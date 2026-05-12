import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Truck, Heart } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { StoreConfig } from '../../types';

interface AboutProps {
  config: StoreConfig;
}

export default function About({ config }: AboutProps) {
  const stats = [
    { icon: <Sparkles className="w-6 h-6" />, label: "Premium Selection", desc: "Curated luxury beauty" },
    { icon: <ShieldCheck className="w-6 h-6" />, label: "100% Authentic", desc: "Original brands guaranteed" },
    { icon: <Truck className="w-6 h-6" />, label: "Fast Delivery", desc: "Local beauty at your door" },
    { icon: <Heart className="w-6 h-6" />, label: "Dedicated Support", desc: "Beauty experts at your service" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar onSearch={() => {}} config={config} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-pink-50 py-20 px-4 md:px-10 text-black text-center overflow-hidden relative border-b border-brand-border">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <div className="grid grid-cols-12 gap-1 w-full h-full">
                {[...Array(144)].map((_, i) => <div key={i} className="border border-brand-accent aspect-square" />)}
             </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tighter mb-6 text-black">Our Legacy</h1>
            <p className="text-xl md:text-2xl font-light italic text-brand-muted max-w-2xl mx-auto leading-relaxed">
              "Redefining beauty and confidence through authentic products and personalized care."
            </p>
          </motion.div>
        </section>

        {/* Content Section */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-black">Beyond Skin Deep</h2>
              <p className="text-lg text-brand-muted leading-relaxed font-serif">
                At Riya Cosmetics, we believe beauty is an experience of comfort and self-assurance. 
                What started as a small boutique has grown into a trusted destination for makeup enthusiasts and skincare devotees.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed font-serif">
                We specialize in bridging the gap between high-end luxury and absolute authenticity. Every palette, serum, and scent in our inventory is handpicked to ensure you receive nothing but the best.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-brand-border hover:border-brand-accent transition-colors shadow-sm">
                  <div className="text-brand-accent mb-4">{s.icon}</div>
                  <h3 className="font-bold text-sm mb-1 text-black">{s.label}</h3>
                  <p className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment */}
        <section className="bg-pink-50/50 py-20 px-4 md:px-10 border-y border-brand-border text-black">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xs uppercase font-bold tracking-[0.3em] text-brand-muted mb-8">Our Philosophy</h3>
            <p className="text-2xl font-display font-medium text-black leading-relaxed italic">
              "We don't just sell cosmetics; we empower your unique expression. Your glow is our mission, 
              and your satisfaction is our tradition."
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-brand-border py-10 px-6 text-center text-xs text-brand-muted uppercase tracking-[0.2em]">
        &copy; {new Date().getFullYear()} Riya Cosmetics &bull; Authenticity & Elegance
      </footer>
    </div>
  );
}
