'use client';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        let q = query(productsRef);

        if (filter !== 'all') {
          q = query(productsRef, where('condition', '==', filter));
        }

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));

        // Apply price filter
        let filteredProducts = productsData;
        if (priceRange !== 'all') {
          const [min, max] = priceRange.split('-').map(Number);
          filteredProducts = productsData.filter(
            product => product.price >= min && (max ? product.price <= max : true)
          );
        }

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filter, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            Sneakers Disponíveis
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            >
              <option value="all">Todas as Condições</option>
              <option value="new">Novo</option>
              <option value="like_new">Usado - Como Novo</option>
              <option value="good">Usado - Bom Estado</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-red-500 focus:outline-none focus:ring-red-500 sm:text-sm"
            >
              <option value="all">Todas os Preços</option>
              <option value="0-100">Até R$ 100</option>
              <option value="100-300">R$ 100 - R$ 300</option>
              <option value="300-500">R$ 300 - R$ 500</option>
              <option value="500">Acima de R$ 500</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">{product.title}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  R$ {product.price.toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {product.condition === 'new' ? 'Novo' :
                   product.condition === 'like_new' ? 'Como Novo' : 'Bom Estado'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 