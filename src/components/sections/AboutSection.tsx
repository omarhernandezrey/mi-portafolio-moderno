"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

/*  Carga diferida del carnet 3D  */
const Lanyard = dynamic(() => import("../ui/Lanyard"), { ssr: false });

export default function AboutSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const personal = [
    { icon: FaUser, label: "Nombre", value: "Omar Hernández Rey" },
    { icon: FaCalendarAlt, label: "Fecha de Nacimiento", value: "14/02/1990" },
    { icon: FaMapMarkerAlt, label: "Ubicación", value: "Bogotá, Colombia" },
    { icon: FaPhoneAlt, label: "Teléfono", value: "(+57) 321 905 8278" },
  ];

  return (
    <section id="about" className="relative min-h-screen py-32 overflow-hidden">
      <motion.div style={{ y }} className="container mx-auto max-w-6xl px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Sobre Mí</h2>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Perfil */}
          <div className="flex flex-col items-center">
            <div className="relative w-60 h-72 mb-6 rounded-lg overflow-hidden">
              <Image
                src="/images/profile-SN-fondo.png"
                alt="Perfil Omar"
                fill
                className="object-cover"
                priority
              />
            </div>
            <ul className="space-y-2">
              {personal.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-center gap-3 text-lg">
                  <Icon className="text-accent" />
                  <span className="font-semibold">{label}:</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Carnet 3D */}
          <div className="flex justify-center items-center">
            <Lanyard />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
