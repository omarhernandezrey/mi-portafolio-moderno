import React from 'react';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'admin' | 'client' | 'system';
  senderName: string;
  content: string;
  timestamp: string;
}

export default function ChatBubble({ role, senderName, content, timestamp }: ChatBubbleProps) {
  const isOutgoing = role === 'user' || role === 'admin' || role === 'system';

  return (
    <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} group`}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/30 italic">
          {senderName}
        </span>
        <span className="text-[8px] text-text-muted/20">•</span>
        <span className="text-[9px] text-text-muted/30 font-medium">
          {timestamp}
        </span>
      </div>

      <div className={`max-w-[75%] rounded-[28px] px-6 py-4 text-sm font-medium leading-relaxed transition-all shadow-lg ${
        isOutgoing
          ? 'bg-primary text-background rounded-tr-none shadow-primary/10'
          : 'bg-background border border-white/10 text-white-custom rounded-tl-none shadow-black/20 hover:border-white/20'
      }`}>
        {content}
      </div>
    </div>
  );
}
