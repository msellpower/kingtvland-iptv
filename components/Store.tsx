import React, { useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, logout } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { ShoppingBag, Coins, Download, LogOut, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../i18n/LanguageContext';

interface Product {
  id: string;
  name: string;
  pricePoints: number;
  priceCoins: number;
  downloadUrl: string;
  active: boolean;
  description?: string;
  image?: string;
}

interface WalletBalance {
  points: number;
  coins: number;
}

const Store: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletBalance | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await connectWallet(currentUser);
        fetchProducts();
      } else {
        setWallet(null);
        setProducts([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already logged in service
    } finally {
      setAuthLoading(false);
    }
  };

  const connectWallet = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) throw new Error('Failed to connect wallet');

      const data = await response.json();
      if (data.coinUserId) {
        fetchWalletBalance(currentUser);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(t('store.walletError'));
    }
  };

  const fetchWalletBalance = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      setWallet(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handlePurchase = async (product: Product, paymentType: 'points' | 'coins') => {
    if (!user) return;
    setPurchasing(product.id);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/store/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          productId: product.id,
          paymentType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('store.purchaseError'));
      }

      const data = await response.json();
      toast.success(t('store.purchaseSuccess'));
      
      // Refresh wallet balance
      // We need coinUserId again, ideally stored in state or refetched
      // For simplicity, we'll reload the page or re-trigger connectWallet logic
      // But better to just deduct locally for UI feedback or re-fetch
      connectWallet(user);

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || t('store.purchaseError'));
    } finally {
      setPurchasing(null);
    }
  };

  if (loading && user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0f0c29]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 bg-[#0f0c29] text-white flex flex-col items-center justify-center text-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl p-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
        <ShoppingBag className="w-20 h-20 text-purple-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-black mb-4">{t('store.maintenanceTitle')}</h1>
        <p className="text-xl text-gray-400 mb-8 leading-relaxed">
          {t('store.maintenanceDesc1')} <br/>
          {t('store.maintenanceDesc2')}
        </p>
        <div className="inline-block px-6 py-2 bg-purple-600/20 text-purple-400 rounded-full border border-purple-500/30 font-bold">
          {t('store.maintenanceMode') || 'Maintenance Mode'}
        </div>
      </div>
    </div>
  );
};

export default Store;
