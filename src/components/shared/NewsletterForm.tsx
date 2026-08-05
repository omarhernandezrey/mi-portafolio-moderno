// components/shared/NewsletterForm.tsx
"use client";
import React, { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";

export default function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("newsletter.error"));
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">
        {t("newsletter.title")}
      </h3>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-center"
      >
        <input
          type="email"
          placeholder={t("newsletter.placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="
            w-full sm:w-auto flex-1 p-4 rounded-l-lg bg-[var(--secondary-background-color)] text-[var(--text-color)] placeholder-[var(--muted-color)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]
          "
          required
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`
            mt-4 sm:mt-0 sm:ml-2 p-4 bg-[var(--accent-color)] text-[var(--background-color)] font-semibold rounded-r-lg
            hover:bg-[var(--primary-hover-color)] transition-colors duration-300
            ${status === "loading" ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {status === "loading" ? t("newsletter.subscribing") : t("newsletter.subscribe")}
        </button>
      </form>
      {status === "success" && (
        <p className="text-[var(--primary-color)] mt-2">
          {t("newsletter.success")}
        </p>
      )}
      {status === "error" && (
        <p className="text-[var(--error-color)] mt-2">
          {t("newsletter.error")}
        </p>
      )}
    </div>
  );
}
