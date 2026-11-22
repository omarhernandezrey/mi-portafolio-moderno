"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Database, Activity, ShieldCheck, RefreshCw, Radio, BarChart3 } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import type { ResumenDeUptime, DiaDeUptime } from '@/lib/uptime/aggregate';

interface HealthData {
  status: string;
  timestamp: string;
  latency_ms: number;
  services: {
    database: { status: string; latency: number };
    llm_gateway: { status: string };
  };
}

/** Formatea `YYYY-MM-DD` (UTC) para leerlo, sin arrastrar una librería. */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function fechaLegible(fecha: string): string {
  const [a, m, d] = fecha.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]} ${a}`;
}

/**
 * Una barra por día.
 *
 * La altura es UNIFORME y el color lleva el estado, a propósito. Si la altura
 * codificara el porcentaje, un 99% y un 100% serían indistinguibles a 12px de
 * alto, y un día al 0% desaparecería justo cuando más importa verlo. Y es la
 * forma de no repetir el error de la gráfica anterior, cuyas alturas eran
 * `Math.random()`.
 *
 * Tres estados, y el de «sin datos» NO se parece al de «bien»: es un trazo
 * hueco. Un hueco en el registro no es disponibilidad.
 */
function BarraDeDia({ dia }: { dia: DiaDeUptime }) {
  const sinDatos = dia.porcentaje === null;
  const perfecto = dia.porcentaje === 100;

  const titulo = sinDatos
    ? `${fechaLegible(dia.fecha)}: sin datos (no se registró ninguna comprobación)`
    : `${fechaLegible(dia.fecha)}: ${dia.porcentaje}% operativo · ` +
      `${dia.operativas}/${dia.comprobaciones} ` +
      `${dia.comprobaciones === 1 ? 'comprobación' : 'comprobaciones'} · ` +
      `${dia.latenciaMedia}ms de media`;

  return (
    <div
      role="listitem"
      aria-label={titulo}
      title={titulo}
      // `min-w-px` en móvil: es un SUELO, no el ancho real — `flex-1` reparte
      // y a 375px cada tramo se queda en ~2px de todas formas. Con el suelo
      // en 2px, los 90 tramos forzaban 358px sobre 287px disponibles y
      // desbordaban; bajándolo, el reparto manda y siempre cabe.
      className={`h-full flex-1 min-w-px sm:min-w-[2px] rounded-full transition-colors ${
        sinDatos
          ? 'border border-dashed border-text-muted/25 bg-transparent'
          : perfecto
            ? 'bg-primary/30 hover:bg-primary'
            : 'bg-accent/50 hover:bg-accent'
      }`}
    />
  );
}

/**
 * Historial real de `uptime_checks`, agregado por `/api/uptime/history`.
 *
 * Sustituye a una gráfica que no leía nada. Por eso aquí se dice SIEMPRE
 * cuántas comprobaciones hay detrás y desde cuándo: recién estrenado el
 * registro, casi toda la ventana estará hueca, y eso debe leerse como «aún no
 * hay histórico», no como noventa días de caída.
 */
function HistorialDeUptime({ resumen }: { resumen: ResumenDeUptime }) {
  const hayDatos = resumen.totalComprobaciones > 0;

  // `p-6` en móvil, no `p-10`: con 90 tramos el ancho es el recurso escaso.
  // Medido a 375px, con el margen de rejilla en 20px por lado: `p-10` deja
  // 255px para la tira, y 90 tramos con suelo de 2px y huecos de 2px piden
  // 358px — desbordaba 103px. Con `p-6` el hueco sube a 287px, y con el suelo
  // y el hueco a 1px la tira cabe de sobra (lo comprobé midiendo
  // `scrollWidth` en el navegador: 285px con huecos de 1px, 358px con 2px).
  return (
    <div className="bg-card-bg rounded-[48px] border border-text-muted/10 p-6 sm:p-10 md:p-12 shadow-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-10">
        <h3 className="font-mono-label text-[0.6rem] text-text-main flex items-center gap-3">
          <BarChart3 size={14} className="text-primary" />
          Historial de disponibilidad
        </h3>
        <p className="text-4xs font-black uppercase tracking-widest text-text-muted/40 italic">
          {resumen.dias.length} días · {resumen.diasConDatos} con datos ·{' '}
          {resumen.totalComprobaciones}{' '}
          {resumen.totalComprobaciones === 1 ? 'comprobación' : 'comprobaciones'}
        </p>
      </div>

      {hayDatos ? (
        <>
          <div
            role="list"
            aria-label="Disponibilidad diaria, del día más antiguo al más reciente"
            className="flex h-12 items-stretch gap-px sm:gap-[2px]"
          >
            {resumen.dias.map((dia) => (
              <BarraDeDia key={dia.fecha} dia={dia} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            {/* Leyenda explícita: el color por sí solo no informa, y un
                lector de pantalla no lo ve. */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-4xs font-black uppercase tracking-[0.2em] text-text-muted/50">
              <li className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                100% operativo
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                Con incidencias
              </li>
              <li className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-full border border-dashed border-text-muted/40"
                />
                Sin datos
              </li>
            </ul>

            {resumen.porcentajeGlobal !== null && (
              <p className="text-3xs font-black uppercase tracking-widest text-text-muted/60">
                {resumen.porcentajeGlobal}% sobre los días con datos
              </p>
            )}
          </div>

          {resumen.registrandoDesde && (
            <p className="mt-6 text-xs text-text-muted/50 italic">
              Registrando desde el{' '}
              {fechaLegible(resumen.registrandoDesde.slice(0, 10))}. Los días
              anteriores aparecen vacíos porque no hay medición, no porque el
              sitio estuviera caído.
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-text-muted/60 italic leading-relaxed">
          Todavía no hay comprobaciones registradas. La primera llegará en la
          próxima ejecución del registro horario, y la gráfica se irá llenando
          desde ahí. No se dibuja nada hasta entonces: una gráfica inventada es
          exactamente lo que esta página dejó de hacer.
        </p>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // `null` mientras no se sabe; `false` si la consulta falló. Son estados
  // distintos y la interfaz los distingue: no se dibuja una gráfica vacía
  // como si eso significara «todo bien».
  const [historial, setHistorial] = useState<ResumenDeUptime | null>(null);
  const [historialFallo, setHistorialFallo] = useState(false);

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

  const fetchHistorial = async () => {
    try {
      const res = await fetch('/api/uptime/history');
      if (!res.ok) throw new Error('History unavailable');
      setHistorial(await res.json());
      setHistorialFallo(false);
    } catch {
      setHistorialFallo(true);
    }
  };

  useEffect(() => {
    fetchStatus();
    // El histórico cambia una vez por hora: no tiene sentido re-pedirlo cada
    // 30 segundos como el estado actual.
    fetchHistorial();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      
      <main className="flex-1 w-full min-w-0 max-w-[70rem] mx-auto px-[var(--grid-margin)] pt-32 pb-32 space-y-16">
        
        {/* Monitoring Header */}
        <header className="text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]"
          >
            <Radio size={12} className="animate-pulse" />
            Live Infrastructure Monitor
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display italic text-5xl md:text-7xl font-medium text-text-main tracking-tight leading-none"
          >
            System <span className="text-primary">Status</span>
          </motion.h1>
          {/* El texto describe lo que la página MUESTRA. El anterior hablaba
              de «protocolos de redundancia» y «disponibilidad», dos cosas que
              aquí no se miden: prometía un cuadro de mando que no existe. */}
          <p className="text-text-muted text-sm font-medium max-w-xl mx-auto opacity-60 leading-relaxed italic">
            Comprobación en vivo de la base de datos, con su latencia. Se
            actualiza cada 30 segundos.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-[20px] border-2 border-primary/20 border-t-primary shadow-lg shadow-primary/20"></div>
              <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
            </div>
            <p className="text-3xs font-black uppercase tracking-[0.4em] text-text-muted/40 animate-pulse">Initializing Protocols...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-12 text-center space-y-6 shadow-2xl backdrop-blur-sm"
          >
            <AlertCircle className="mx-auto text-red-500 opacity-40" size={60} strokeWidth={1} />
            <div className="space-y-2">
              <h2 className="font-display italic text-2xl font-medium text-text-main tracking-tight">Protocol Break Detected</h2>
              <p className="text-text-muted text-sm font-medium italic opacity-60">No se ha podido establecer una conexión segura con el nodo de monitoreo.</p>
            </div>
            <button 
              onClick={() => { setLoading(true); fetchStatus(); }}
              className="px-10 py-4 rounded-[20px] bg-card-bg border border-text-muted/15 text-3xs font-black uppercase tracking-widest text-text-main hover:bg-text-muted/10 transition-all"
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

              {/* Aquí vivía además un «Network Health 99.98%» escrito a mano:
                  no salía de `/api/health` ni de ninguna medición. Se quitó
                  junto con el resto de los datos inventados de esta página.
                  La latencia que queda abajo sí la mide el endpoint. */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                  <div className={`p-6 rounded-canvas shadow-inner ${data?.status === 'operational' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                    {data?.status === 'operational' ? <CheckCircle2 size={48} strokeWidth={1.5} /> : <AlertCircle size={48} strokeWidth={1.5} />}
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display italic text-3xl font-medium text-text-main tracking-tight leading-none">
                      {data?.status === 'operational' ? 'Operational Protocol' : 'Performance Alert'}
                    </h2>
                    <p className="text-3xs font-black uppercase tracking-[0.2em] text-text-muted italic opacity-40">
                      {/* «Global Latency» antes: `latency_ms` es el tiempo del
                          propio handler de /api/health en el servidor que
                          atendió la petición, no una medición desde varias
                          regiones. */}
                      Last Check: {new Date(data?.timestamp || '').toLocaleTimeString('es-CO', { hour12: false })} • {data?.latency_ms}ms Health Check Latency
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Solo el servicio que `/api/health` comprueba de verdad.
                Había tres más, los tres siempre en verde porque nadie los
                medía: «Front-end Gateway» y «Event Dispatcher» con
                `status="operational"` escrito aquí mismo, y «Core
                Intelligence», cuyo estado parecía venir del endpoint pero era
                un stub que devolvía 'operational' sin llamar al gateway (ver
                `api/health/route.ts`). Un indicador que no puede ponerse en
                rojo no informa de nada. Cuando se instrumenten, vuelven. */}
            <div className="grid grid-cols-1 gap-6">
              <ServiceMonitor
                name="Relational Data"
                status={data?.services.database.status || 'down'}
                description="Clúster redundante de PostgreSQL alojado en Supabase con RLS de alta seguridad."
                latency={`${data?.services.database.latency}ms`}
                icon={<Database size={20} />}
              />
            </div>

            {/* La gráfica que estaba aquí no leía nada: 70 barras con
                altura `Math.random()`, un tooltip por barra afirmando «100%
                Stability» y una incidencia falsa fijada en la barra 45, bajo
                una etiqueta de «90-Day Operational Cycle» sobre 70 barras.

                Ahora sale de `uptime_checks`, que escribe
                `/api/cron/uptime-record` cada hora con la MISMA comprobación
                que sirve `/api/health` (`src/lib/health/check.ts`), y la
                agrega `/api/uptime/history`. Los días sin comprobaciones se
                pintan huecos, no al 100%. */}
            {historial ? (
              <HistorialDeUptime resumen={historial} />
            ) : historialFallo ? (
              <p className="text-xs text-text-muted/50 italic">
                No se pudo cargar el historial de disponibilidad. El estado de
                arriba es el de ahora mismo y no depende de esto.
              </p>
            ) : null}

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => { setLoading(true); fetchStatus(); }}
                className="group flex items-center gap-3 text-3xs font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
              >
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                Refresh Protocols
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Aquí vivía una barra de sellos que afirmaba «Zero-Downtime
          Architecture», «End-to-End Encryption» y «Global CDN Integration».
          No son métricas, son afirmaciones —y la primera la desmiente
          cualquier incidencia real—, así que se fueron con el resto. */}

      <Footer />
    </div>
  );
}

function ServiceMonitor({ name, status, description, latency, icon }: { name: string, status: string, description: string, latency?: string, icon: React.ReactNode }) {
  const isOperational = status === 'operational' || status === 'active';
  
  return (
    <div className="bg-card-bg/40 rounded-canvas border border-text-muted/10 p-8 shadow-xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
      <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-card-bg border border-text-muted/15 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h4 className="font-black text-text-main italic tracking-tight">{name}</h4>
        </div>
        <div className={`flex items-center gap-2 text-4xs font-black uppercase px-3 py-1.5 rounded-full border transition-all shrink-0 ${
          isOperational ? 'bg-primary/5 text-primary border-primary/20' : 'bg-accent/5 text-accent border-accent/20'
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isOperational ? 'bg-primary animate-pulse' : 'bg-accent shadow-lg shadow-accent/50'}`} />
          {status}
        </div>
      </div>
      <p className="text-xs text-text-muted font-medium italic opacity-60 leading-relaxed mb-6">{description}</p>
      {latency && (
        <div className="text-3xs font-black text-primary/40 uppercase tracking-widest bg-background/50 px-3 py-1.5 rounded-lg border border-text-muted/10 w-fit">
          Protocol Delay: {latency}
        </div>
      )}
    </div>
  );
}
