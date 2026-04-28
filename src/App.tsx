import React, { useState, useEffect } from 'react';
import { 
  Search, Phone, MapPin, HeartPulse, Smile, Eye, 
  Sparkles, Dumbbell, Dog, UtensilsCrossed, 
  BriefcaseMedical, MessageCircle, Info, Loader2
} from 'lucide-react';

// === Tu link de Google Sheets (Publicado como TSV) ===
const GOOGLE_SHEET_TSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrSr2s24UwlJychVsRrNlDxRjnAeaEIxJPLI9ngHIa3n3PITGiozOAPAe5YY1yRjB9rLGKTnWHGVoy/pub?output=tsv';

const categories = ['Todos', 'Salud', 'Dental', 'Ópticas', 'Estética', 'Bienestar', 'Mascotas', 'Otros'];

// Función para asignar un icono según la categoría
const getIconForCategory = (category?: string) => {
  switch(category?.toLowerCase()) {
    case 'salud': return <BriefcaseMedical className="text-blue-500" />;
    case 'dental': return <Smile className="text-teal-500" />;
    case 'ópticas': return <Eye className="text-indigo-500" />;
    case 'estética': return <Sparkles className="text-pink-500" />;
    case 'bienestar': return <HeartPulse className="text-orange-500" />;
    case 'mascotas': return <Dog className="text-amber-700" />;
    default: return <UtensilsCrossed className="text-purple-500" />;
  }
};

export default function App() {
  const [conveniosData, setConveniosData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Efecto para descargar los datos de Google Sheets
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Truco para evitar el caché de Google (Concatenamos directamente para evitar fallos de TS)
        const urlWithCacheBuster = String(GOOGLE_SHEET_TSV_URL) + '&t=' + String(new Date().getTime());

        const response = await fetch(urlWithCacheBuster);
        
        if (!response.ok) {
          throw new Error(`Google Sheets rechazó la conexión (Error ${response.status}).`);
        }

        const text = await response.text();
        
        // Verificar si Google devolvió HTML por error
        if (text.trim().toLowerCase().startsWith('<!doctype html>') || text.trim().toLowerCase().startsWith('<html')) {
          throw new Error('Google devolvió una página web. Verifica en Google Sheets que está publicado como TSV.');
        }

        const isCSV = text.includes(',') && !text.includes('\t');
        const separator = isCSV ? ',' : '\t';

        // Transformar el texto a un objeto que React pueda leer
        const rows = text.split(/\r?\n/);
        const data = rows.slice(1).map((row: string, index: number) => {
          const cols = row.split(separator);
          
          return {
            id: index,
            name: (cols[0] || '').trim(),
            category: (cols[1] || 'Otros').trim(),
            benefits: cols[2] ? cols[2].split(';').map((b: string) => b.trim()) : [],
            address: (cols[3] || '').trim(),
            phone: (cols[4] || '').trim(),
            whatsapp: (cols[5] || '').trim()
          };
        }).filter((item: any) => item.name !== ''); 

        if (data.length === 0) {
          throw new Error('Se conectó a Google, pero la hoja parece estar vacía o sin datos.');
        }

        setConveniosData(data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error al cargar los datos:", error);
        setErrorMsg(error.message || 'Error desconocido al conectar con Google Sheets.');
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const filteredConvenios = conveniosData.filter((convenio: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      convenio.name.toLowerCase().includes(searchLower) || 
      convenio.benefits.some((b: string) => b.toLowerCase().includes(searchLower));
      
    const matchesCategory = activeCategory === 'Todos' || convenio.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pb-20">
      
      {/* HEADER PRINCIPAL */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4 flex flex-col items-center border-b-4 border-[#0f766e]">
          
          <img 
            src="/logopng.png" 
            alt="Logo Bienestar APS CMVM" 
            className="w-32 h-auto object-contain mb-3"
          />
          
          <h1 className="text-xl font-bold text-[#0f766e] tracking-tight text-center leading-tight">
            CATÁLOGO DE CONVENIOS
          </h1>
        </div>
        
        {/* BUSCADOR */}
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clínica o servicio..."
              className="w-full bg-gray-100 border-none rounded-full py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#0f766e] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="max-w-md mx-auto overflow-x-auto pb-2 px-4 hide-scrollbar">
          <div className="flex space-x-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-[#0f766e] text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* BANNER INSTRUCTIVO */}
      <div className="max-w-md mx-auto px-4 mt-4">
        <div className="bg-[#fef3c7] border border-[#fde68a] rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Info className="text-[#d97706] mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-[#92400e] text-sm">¿Cómo acceder a los beneficios?</h3>
            <p className="text-xs text-[#b45309] mt-1 leading-relaxed">
              Presenta tu <strong>Cédula de Identidad</strong> o <strong>Credencial de Salud</strong> informando al prestador que utilizarás el convenio Bienestar APS.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-teal-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">Conectando con Google Sheets...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Info size={24} />
            </div>
            <h3 className="text-red-800 font-bold mb-2">¡Ups! Problema de conexión</h3>
            <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
          </div>
        ) : filteredConvenios.length > 0 ? (
          filteredConvenios.map((convenio: any) => (
            <div key={convenio.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-50 p-2.5 rounded-xl">
                    {getIconForCategory(convenio.category)}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 leading-tight">{convenio.name}</h2>
                    <span className="text-xs font-medium text-[#0f766e] bg-[#f0fdfa] px-2 py-0.5 rounded-md mt-1 inline-block border border-[#ccfbf1]">
                      {convenio.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {convenio.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2dd4bf] flex-shrink-0"></div>
                      <p>{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {convenio.address && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{convenio.address}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    {convenio.whatsapp && (
                      <a 
                        href={`https://wa.me/${convenio.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#f0fdf4] text-[#15803d] py-2 rounded-lg text-sm font-medium hover:bg-[#dcfce7] transition-colors border border-[#bbf7d0]"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                    )}
                    {convenio.phone && (
                      <a 
                        href={`tel:${convenio.phone.replace(/\s/g, '')}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <Phone size={16} />
                        Llamar
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">No hay convenios para mostrar.</p>
            <p className="text-xs text-gray-400 mt-1">Revisa tu buscador o tu planilla de Google.</p>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#115e59] text-[#ccfbf1] p-6 mt-6 rounded-t-3xl max-w-md mx-auto">
        <h4 className="font-bold text-white mb-4 text-center">Contacto Bienestar APS</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <MessageCircle size={16} className="text-[#5eead4]" />
            <span>WhatsApp: +56 9 2050 1725</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-[#5eead4]" />
            <span>Fijo: 223912759</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-[#5eead4]" />
            <span>1 Oriente #938, Viña del Mar</span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
