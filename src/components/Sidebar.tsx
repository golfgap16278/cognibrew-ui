export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col items-center py-6 gap-4 bg-primary-container w-24 border-none font-manrope tracking-tight z-10 shadow-lg">
      <div className="mb-8 flex flex-col items-center gap-1">
        <div className="w-12 h-12 text-on-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[2.5rem]" style={{ fontVariationSettings: "'FILL' 1" }}>coffee_maker</span>
        </div>
        <span className="font-headline font-black text-[0.625rem] tracking-widest text-on-primary-container">CogniBrew</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        <a className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-2xl w-20 h-20 shadow-md tap-friendly large touch targets scale-95 transition-transform" href="#">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>point_of_sale</span>
          <span className="text-[0.625rem] mt-1 font-bold">Register</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-primary-container w-20 h-20 hover:text-on-primary rounded-2xl transition-all" href="#">
          <span className="material-symbols-outlined text-2xl">history</span>
          <span className="text-[0.625rem] mt-1 font-bold">History</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-primary-container w-20 h-20 hover:text-on-primary rounded-2xl transition-all" href="#">
          <span className="material-symbols-outlined text-2xl">chef_hat</span>
          <span className="text-[0.625rem] mt-1 font-bold">Kitchen</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-primary-container w-20 h-20 hover:text-on-primary rounded-2xl transition-all" href="#">
          <span className="material-symbols-outlined text-2xl">group</span>
          <span className="text-[0.625rem] mt-1 font-bold">Customers</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-primary-container w-20 h-20 hover:text-on-primary rounded-2xl transition-all" href="#">
          <span className="material-symbols-outlined text-2xl">settings</span>
          <span className="text-[0.625rem] mt-1 font-bold">Settings</span>
        </a>
      </nav>
      <button 
        onClick={onLogout} 
        className="mt-auto flex flex-col items-center justify-center text-on-primary-container w-20 h-20 hover:text-error rounded-2xl transition-all"
      >
        <span className="material-symbols-outlined text-2xl">logout</span>
        <span className="text-[0.625rem] mt-1 font-bold">Log Out</span>
      </button>
    </aside>
  );
}
