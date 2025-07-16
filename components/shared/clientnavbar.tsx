// src/components/ClientNavbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

const ClientNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-emerald-600">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo
            size="md"
            className="text-white [&>div]:bg-white [&>div]:text-emerald-600"
            href="/"
          />

          {/* Enlaces desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/concursos" className="text-white hover:text-emerald-100">
              Concursos
            </Link>
            <Link href="/ganado" className="text-white hover:text-emerald-100">
              Ganado
            </Link>
            <Link href="/companias" className="text-white hover:text-emerald-100">
              Empresas
            </Link>
          </div>

          {/* Botones desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/iniciar-sesion">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                Registrarse
              </Button>
            </Link>
          </div>

          {/* Toggle móvil */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isOpen && (
        <div className="md:hidden bg-emerald-700 px-4 py-4 space-y-3 text-white">
          <Link
            href="/concursos"
            className="block hover:text-emerald-200"
            onClick={closeMenu}
          >
            Concursos
          </Link>
          <Link
            href="/ganado"
            className="block hover:text-emerald-200"
            onClick={closeMenu}
          >
            Ganado
          </Link>
          <Link
            href="/companias"
            className="block hover:text-emerald-200"
            onClick={closeMenu}
          >
            Empresas
          </Link>
          <Link
            href="/iniciar-sesion"
            className="block hover:text-emerald-200"
            onClick={closeMenu}
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="block hover:text-emerald-200"
            onClick={closeMenu}
          >
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
};

export default ClientNavbar;
