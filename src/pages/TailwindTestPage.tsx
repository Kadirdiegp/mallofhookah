import { useState } from 'react';

const TailwindTestPage = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen w-full bg-white py-12 px-4">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-black mb-8">Tailwind CSS is Working!</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 w-full border border-gray-200">
          <h2 className="text-2xl font-semibold text-black mb-4">Counter Example</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to see Tailwind styles in action on interactive elements.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={() => setCount(count - 1)}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Decrease
            </button>
            
            <div className="text-2xl font-bold w-16 text-center text-black">
              {count}
            </div>
            
            <button 
              onClick={() => setCount(count + 1)}
              className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Increase
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow w-full border border-gray-200">
            <div className="h-24 bg-red-500 rounded-lg mb-4 w-full"></div>
            <h3 className="text-xl font-semibold text-black mb-2">Primary Color Block</h3>
            <p className="text-gray-600">This block uses the primary color (red) from your theme.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow w-full border border-gray-200">
            <div className="h-24 bg-black rounded-lg mb-4 w-full"></div>
            <h3 className="text-xl font-semibold text-black mb-2">Secondary Color Block</h3>
            <p className="text-gray-600">This block uses the secondary color (black) from your theme.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTestPage;
