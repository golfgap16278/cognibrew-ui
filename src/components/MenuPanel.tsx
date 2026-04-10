import type { Category, MenuItem } from '../types';

type MenuPanelProps = {
  menuCategories: Category[];
  menuItems: MenuItem[];
  activeMenuCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onAddToCart: (item: MenuItem) => void;
};

export default function MenuPanel({
  menuCategories,
  menuItems,
  activeMenuCategory,
  onSelectCategory,
  onAddToCart,
}: MenuPanelProps) {
  return (
    <section className="flex-1 bg-white rounded-3xl shadow-lg border border-stone-200 p-6 flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-5 shrink-0">
        <div className="flex items-center gap-3">
          {activeMenuCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            >
              <span className="material-symbols-outlined text-stone-600">arrow_back</span>
            </button>
          )}
          <h2 className="font-headline font-bold text-3xl text-primary">
            {activeMenuCategory || 'Menu'}
          </h2>
        </div>
      </div>

      <div className="overflow-y-auto custom-scrollbar pr-2 pb-4 -mr-2">
        {!activeMenuCategory ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Cards */}
            {menuCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="h-36 bg-stone-50 text-stone-800 rounded-3xl p-5 flex flex-col justify-between transition-all cursor-pointer group border border-stone-100 shadow-sm hover:border-primary-container hover:shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-headline font-bold text-lg leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Items Grid */}
            {menuItems.filter(item => item.category === activeMenuCategory).map((item) => (
              <button
                key={item.id}
                onClick={() => onAddToCart(item)}
                className="h-36 bg-stone-50 border border-stone-100 p-4 rounded-2xl flex flex-col hover:shadow-md hover:border-primary-container transition-all active:scale-95 text-left focus:outline-none"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 mb-auto">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                </div>
                <div className="w-full mt-2">
                  <div className="font-bold text-stone-800 leading-tight truncate">{item.name}</div>
                  <div className="text-stone-500 text-sm mt-0.5">${item.price.toFixed(2)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
