import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getArgentinaToday, toLocalISOString } from '../utils/dateUtils';
import { Client, Sale, Lead, Installment, Product, PaymentFrequency, PaymentMethod } from '../types';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

interface StoreContextType {
  clients: Client[];
  sales: Sale[];
  leads: Lead[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addSale: (saleData: { clientId: string, product: Product, frequency: PaymentFrequency, method: PaymentMethod, installmentsCount: number, startDate: string, weeklyDay?: number, monthlyDay?: number }) => Promise<void>;
  addLead: (description: string, clientId?: string) => Promise<void>;
  markInstallmentPaid: (saleId: string, installmentId: string) => Promise<void>;
  reportMissedPayment: (saleId: string) => Promise<void>;
  updateSale: (updatedSale: Sale) => Promise<void>;
  deleteSale: (saleId: string) => Promise<void>;
  toggleSaleStatus: (saleId: string) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  preSelectedClientId: string | null;
  setPreSelectedClientId: (id: string | null) => void;
  isDefaulter: (clientId: string) => boolean;
  getClientStats: (clientId: string) => {
    totalPurchased: number;
    totalPaid: number;
    totalDebt: number;
    history: Sale[];
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to generate IDs for local use before Firestore sync if needed (though Firestore generates its own)
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to calculate dates
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [preSelectedClientId, setPreSelectedClientId] = useState<string | null>(null);

  // Firestore Listeners
  useEffect(() => {
    console.log("StoreContext: Current User UID:", user?.uid);
    if (!user) {
      setClients([]);
      setSales([]);
      setLeads([]);
      return;
    }

    const qClients = query(collection(db, 'users', user.uid, 'clients'), orderBy('createdAt', 'desc'));
    const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData);
    });

    const qSales = query(collection(db, 'users', user.uid, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
      setSales(salesData);
    });

    const qLeads = query(collection(db, 'users', user.uid, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
    });

    return () => {
      unsubscribeClients();
      unsubscribeSales();
      unsubscribeLeads();
    };
  }, [user]);

  const addClient = async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    if (!user) throw new Error("No user authenticated");
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'users', user.uid, 'clients'), payload);
    return { id: docRef.id, ...payload } as Client;
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'clients', id);
    await updateDoc(docRef, data);
  };

  const deleteClient = async (id: string) => {
    if (!user) return;
    // Cascading delete simplified for Firestore: In a production app, use a Cloud Function or batch
    await deleteDoc(doc(db, 'users', user.uid, 'clients', id));
    // Also cleanup associated sales (this should ideally be transactional or handled by a backend hook)
    const relatedSales = sales.filter(s => s.clientId === id);
    for (const sale of relatedSales) {
      await deleteDoc(doc(db, 'users', user.uid, 'sales', sale.id));
    }
  };

  const addSale = async ({ clientId, product, frequency, method, installmentsCount, startDate, weeklyDay, monthlyDay, firstInstallmentNumber = 1 }: {
    clientId: string, product: Product, frequency: PaymentFrequency, method: PaymentMethod, installmentsCount: number, startDate: string, weeklyDay?: number, monthlyDay?: number, firstInstallmentNumber?: number
  }) => {
    const amountPerInstallment = Math.floor(product.salePrice / installmentsCount);
    let totalAssigned = 0;
    const installments: Installment[] = [];

    const [year, month, day] = startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);

    // If starting from a later installment, we only generate the remaining ones.
    // The "installmentsCount" parameter is treated as the TOTAL Plan Length (e.g. 45).
    // The "firstInstallmentNumber" is where we start generating (e.g. 20).
    // So we generate installments numbered 20 to 45.

    // Safety check
    const startNum = Math.max(1, firstInstallmentNumber);
    const totalPlanCount = Math.max(startNum, installmentsCount);
    const installmentsToGenerate = totalPlanCount - startNum + 1;

    for (let i = 0; i < installmentsToGenerate; i++) {
      const currentInstallmentNumber = startNum + i; // e.g. 20, 21...

      let dueDate = new Date(start);
      // Calculate date offset based on how many periods have passed relative to TODAY (start date)
      // If the user says "Quota 20 is today", then for i=0 (Quota 20), offset is 0.
      // For i=1 (Quota 21), offset is 1.

      if (frequency === 'Diaria') {
        dueDate = addDays(start, i);
      } else if (frequency === 'Semanal') {
        if (weeklyDay !== undefined) {
          const firstInstallment = new Date(start);
          const currentDay = firstInstallment.getDay();
          const daysUntilTarget = (weeklyDay - currentDay + 7) % 7;
          firstInstallment.setDate(firstInstallment.getDate() + daysUntilTarget);
          dueDate = addDays(firstInstallment, i * 7);
        } else {
          dueDate = addDays(start, i * 7);
        }
      } else if (frequency === 'Mensual') {
        if (monthlyDay !== undefined) {
          const firstInstallment = new Date(start);
          if (firstInstallment.getDate() > monthlyDay) {
            firstInstallment.setMonth(firstInstallment.getMonth() + 1);
          }
          firstInstallment.setDate(monthlyDay);
          dueDate = addMonths(firstInstallment, i);
        } else {
          dueDate = addMonths(start, i);
        }
      }

      // Calculate amount
      // If this is the absolute last installment of the PLAN, it absorbs the remainder of the TOTAL amount.
      // Otherwise, it's just the unit amount.
      const isAbsoluteLast = currentInstallmentNumber === totalPlanCount;
      let amount = amountPerInstallment;

      if (isAbsoluteLast) {
        // Calculate what the theoretical sum of all previous installments (1 to N-1) would be
        const previousTotal = amountPerInstallment * (totalPlanCount - 1);
        amount = product.salePrice - previousTotal;
      }

      // Add to our list
      installments.push({
        id: generateId(),
        saleId: '',
        number: currentInstallmentNumber,
        amount: amount,
        dueDate: toLocalISOString(dueDate),
        status: 'pending'
      });
    }

    // Calculate the actual remaining debt based on what we generated
    const actualRemainingDebt = installments.reduce((sum, inst) => sum + inst.amount, 0);

    const payload = {
      clientId,
      product,
      totalAmount: product.salePrice,
      remainingAmount: actualRemainingDebt,
      frequency,
      paymentMethod: method,
      startDate,
      status: 'active',
      missedPaymentsCount: 0,
      createdAt: new Date().toISOString(),
      weeklyDay: frequency === 'Semanal' ? weeklyDay : undefined,
      monthlyDay: frequency === 'Mensual' ? monthlyDay : undefined,
      installments: installments
    };

    if (user) {
      await addDoc(collection(db, 'users', user.uid, 'sales'), payload);
    }
    // Update local sale mapping if needed, though onSnapshot handles it
  };

  const addLead = async (description: string, clientId?: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'leads'), {
      clientId: clientId || null,
      description,
      status: 'new',
      createdAt: new Date().toISOString()
    });
  };

  const deleteLead = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'leads', id));
  };

  const toggleSaleStatus = async (saleId: string) => {
    if (!user) return;
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const newStatus = sale.status === 'active' ? 'defaulted' : 'active';
    await updateDoc(doc(db, 'users', user.uid, 'sales', saleId), { status: newStatus });
  };

  const markInstallmentPaid = async (saleId: string, installmentId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const updatedInstallments = sale.installments.map(inst => {
      if (inst.id === installmentId) {
        const newStatus = inst.status === 'paid' ? 'pending' : 'paid';
        return {
          ...inst,
          status: newStatus,
          paidAt: newStatus === 'paid' ? new Date().toISOString() : null
        } as Installment;
      }
      return inst;
    });

    const remaining = updatedInstallments.reduce((acc, curr) => curr.status === 'pending' ? acc + curr.amount : acc, 0);
    const roundedRemaining = Math.max(0, Math.round(remaining * 100) / 100);
    const isComplete = roundedRemaining <= 0;

    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'sales', saleId), {
      installments: updatedInstallments,
      remainingAmount: roundedRemaining,
      status: isComplete ? 'completed' : (sale.status === 'completed' ? 'active' : sale.status)
    });
  };

  const reportMissedPayment = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const updatedMissedCount = (sale.missedPaymentsCount || 0) + 1;

    const updatedInstallments = sale.installments.map(inst => {
      if (inst.status === 'pending') {
        const currentDate = new Date(inst.dueDate.split('T')[0] + 'T00:00:00');
        let nextDate = new Date(currentDate);

        if (sale.frequency === 'Diaria') {
          nextDate = addDays(currentDate, 1);
        } else if (sale.frequency === 'Semanal') {
          nextDate = addDays(currentDate, 7);
        } else if (sale.frequency === 'Mensual') {
          nextDate = addMonths(currentDate, 1);
        }

        return { ...inst, dueDate: toLocalISOString(nextDate) };
      }
      return inst;
    });

    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'sales', saleId), {
      missedPaymentsCount: updatedMissedCount,
      installments: updatedInstallments
    });
  };

  const deleteSale = async (saleId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'sales', saleId));
  };

  const updateSale = async (updatedSale: Sale) => {
    if (!user) return;
    const { id, ...data } = updatedSale;
    await updateDoc(doc(db, 'users', user.uid, 'sales', id), data);
  };

  const isDefaulter = (clientId: string) => {
    return sales.some(s => s.clientId === clientId && s.status === 'defaulted');
  };

  const getClientStats = (clientId: string) => {
    const clientSales = sales.filter(s => s.clientId === clientId);
    const totalPurchased = clientSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalDebt = clientSales.reduce((acc, s) => acc + s.remainingAmount, 0);
    const totalPaid = totalPurchased - totalDebt;

    return {
      totalPurchased,
      totalPaid,
      totalDebt,
      history: clientSales.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    };
  };

  return (
    <StoreContext.Provider value={{
      clients, sales, leads, addClient, updateClient, deleteClient, addSale, addLead, markInstallmentPaid, reportMissedPayment, toggleSaleStatus, deleteLead,
      preSelectedClientId, setPreSelectedClientId, isDefaulter, getClientStats, updateSale, deleteSale
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};