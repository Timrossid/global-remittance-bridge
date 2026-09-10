import { create } from 'zustand';

export interface CheckoutState {
  amount: string;
  currency: string;
  recipient: string;
  setAmount: (amount: string) => void;
  setCurrency: (currency: string) => void;
  setRecipient: (recipient: string) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  amount: '',
  currency: 'USDC',
  recipient: '',
  setAmount: (amount) => set({ amount }),
  setCurrency: (currency) => set({ currency }),
  setRecipient: (recipient) => set({ recipient }),
  reset: () => set({ amount: '', currency: 'USDC', recipient: '' }),
}));
