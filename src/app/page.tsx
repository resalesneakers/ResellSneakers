'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Compre, venda e troque</span>
                <span className="block text-red-600">sneakers exclusivos</span>
              </h1>
              <p className="mt-6 text-xl text-gray-500">
                A plataforma mais segura para negociar seus sneakers. 
                Conectamos apaixonados por tênis em um ambiente confiável e prático.
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Explorar Produtos
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Vender Agora
                </Link>
              </div>
            </div>
            <div className="relative h-64 lg:h-96">
              <Image
                src="/hero-sneaker.jpg"
                alt="Sneaker em destaque"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Por que escolher o ResellSneakers?
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Segurança Garantida</div>
              <p className="text-gray-600">
                Sistema de pagamento seguro e verificação de usuários para sua tranquilidade.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Comunidade Ativa</div>
              <p className="text-gray-600">
                Conecte-se com outros colecionadores e encontre os sneakers dos seus sonhos.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-xl font-semibold mb-4">Praticidade</div>
              <p className="text-gray-600">
                Interface intuitiva e processo simplificado para compra, venda e troca.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 