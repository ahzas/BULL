import React, { createContext, useState } from 'react';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState({
    total: 4750.00,
    available: 3550.00,
    pending: 1200.00,
    withdrawnThisMonth: 2300.00,
    activeStreak: 12,
    bonusRate: "%8",
    totalBonusEarned: 380.00
  });

  const [transactions, setTransactions] = useState([
    { id: '1', title: 'Garsonluk Ödemesi', date: 'Bugün', amount: '+450 TL', type: 'earn' },
    { id: '2', title: 'Streak Bonusu (%5)', date: 'Bugün', amount: '+22.5 TL', type: 'bonus' },
    { id: '3', title: 'Banka Hesabına Çekim', date: 'Dün', amount: '-1.200 TL', type: 'withdraw' },
  ]);

  const withdrawMoney = (amountVal) => {
    setBalance(prev => ({
      ...prev,
      total: prev.total - amountVal,
      available: prev.available - amountVal,
      withdrawnThisMonth: prev.withdrawnThisMonth + amountVal
    }));
    
    const newTx = {
      id: Math.random().toString(),
      title: 'Banka Hesabına Çekim',
      date: 'Şimdi',
      amount: `-${amountVal.toLocaleString('tr-TR')} TL`,
      type: 'withdraw'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, withdrawMoney }}>
      {children}
    </WalletContext.Provider>
  );
};
