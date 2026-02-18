export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export type PaymentFrequency = 'Diaria' | 'Semanal' | 'Mensual';
export type PaymentMethod = 'Efectivo' | 'Transferencia';

export interface Installment {
  id: string;
  saleId: string;
  number: number;
  amount: number;
  dueDate: string; // ISO Date string
  status: 'pending' | 'paid';
  paidAt?: string;
}

export interface Product {
  name: string;
  costPrice: number;
  salePrice: number;
}

export interface Sale {
  id: string;
  clientId: string;
  product: Product;
  totalAmount: number;
  remainingAmount: number;
  installments: Installment[];
  frequency: PaymentFrequency;
  paymentMethod: PaymentMethod;
  startDate: string;
  status: 'active' | 'completed' | 'defaulted';
  missedPaymentsCount: number;
  createdAt: string;
  weeklyDay?: number;
  monthlyDay?: number;
}

export interface Lead {
  id: string;
  clientId?: string;
  description: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  createdAt: string;
}

export type ViewState = 'dashboard' | 'clients' | 'sales' | 'accounting' | 'credits';