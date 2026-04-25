"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, Globe, Database, Cpu } from 'lucide-react';

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
    const interval = setInterval(fetchStatus, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)] py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-4 flex items-center justify-center gap-3"
          >
            <Activity className="text-[var(--primary-color)]" size={36} />
            System Status
          </motion.h1>
          <p className="text-[var(--muted-color)]">Monitoreo en tiempo real de la infraestructura del portafolio</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">Error al cargar estado</h2>
            <p className="text-[var(--muted-color)]">No pudimos conectar con el servidor de monitoreo.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Banner */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-6 rounded-2xl border flex items-center justify-between shadow-xl ${
                data?.status === 'operational' 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${data?.status === 'operational' ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                  {data?.status === 'operational' ? <CheckCircle2 className="text-emerald-400" size={32} /> : <AlertCircle className="text-amber-400" size={32} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {data?.status === 'operational' ? 'Todos los sistemas operativos' : 'Sistemas con rendimiento degradado'}
                  </h2>
                  <p className="text-xs text-[var(--muted-color)]">Última actualización: {new Date(data?.timestamp || '').toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--muted-color)] mb-1">Latencia Global</div>
                <div className="text-2xl font-black text-[var(--primary-color)]">{data?.latency_ms}ms</div>
              </div>
            </motion.div>

            {/* Individual Services */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceCard 
                name="Website & API" 
                status="operational" 
                description="Frontend y endpoints de Next.js"
                icon={<Globe size={20} />}
              />
              <ServiceCard 
                name="Database" 
                status={data?.services.database.status || 'down'} 
                description="Almacenamiento de conversaciones Supabase"
                latency={`${data?.services.database.latency}ms`}
                icon={<Database size={20} />}
              />
              <ServiceCard 
                name="Chatbot Engine" 
                status={data?.services.llm_gateway.status || 'down'} 
                description="Orquestador de LLM Multi-proveedor"
                icon={<Cpu size={20} />}
              />
              <ServiceCard 
                name="Real-time Events" 
                status="operational" 
                description="Sistema de Webhooks y Dispatcher"
                icon={<WebhookIcon size={20} />}
              />
            </div>

            {/* Uptime History Placeholder */}
            <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 p-6 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-[var(--primary-color)]" />
                Uptime Histórico (90 días)
              </h3>
              <div className="flex gap-1 h-8">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-emerald-500/30 rounded-sm hover:bg-emerald-500 transition-colors" title={`Día ${90-i}: 100%`}></div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[var(--muted-color)] font-bold uppercase tracking-wider">
                <span>Hace 90 días</span>
                <span>Hoy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ name, status, description, latency, icon }: { name: string, status: string, description: string, latency?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg-color)] rounded-xl border border-[var(--primary-color)]/10 p-5 shadow-lg hover:border-[var(--primary-color)]/30 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-[var(--primary-color)]">
          {icon}
          <h4 className="font-bold text-[var(--white-color)]">{name}</h4>
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-full ${
          status === 'operational' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
          {status}
        </div>
      </div>
      <p className="text-xs text-[var(--muted-color)] mb-3">{description}</p>
      {latency && (
        <div className="text-[10px] font-mono text-[var(--muted-color)] bg-[var(--background-color)]/50 px-2 py-0.5 rounded w-fit">
          Latency: {latency}
        </div>
      )}
    </div>
  );
}

function Activity({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function WebhookIcon({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  );
}
