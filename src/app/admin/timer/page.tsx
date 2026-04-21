"use client";

import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, User } from 'lucide-react';

interface TimerEntry {
  id: string;
  description: string;
  started_at: string;
  leads?: { name: string; company?: string };
}

interface LeadSummary {
  id: string;
  name: string;
  company?: string;
}

export default function TimerPage() {
  const [activeEntries, setActiveEntries] = useState<TimerEntry[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActive();
    fetchLeads();
  }, []);

  const fetchActive = async () => {
    const r = await fetch('/api/admin/timer');
    const data = await r.json();
    setActiveEntries(data);
  };

  const fetchLeads = async () => {
    const r = await fetch('/api/admin/leads/list'); // Necesito este endpoint o uno similar
    const data = await r.json();
    setLeads(data);
  };

  const handleStart = async () => {
    if (!selectedLead) return;
    setIsLoading(true);
    await fetch('/api/admin/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'start', projectId: selectedLead, description })
    });
    setDescription('');
    fetchActive();
    setIsLoading(false);
  };

  const handleStop = async (id: string) => {
    setIsLoading(true);
    await fetch('/api/admin/timer', {
      method: 'POST',
      body: JSON.stringify({ action: 'stop', entryId: id })
    });
    fetchActive();
    setIsLoading(false);
  };

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Clock className="text-blue-600" /> Time Tracking
      </h1>

      {/* Selector de Proyecto */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <h2 className="font-bold text-slate-700">Iniciar nueva sesión</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <select 
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar Cliente/Proyecto</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="¿Qué estás haciendo?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          disabled={!selectedLead || isLoading}
          onClick={handleStart}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <Play size={18} /> Iniciar Timer
        </button>
      </div>

      {/* Activos */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-500 uppercase text-xs tracking-widest">En curso</h2>
        {activeEntries.length === 0 && <p className="text-slate-400 italic text-sm">No hay timers activos.</p>}
        {activeEntries.map(entry => (
          <div key={entry.id} className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between animate-pulse">
            <div>
              <div className="font-bold text-blue-900 flex items-center gap-2">
                <User size={14} /> {entry.leads?.name || 'Cargando...'}
              </div>
              <p className="text-sm text-blue-700">{entry.description}</p>
              <p className="text-[10px] text-blue-500 mt-1">Iniciado: {new Date(entry.started_at).toLocaleTimeString()}</p>
            </div>
            <button
              onClick={() => handleStop(entry.id)}
              className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 shadow-lg active:scale-95 transition-all"
            >
              <Square size={20} fill="white" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
