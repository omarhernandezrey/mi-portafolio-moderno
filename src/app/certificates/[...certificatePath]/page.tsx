"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

const CertificatePage = () => {
  const router = useRouter();
  const params = useParams();

  // Verificar si params.certificatePath es un arreglo antes de usar join
  const certificatePath = Array.isArray(params.certificatePath)
    ? params.certificatePath.join("/")
    : params.certificatePath || "";

  if (!certificatePath) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Certificado no encontrado.</p>
      </div>
    );
  }

  const certificateUrl = `/${decodeURIComponent(certificatePath)}`;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-6">Certificado Completo</h1>
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <Image
          src={certificateUrl}
          alt="Certificado Completo"
          width={800}
          height={600}
          className="max-w-full max-h-screen rounded-lg object-contain"
          priority
        />
      </div>
      <div className="mt-6 flex space-x-4">
        <a
          href={certificateUrl}
          download
          className="bg-teal-500 text-gray-900 py-2 px-6 rounded-full hover:bg-teal-600 transition-colors duration-200"
        >
          Descargar Certificado
        </a>
        <button
          onClick={() => router.back()}
          className="bg-red-500 text-white py-2 px-6 rounded-full hover:bg-red-600 transition-colors duration-200"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default CertificatePage;
