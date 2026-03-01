"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';

export default function Carousel() {
  const [currentImg, setCurrentImg] = useState(0);
  
  // Nombres de tus fotos en la carpeta /public
  const images = [
    "/quincho1.jpeg", 
    "/quincho2.jpeg", 
    "/quincho3.jpeg",
    "/quincho4.jpeg",
    "/quincho5.jpeg",
    "/quincho6.jpeg",
    "/quincho7.jpeg"
  ];

  const prevImg = () => setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImg = () => setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="w-full max-w-2xl h-[470px] md:h-[370px] flex flex-col items-center mb-4 animate-in fade-in duration-700">
      {/* Contenedor de la foto */}
      <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden h-full">
        
        {images.map((img, i) => (
           <div 
              key={i} 
              className={`absolute inset-0 transition-opacity duration-500 h-full ease-in-out ${i === currentImg ? 'opacity-100' : 'opacity-0'} flex justify-center items-center`}
            >
              
              <img 
                src={img} 
                alt={`Quincho ${i+1}`} 
                className="w-fit md:h-full object-contain rounded-xl" 
              />
           </div>
        ))}

        {/* Botones de control */}
        <button 
          onClick={prevImg} 
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-orange-200 hover:bg-orange-600 hover:text-white text-orange-600 rounded-full backdrop-blur-sm transition-all shadow-md"
        >
           <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button 
          onClick={nextImg} 
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-200 hover:bg-orange-600 hover:text-white text-orange-600 rounded-full backdrop-blur-sm transition-all shadow-md"
        >
           <ChevronRight className="w-5 h-5" />
        </button>

        {/* Puntos indicadores */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
             <div 
               key={i} 
               className={`w-2.5 h-2.5 rounded-full transition-all shadow-sm ${i === currentImg ? 'bg-orange-600 scale-125' : 'bg-white/80'}`} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}