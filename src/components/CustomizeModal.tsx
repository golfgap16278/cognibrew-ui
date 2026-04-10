import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../types';

type CustomizeModalProps = {
  editingCartItem: CartItem | null;
  sweetnessLevels: string[];
  milkTypes: string[];
  beanTypes: string[];
  onSetEditingCartItem: (item: CartItem | null) => void;
  onSave: (editedItem: CartItem, cleanModifiers: Record<string, string>) => void;
};

export default function CustomizeModal({
  editingCartItem,
  sweetnessLevels,
  milkTypes,
  beanTypes,
  onSetEditingCartItem,
  onSave,
}: CustomizeModalProps) {
  return (
    <AnimatePresence>
      {editingCartItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => onSetEditingCartItem(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="font-headline font-bold text-2xl text-stone-800">Customize</h2>
                <p className="text-stone-500 text-sm">{editingCartItem.name}</p>
              </div>
              <button
                onClick={() => onSetEditingCartItem(null)}
                className="w-8 h-8 rounded-full bg-stone-200/50 flex items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
              {/* Sweetness */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sweetness</label>
                <div className="flex flex-wrap gap-2">
                  {sweetnessLevels.map(level => {
                    const isSelected = (editingCartItem.modifiers?.sweetness || 'Regular') === level;
                    return (
                      <button
                        key={level}
                        onClick={() => onSetEditingCartItem({
                          ...editingCartItem,
                          modifiers: { ...editingCartItem.modifiers, sweetness: level === 'Regular' ? undefined : level }
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border focus:outline-none ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Milk Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Milk</label>
                <div className="flex flex-wrap gap-2">
                  {milkTypes.map(milk => {
                    const isSelected = (editingCartItem.modifiers?.milk || 'Whole Milk') === milk;
                    return (
                      <button
                        key={milk}
                        onClick={() => onSetEditingCartItem({
                          ...editingCartItem,
                          modifiers: { ...editingCartItem.modifiers, milk: milk === 'Whole Milk' ? undefined : milk }
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border focus:outline-none ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}
                      >
                        {milk}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bean Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Beans</label>
                <div className="flex flex-wrap gap-2">
                  {beanTypes.map(bean => {
                    const isSelected = (editingCartItem.modifiers?.bean || 'House Blend') === bean;
                    return (
                      <button
                        key={bean}
                        onClick={() => onSetEditingCartItem({
                          ...editingCartItem,
                          modifiers: { ...editingCartItem.modifiers, bean: bean === 'House Blend' ? undefined : bean }
                        })}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border focus:outline-none ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'}`}
                      >
                        {bean}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50">
              <button
                onClick={() => {
                  // Clean up undefined modifiers
                  const cleanModifiers = Object.fromEntries(
                    Object.entries(editingCartItem.modifiers || {}).filter(([_, v]) => v !== undefined)
                  ) as Record<string, string>;
                  onSave(editingCartItem, cleanModifiers);
                }}
                className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-fixed hover:text-primary active:scale-[0.98] transition-all shadow-md focus:outline-none"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
