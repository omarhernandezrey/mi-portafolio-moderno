"use client";

import React from 'react';

interface OpenChatButtonProps {
  message?: string;
  className?: string;
  children: React.ReactNode;
}

export default function OpenChatButton({ message, className, children }: OpenChatButtonProps) {
  const handleClick = () => {
    const event = new CustomEvent('chatbot-open', {
      detail: { message }
    });
    window.dispatchEvent(event);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
