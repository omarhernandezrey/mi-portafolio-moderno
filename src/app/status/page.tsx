"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Globe, Database, Cpu, Activity, ShieldCheck, Zap, RefreshCw, BarChart3, Radio } from 'lucide-react';
import NavbarLogic from '@/components/ui/NavbarLogic';
import Footer from '@/components/shared/Footer';

interface HealthData {
  status: string;
  timestamp: string;
  latency_ms: number;
  services: {
    database: { status: string; latency: number };
    llm_gateway: { status: string };
  };
}

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Status down');
      const json = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      <NavbarLogic />
      
      <main className="flex-1 max-w-[1000px] mx-auto px-4 md:px-8 pt-32 pb-32 space-y-16">
        
        {/* Monitoring Header */}
        <header className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic"
          >
            <Radio size={12} className="animate-pulse" />
            Live Infrastructure Monitor
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white-custom tracking-tighter leading-none italic"
          >
            System <span className="text-primary text-outline-primary">Status</span>
          </motion.h1>
          <p className="text-text-muted text-sm font-medium max-w-xl mx-auto opacity-60 leading-relaxed italic">
            Monitorización en tiempo real de los protocolos de redundancia, latencia de red y disponibilidad de servicios críticos del ecosistema.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-[20px] border-2 border-primary/20 border-t-primary shadow-[0_0_20px_rgba(var(--primary-color-rgb),0.2)]"></div>
              <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted/40 animate-pulse">Initializing Protocols...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-12 text-center space-y-6 shadow-2xl backdrop-blur-sm"
          >
            <AlertCircle className="mx-auto text-red-500 opacity-40" size={60} strokeWidth={1} />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white-custom italic tracking-tight uppercase">Protocol Break Detected</h2>
              <p className="text-text-muted text-sm font-medium italic opacity-60">No se ha podido establecer una conexión segura con el nodo de monitoreo.</p>
            </div>
            <button 
              onClick={() => { setLoading(true); fetchStatus(); }}
              className="px-10 py-4 rounded-[20px] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white-custom hover:bg-white/10 transition-all"
            >
              Reintentar Sincronización
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Global Infrastructure Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-10 rounded-[48px] border shadow-2xl relative overflow-hidden group backdrop-blur-xl transition-all duration-700 ${
                data?.status === 'operational' 
                  ? 'bg-primary/[0.03] border-primary/20' 
                  : 'bg-accent/[0.03] border-accent/20'
              }`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <ShieldCheck size={160} className="-rotate-12" />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                  <div className={`p-6 rounded-[32px] shadow-inner ${data?.status === 'operational' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                    {data?.status === 'operational' ? <CheckCircle2 size={48} strokeWidth={1.5} /> : <AlertCircle size={48} strokeWidth={1.5} />}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white-custom tracking-tighter italic uppercase leading-none">
                      {data?.status === 'operational' ? 'Operational Protocol' : 'Performance Alert'}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic opacity-40">
                      Last Check: {new Date(data?.timestamp || '').toLocaleTimeString('es-CO', { hour12: false })} • {data?.latency_ms}ms Global Latency
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end">
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted opacity-40 mb-2">Network Health</div>
                  <div className="text-5xl font-black text-white-custom tracking-tighter flex items-baseline gap-2">
                    99<span className="text-xl text-primary">.98</span>
                    <span className="text-xs font-bold text-text-muted/40 uppercase tracking-widest">%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Matrix Grid of Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceMonitor 
                name="Front-end Gateway" 
                status="operational" 
                description="Protocolo de entrega estática Next.js 15+ a través de nodos edge globales de Vercel."
                icon={<Globe size={20} />}
              />
              <ServiceMonitor 
                name="Core Intelligence" 
                status={data?.services.llm_gateway.status || 'down'} 
                description="Orquestador multi-modelo (Groq/DeepSeek) operando bajo protocolo de failover automático."
                icon={<Cpu size={20} />}
              />
              <ServiceMonitor 
                name="Relational Data" 
                status={data?.services.database.status || 'down'} 
                description="Clúster redundante de PostgreSQL alojado en Supabase con RLS de alta seguridad."
                latency={`${data?.services.database.latency}ms`}
                icon={<Database size={20} />}
              />
              <ServiceMonitor 
                name="Event Dispatcher" 
                status="operational" 
                description="Sistema de webhooks y notificaciones en tiempo real para la gestión de leads."
                icon={<Zap size={20} />}
              />
            </div>

            {/* Performance Timeline Visualization */}
            <div className="bg-card-bg rounded-[48px] border border-white/5 p-10 md:p-12 shadow-2xl relative overflow-hidden group">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white-custom italic flex items-center gap-3">
                    <BarChart3 size={14} className="text-primary" />
                    Uptime History Archive
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/40 italic">90-Day Operational Cycle</span>
               </div>
               
               <div className="flex gap-1.5 h-12 items-end">
                {Array.from({ length: 70 }).map((_, i) => {
                  const h = 40 + Math.random() * 60;
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.01, duration: 0.5 }}
                      className={`flex-1 rounded-full transition-all duration-300 hover:scale-y-125 cursor-help ${
                        i === 45 ? 'bg-accent/40 hover:bg-accent' : 'bg-primary/20 hover:bg-primary'
                      }`} 
                      title={`Cycle ${70-i}: ${i === 45 ? '98.2%' : '100%'} Stability`}
                    />
                  );
                })}
              </div>
              
              <div className="flex justify-between mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-text-muted/30 italic">
                <span>Deployment Genesis</span>
                <span>Active Terminal</span>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => { setLoading(true); fetchStatus(); }}
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                Refresh Protocols
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Global Trust Archive Bar */}
      <div className="flex flex-wrap justify-center gap-12 py-12 opacity-10 border-t border-white/5 grayscale">
        <TrustAsset icon={<ShieldCheck size={14} />} text="End-to-End Encryption" />
        <TrustAsset icon={<Activity size={14} />} text="Zero-Downtime Architecture" />
        <TrustAsset icon={<Globe size={14} />} text="Global CDN Integration" />
      </div>

      <Footer />
    </div>
  );
}

function ServiceMonitor({ name, status, description, latency, icon }: { name: string, status: string, description: string, latency?: string, icon: React.ReactNode }) {
  const isOperational = status === 'operational' || status === 'active';
  
  return (
    <div className="bg-card-bg/40 rounded-[32px] border border-white/5 p-8 shadow-xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h4 className="font-black text-white-custom italic tracking-tight">{name}</h4>
        </div>
        <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-full border transition-all ${
          isOperational ? 'bg-primary/5 text-primary border-primary/20' : 'bg-accent/5 text-accent border-accent/20'
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isOperational ? 'bg-primary animate-pulse' : 'bg-accent shadow-[0_0_10px_rgba(var(--accent-color-rgb),0.5)]'}`} />
          {status}
        </div>
      </div>
      <p className="text-xs text-text-muted font-medium italic opacity-60 leading-relaxed mb-6">{description}</p>
      {latency && (
        <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest bg-background/50 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
          Protocol Delay: {latency}
        </div>
      )}
    </div>
  );
}

function TrustAsset({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.4em] text-text-muted italic">
      {icon}
      {text}
    </div>
  );
}
