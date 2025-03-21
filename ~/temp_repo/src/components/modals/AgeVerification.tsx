import React, { useState, useEffect } from 'react';

interface AgeVerificationProps {
  onVerify?: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerify }) => {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // Check if the user has already verified their age
    const isVerified = localStorage.getItem('ageVerified');
    
    if (!isVerified) {
      setShowModal(true);
    }
  }, []);
  
  const handleVerify = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowModal(false);
    if (onVerify) onVerify();
  };
  
  const handleUnderAge = () => {
    // Redirect to appropriate page or show message
    window.location.href = 'https://www.google.com';
  };
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative max-w-md w-full mx-4 p-8 bg-black border border-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Age Verification</h2>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              This website contains products intended for adults aged 21 years or older.
            </p>
            <p className="text-gray-300">
              By entering, you confirm that you are at least 21 years of age.
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleVerify}
              className="w-full py-3 rounded-md bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
            >
              I am 21 or older
            </button>
            
            <button 
              onClick={handleUnderAge}
              className="w-full py-3 rounded-md bg-transparent border border-gray-700 hover:bg-gray-900 text-gray-300 font-medium transition-colors"
            >
              I am under 21
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
