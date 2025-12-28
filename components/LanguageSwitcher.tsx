
import React from 'react';
import { useAppContext } from '../AppContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useAppContext();

  return (
    <div className="relative flex items-center bg-gray-100 rounded-full p-1 w-24 h-10 overflow-hidden">
      {/* Moving Background Pill */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-in-out ${
          language === 'bg' ? 'left-1' : 'left-[50%]'
        }`}
      />
      
      <button 
        onClick={() => setLanguage('bg')}
        className={`relative z-10 w-1/2 flex justify-center items-center h-full transition-opacity duration-300 ${language === 'bg' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
      >
        <img 
          src="https://flagcdn.com/w40/bg.png" 
          alt="Bulgarian" 
          className="w-5 h-auto rounded-sm border border-gray-200"
        />
      </button>

      <button 
        onClick={() => setLanguage('en')}
        className={`relative z-10 w-1/2 flex justify-center items-center h-full transition-opacity duration-300 ${language === 'en' ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
      >
        <img 
          src="https://flagcdn.com/w40/us.png" 
          alt="English" 
          className="w-5 h-auto rounded-sm border border-gray-200"
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
