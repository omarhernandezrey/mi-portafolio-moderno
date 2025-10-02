"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
      >
        {/* 404 Número animado */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            404
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 opacity-20"
          >
            <Search className="w-full h-full text-blue-500" />
          </motion.div>
        </motion.div>

        {/* Mensaje de error */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¡Oops! Página no encontrada
          </h2>
          <p className="text-gray-300 text-lg mb-2">
            La página que buscas no existe o fue movida.
          </p>
          <p className="text-gray-400">
            Pero no te preocupes, puedes volver al inicio y explorar mi portafolio.
          </p>
        </motion.div>

        {/* Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Volver al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Página Anterior
          </button>
        </motion.div>

        {/* Links útiles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <p className="text-gray-400 mb-4">Enlaces útiles:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/#about"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sobre Mí
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/#projects"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Proyectos
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/#skills"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Habilidades
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href="/#contact"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contacto
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
