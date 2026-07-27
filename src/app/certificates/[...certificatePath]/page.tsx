"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Download } from "lucide-react";

const CertificatePage = () => {
  const router = useRouter();
  const params = useParams();

  // Verificar si params.certificatePath es un arreglo antes de usar join
  const certificatePath = Array.isArray(params.certificatePath)
    ? params.certificatePath.join("/")
    : params.certificatePath || "";

  if (!certificatePath) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}
      >
        <p>Certificado no encontrado.</p>
      </div>
    );
  }

  const certificateUrl = `/${decodeURIComponent(certificatePath)}`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 gap-8"
      style={{ backgroundColor: "var(--background-color)", color: "var(--text-color)" }}
    >
      <h1 className="font-mono-label text-[0.65rem]" style={{ color: "var(--primary-color)" }}>
        Certificado Completo
      </h1>
      <div
        className="p-4 rounded-[24px] shadow-2xl border"
        style={{
          backgroundColor: "var(--card-bg-color)",
          borderColor: "color-mix(in srgb, var(--white-color) 10%, transparent)",
        }}
      >
        <Image
          src={certificateUrl}
          alt="Certificado Completo"
          width={800}
          height={600}
          className="max-w-full max-h-screen rounded-2xl object-contain"
          priority
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href={certificateUrl}
          download
          className="inline-flex items-center gap-2 py-3 px-8 rounded-full font-black text-[10px] uppercase tracking-widest transition-transform hover:scale-105"
          style={{ backgroundColor: "var(--primary-color)", color: "var(--background-color)" }}
        >
          <Download size={16} />
          Descargar Certificado
        </a>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 py-3 px-8 rounded-full font-black text-[10px] uppercase tracking-widest border transition-colors"
          style={{
            borderColor: "color-mix(in srgb, var(--white-color) 15%, transparent)",
            color: "var(--muted-color)",
          }}
        >
          <ChevronLeft size={16} />
          Volver
        </button>
      </div>
    </div>
  );
};

export default CertificatePage;
