'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Check, Link2, Linkedin, MessageCircle, Twitter } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  locale: 'es' | 'en';
  vertical?: boolean;
  className?: string;
}

export default function ShareButtons({
  url,
  title,
  locale,
  vertical = false,
  className,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareLabel = locale === 'en' ? 'Share' : 'Compartir';
  const copyLabel = locale === 'en' ? 'Copy link' : 'Copiar enlace';
  const copiedLabel = locale === 'en' ? 'Copied' : 'Copiado';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(copyLabel, url);
    }
  };

  const links = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: Linkedin,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      Icon: Twitter,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      Icon: MessageCircle,
    },
  ];

  const buttonClass = clsx(
    'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] font-mono-label text-[7px] text-muted-45 transition-colors hover:border-primary hover:text-primary',
    vertical ? 'w-full justify-start px-3 py-2.5' : 'px-3 py-2',
  );

  return (
    <div className={clsx('flex gap-2', vertical ? 'flex-col' : 'flex-wrap items-center', className)}>
      <span className={clsx('font-mono-label text-[7px] text-muted-35', vertical && 'mb-1')}>
        {shareLabel}
      </span>

      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${shareLabel} ${label}`}
          className={buttonClass}
        >
          <Icon size={13} />
          <span className={vertical ? 'inline' : 'hidden sm:inline'}>{label}</span>
        </a>
      ))}

      <button type="button" onClick={handleCopy} className={buttonClass}>
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        <span className={vertical ? 'inline' : 'hidden sm:inline'}>
          {copied ? copiedLabel : copyLabel}
        </span>
        <span className="sr-only" aria-live="polite">
          {copied ? copiedLabel : ''}
        </span>
      </button>
    </div>
  );
}
