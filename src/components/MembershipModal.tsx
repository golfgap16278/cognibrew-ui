import { motion, AnimatePresence } from 'motion/react';
import type { Customer } from '../types';

type MembershipModalProps = {
  isOpen: boolean;
  customerDatabase: Customer[];
  phoneNumber: string;
  phoneError: string;
  onClose: () => void;
  onSetPhoneNumber: (value: string) => void;
  onSetPhoneError: (value: string) => void;
  onSetLinkedCustomer: (customer: Customer) => void;
};

export default function MembershipModal({
  isOpen,
  customerDatabase,
  phoneNumber,
  phoneError,
  onClose,
  onSetPhoneNumber,
  onSetPhoneError,
  onSetLinkedCustomer,
}: MembershipModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 bg-stone-50">
              <div className="flex justify-between items-center">
                <h2 className="font-headline font-bold text-2xl text-stone-800">Member Lookup</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center hover:bg-stone-300 transition-colors text-stone-600"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">close</span>
                </button>
              </div>
              <p className="text-stone-500 text-sm mt-1">Enter phone number to identify customer</p>
            </div>

            <div className="p-6">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-2 text-center h-16 flex items-center justify-center">
                <span className={`font-mono text-2xl tracking-widest ${phoneNumber ? 'text-stone-800' : 'text-stone-300'}`}>
                  {phoneNumber || '____'}
                </span>
              </div>

              <div className="h-6 mb-4 flex items-center justify-center">
                {phoneError && <p className="text-error text-sm font-medium">{phoneError}</p>}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => onSetPhoneNumber(phoneNumber.length < 4 ? phoneNumber + num : phoneNumber)}
                    className="h-14 bg-stone-100 rounded-2xl font-headline font-bold text-2xl text-stone-700 hover:bg-stone-200 active:scale-95 transition-all focus:outline-none"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => onSetPhoneNumber('')}
                  className="h-14 bg-stone-50 rounded-2xl font-headline font-bold text-sm text-stone-400 hover:bg-stone-100 active:scale-95 transition-all focus:outline-none"
                >
                  CLEAR
                </button>
                <button
                  onClick={() => onSetPhoneNumber(phoneNumber.length < 4 ? phoneNumber + '0' : phoneNumber)}
                  className="h-14 bg-stone-100 rounded-2xl font-headline font-bold text-2xl text-stone-700 hover:bg-stone-200 active:scale-95 transition-all focus:outline-none"
                >
                  0
                </button>
                <button
                  onClick={() => onSetPhoneNumber(phoneNumber.slice(0, -1))}
                  className="h-14 bg-stone-50 rounded-2xl flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all text-stone-500 focus:outline-none"
                >
                  <span className="material-symbols-outlined">backspace</span>
                </button>
              </div>

              <button
                onClick={() => {
                  // Simple lookup logic (ignoring dashes/formatting for demo)
                  const found = customerDatabase.find(c => c.phone && c.phone.replace(/\D/g, '') === phoneNumber.replace(/\D/g, ''));
                  if (found) {
                    onSetLinkedCustomer(found);
                    onClose();
                  } else {
                    onSetPhoneError('Member not found. Try 1111');
                  }
                }}
                disabled={phoneNumber.length === 0}
                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-fixed hover:text-primary active:scale-[0.98] transition-all shadow-md focus:outline-none disabled:opacity-50 disabled:active:scale-100"
              >
                Lookup Member
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
