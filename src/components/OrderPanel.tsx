import type { CartItem, Customer } from '../types';

type OrderPanelProps = {
  cartItems: CartItem[];
  linkedCustomer: Customer | null;
  isDineIn: boolean;
  onSetCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onSetEditingCartItem: (item: CartItem | null) => void;
  onSetIsDineIn: (value: boolean) => void;
  onOpenMembership: () => void;
  onClear: () => void;
  onCheckout: () => Promise<void>;
};

export default function OrderPanel({
  cartItems,
  linkedCustomer,
  isDineIn,
  onSetCartItems,
  onSetEditingCartItem,
  onSetIsDineIn,
  onOpenMembership,
  onClear,
  onCheckout,
}: OrderPanelProps) {
  return (
    <section className="w-[26.25rem] bg-white rounded-3xl shadow-lg border border-stone-200 flex flex-col shrink-0 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50/50">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-headline font-bold text-xl text-stone-800 truncate pr-2">
            {linkedCustomer ? (linkedCustomer.isGuest ? 'Guest Order' : `${linkedCustomer.firstName}'s Order`) : 'Order'}
          </h2>
          <button
            onClick={() => onSetIsDineIn(!isDineIn)}
            className={`text-[0.625rem] font-black px-2 py-1 rounded shadow-sm transition-colors ${isDineIn ? 'bg-primary-fixed text-primary' : 'bg-stone-200 text-stone-600'
              }`}
          >
            {isDineIn ? 'DINE-IN' : 'TO-GO'}
          </button>
        </div>
        <p className="text-xs text-stone-500">
          Order #{linkedCustomer ? linkedCustomer.orderId : 'New'} • Staff: Alice

        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {cartItems.length === 0 ? null : (
          <div className="flex flex-col divide-y divide-dashed divide-stone-200 border-b border-dashed border-stone-200">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 py-5 first:pt-0">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-stone-800">{item.name}</span>
                  <span className="font-bold text-stone-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                  <div className="text-xs text-stone-500 flex flex-wrap gap-1 mt-0.5">
                    {Object.values(item.modifiers).map(mod => (
                      <span key={mod} className="bg-stone-100 px-2 py-0.5 rounded-md">{mod}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => onSetEditingCartItem(item)}
                    className="text-xs font-medium text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 hover:text-primary hover:border-primary hover:shadow-sm transition-all focus:outline-none flex items-center gap-1"
                  >
                    Customize
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onSetCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
                      }}
                      className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 text-stone-600"
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">remove</span>
                    </button>
                    <span className="font-bold text-sm text-stone-800 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => {
                        onSetCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                      }}
                      className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 text-stone-600"
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-stone-50 border-t border-stone-100">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm text-stone-500">
            <span>Subtotal</span>
            <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-500">
            <span>Tax (10%)</span>
            <span>${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.10).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2">
            <span className="font-headline font-bold text-lg text-stone-800">Total</span>
            <span className="font-headline font-extrabold text-4xl text-primary">
              ${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.10).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={onClear}
            disabled={cartItems.length === 0 && !linkedCustomer}
            className="flex-1 py-2 rounded-xl border border-stone-300 bg-stone-50 text-stone-600 font-medium text-xs disabled:text-stone-300 disabled:border-stone-200 hover:border-stone-600 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            disabled={cartItems.length === 0 && !linkedCustomer}
            onClick={onOpenMembership}
            className="flex-1 py-2 rounded-xl border border-primary-fixed bg-primary-fixed text-primary font-medium text-xs disabled:text-stone-300 disabled:bg-stone-50 active:scale-95 transition-all"
          >
            Membership
          </button>
        </div>
        <button
          disabled={cartItems.length === 0}
          onClick={onCheckout}
          className="w-full h-16 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg hover:opacity-90 disabled:opacity-10 disabled:active:scale-100"
        >
          <span className="material-symbols-outlined text-2xl">payments</span>
          <span className="font-headline font-bold text-xl">Checkout </span>
        </button>
      </div>
    </section>
  );
}
