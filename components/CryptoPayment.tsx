import React, { useState, useEffect } from 'react';
import { Plan, ServiceLevel } from '../types';

interface CryptoPaymentProps {
  plan: Plan;
  serviceLevel: ServiceLevel;
  userId?: string; // Optional user ID for tracking
}

const CryptoPayment: React.FC<CryptoPaymentProps> = ({ plan, serviceLevel, userId = 'guest' }) => {
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const [cryptoPackageId, setCryptoPackageId] = useState<string>('');
  const [rampLink, setRampLink] = useState<string>('');

  // Configuration from user request
  const CRYPTO_CONFIG = {
    address: "TZHSo4HM6CXgQvEN2UdLxorc5fXeByLDq9",
    network: "TRC20",
    asset: "USDT",
    provider: "Ramp"
  };

  useEffect(() => {
    // Calculate amount based on plan and service level
    let amount = 0;
    let pkgId = '';

    // Normalize plan ID to lower case for matching
    const planId = plan.id.toLowerCase();

    if (planId.includes('king')) {
      if (serviceLevel === ServiceLevel.VIP) { amount = 80; pkgId = 'pkg002'; }
      else { amount = 40; pkgId = 'pkg001'; }
    } else if (planId.includes('israel')) {
      if (serviceLevel === ServiceLevel.VIP) { amount = 80; pkgId = 'pkg004'; }
      else { amount = 40; pkgId = 'pkg003'; }
    } else if (planId.includes('premium')) {
      if (serviceLevel === ServiceLevel.VIP) { amount = 120; pkgId = 'pkg006'; }
      else { amount = 80; pkgId = 'pkg005'; }
    } else {
      // Default fallback if plan ID doesn't match known patterns
      amount = serviceLevel === ServiceLevel.VIP ? 80 : 40;
      pkgId = `custom_${planId}_${serviceLevel}`;
    }

    setCryptoAmount(amount);
    setCryptoPackageId(pkgId);

    // Construct Ramp Link
    const baseUrl = "https://buy.ramp.network/";
    const finalUrl = `${window.location.origin}/thankyou?package=${pkgId}&amount=${amount}&userId=${userId}`;
    
    const params = new URLSearchParams({
      defaultAsset: CRYPTO_CONFIG.asset,
      swapAsset: CRYPTO_CONFIG.asset,
      network: "tron", // Ramp uses 'tron' for TRC20
      userAddress: CRYPTO_CONFIG.address,
      amount: amount.toString(),
      finalUrl: finalUrl
    });

    // User requested specific link template
    const userTemplateLink = `https://buy.ramp.network/?defaultAsset=USDT&swapAsset=USDT&network=tron&userAddress=${CRYPTO_CONFIG.address}&amount=${amount}&final_url=${encodeURIComponent(finalUrl)}`;
    
    setRampLink(userTemplateLink);

  }, [plan, serviceLevel, userId]);

  if (cryptoAmount === 0) return null;

  const isVIP = serviceLevel === ServiceLevel.VIP;
  const buttonColor = isVIP ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-blue-600 hover:bg-blue-700 text-white';
  const borderColor = isVIP ? 'border-yellow-500' : 'border-blue-500';

  return (
    <div className={`mt-4 p-4 rounded-xl border ${borderColor} bg-slate-900/80 animate-fade-in relative`}>
      <h4 className="text-white font-bold mb-4 flex items-center gap-2 pr-6">
        <span className="text-xl">💎</span>
        <span>תשלום ב-USDT (TRC20)</span>
      </h4>

      <div className="flex flex-col items-center gap-4">
        {/* QR Code */}
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(rampLink)}`} 
            alt="Payment QR Code" 
            width={150} 
            height={150}
            className="block"
          />
        </div>

        {/* Payment Details & Button */}
        <div className="w-full text-center space-y-3">
          <div className="text-gray-300 text-xs">
            <p>סרוק או לחץ לתשלום מאובטח</p>
          </div>

          <a 
            href={rampLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full block text-center py-2 px-4 rounded-lg font-bold shadow-lg transition-transform hover:scale-105 text-sm ${buttonColor}`}
          >
            שלם {cryptoAmount} USDT
          </a>
        </div>
      </div>
    </div>
  );
};

export default CryptoPayment;
