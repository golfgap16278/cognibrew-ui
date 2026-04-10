import { motion, AnimatePresence } from 'motion/react';
import type { Customer, MenuItem } from '../types';

type AiInsightsPanelProps = {
  detectedCustomers: Customer[];
  insightsCustomerId: string;
  isFaceRecognitionDown: boolean;
  isRecommendationEngineDown: boolean;
  isFaceDetecting: boolean;
  menuItems: MenuItem[];
  popularItems: MenuItem[];
  insightsCustomer: Customer | undefined;
  onAddToCart: (item: MenuItem, modifiers?: Record<string, string>) => void;
  onWrongPerson: () => void;
  onNotAGuest: () => void;
  onSkip: () => void;
  onFocus: (id: string) => void;
  onSetLinkedCustomer: (customer: Customer) => void;
  onSetIsFaceRecognitionDown: (value: boolean) => void;
};

export default function AiInsightsPanel({
  detectedCustomers,
  insightsCustomerId,
  isFaceRecognitionDown,
  isRecommendationEngineDown,
  isFaceDetecting,
  menuItems,
  popularItems,
  insightsCustomer,
  onAddToCart,
  onWrongPerson,
  onNotAGuest,
  onSkip,
  onFocus,
  onSetLinkedCustomer,
  onSetIsFaceRecognitionDown,
}: AiInsightsPanelProps) {
  return (
    <section className="w-[26.25rem] min-w-[21.25rem] shrink-0 bg-stone-50/80 rounded-3xl border border-stone-200/60 p-6 flex flex-col overflow-hidden relative">
      <div className="flex items-center mb-4 shrink-0">
        <div className="relative flex items-center gap-2">
          {/* Glowing Text Shadow - Wide */}
          <div className={`absolute inset-0 flex items-center gap-2 transition-opacity duration-500 ease-in-out pointer-events-none blur-[8px] ${isFaceDetecting ? 'opacity-80' : 'opacity-0'}`} aria-hidden="true">
            <span className="material-symbols-outlined aurora-text" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h2 className="font-headline font-bold text-xl uppercase tracking-wider aurora-text">AI Insights</h2>
          </div>
          {/* Glowing Text Shadow - Tight */}
          <div className={`absolute inset-0 flex items-center gap-2 transition-opacity duration-500 ease-in-out pointer-events-none blur-[2px] ${isFaceDetecting ? 'opacity-80' : 'opacity-0'}`} aria-hidden="true">
            <span className="material-symbols-outlined aurora-text" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h2 className="font-headline font-bold text-xl uppercase tracking-wider aurora-text">AI Insights</h2>
          </div>

          <span className="material-symbols-outlined text-primary relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h2 className="font-headline font-bold text-xl uppercase tracking-wider text-primary relative z-10">AI Insights</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {isFaceRecognitionDown ? (
            <motion.div
              key="state-ai-down"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-stone-400 opacity-90"
            >
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center bg-error/10 rounded-full">
                <span className="material-symbols-outlined text-error" style={{ fontSize: '2.5rem' }}>sentiment_very_dissatisfied</span>
              </div>
              <p className="font-headline font-medium text-sm tracking-wide text-stone-500">AI is Dead</p>
              <p className="text-xs mt-1 text-stone-400 text-center max-w-[12.5rem] leading-relaxed">
                Please switch to Human Intelligence and take orders manually.
              </p>

              <button onClick={() => onSetIsFaceRecognitionDown(false)} className="mt-8 px-6 py-2 rounded-full bg-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-300 transition-colors">
                Revive AI
              </button>
            </motion.div>
          ) : detectedCustomers.length === 0 ? (
            <motion.div
              key="state-scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-stone-400 opacity-80"
            >
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-stone-300 animate-ping opacity-20"></div>
                <div className="absolute inset-4 rounded-full border-2 border-stone-300 animate-pulse opacity-40"></div>
                <span className="material-symbols-outlined text-4xl text-stone-400">radar</span>
              </div>
              <p className="font-headline font-medium text-sm tracking-wide text-stone-500">System Active</p>
              <p className="text-xs mt-1 text-stone-400">Scanning for customers...</p>

              {/* Debug buttons */}
              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <button onClick={() => onSetIsFaceRecognitionDown(true)} className="text-[0.625rem] uppercase tracking-widest text-stone-400 hover:text-error underline">
                  Simulate AI Down
                </button>
              </div>
            </motion.div>
          ) : insightsCustomer && (
            <motion.div
              key="state-customers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full justify-between"
            >
              {/* Primary Customer Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={insightsCustomer.id}
                  initial={{ opacity: 0, y: 32, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 32, scale: 0.95 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  className="bg-white rounded-3xl p-5 shadow-md border border-stone-100 flex flex-col relative overflow-hidden flex-1"
                >

                  {insightsCustomer.isGuest ? (
                    <>
                      {/* Guest State: Clickable Identity Header */}
                      <button
                        onClick={() => onSetLinkedCustomer(insightsCustomer)}
                        className="w-full flex flex-col items-center p-2 -mt-2 rounded-2xl border-1 border-white hover:bg-stone-50 hover:border-stone-200 active:scale-95 transition-all focus:outline-none group"
                      >
                        <div className="relative mb-2 flex justify-center">
                          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-stone-100 bg-stone-50 flex items-center justify-center shadow-sm group-hover:border-stone-200 transition-colors">
                            <span className="material-symbols-outlined text-stone-300" style={{ fontSize: '3.75rem' }}>person</span>
                          </div>
                        </div>
                        <h3 className="font-headline font-bold text-xl text-stone-400 mb-0.5 text-center">Guest</h3>
                        <p className="text-stone-500 font-label text-[0.6875rem] text-center">Unregistered Profile</p>
                      </button>

                      {/* Guest State: Contextual Suggestion Zone */}
                      <div className="w-full space-y-2.5 text-left mt-2">
                        {(isRecommendationEngineDown || insightsCustomer.isRecommendationDown) ? (
                          <div className="w-full flex flex-col items-center justify-center h-[12.5rem] gap-3">
                            <span className="material-symbols-outlined text-stone-300/60 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
                            <span className="text-[0.5625rem] uppercase tracking-widest font-bold text-stone-300">Recommendations Unavailable</span>
                          </div>
                        ) : (
                          <>
                            <label className="text-[0.5625rem] font-bold text-stone-400 uppercase tracking-widest block mb-1 px-1">Popular Right Now</label>

                            {popularItems.map(item => (
                              <button
                                key={item.id}
                                onClick={() => onAddToCart(item)}
                                className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-200 hover:border-primary hover:shadow-sm active:scale-[0.98] transition-all text-left group focus:outline-none flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                                  <span className="font-body font-bold text-sm text-stone-800 truncate">{item.name}</span>
                                </div>
                                <span className="material-symbols-outlined text-[1rem] text-stone-300 group-hover:text-primary transition-colors">add_circle</span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>

                      {/* Guest State: Exception Row */}
                      <div className="flex gap-3 w-full mt-auto mb-1">
                        <button onClick={onNotAGuest} className="flex-1 h-10 rounded-xl bg-error-container/30 text-error flex items-center justify-center gap-1.5 hover:bg-error-container/40 active:scale-95 transition-all text-xs font-bold focus:outline-none">
                          <span className="material-symbols-outlined text-[1rem]">warning</span>
                          Not a Guest
                        </button>
                        <button onClick={onSkip} className="flex-1 h-10 rounded-xl border border-stone-200 text-stone-400 flex items-center justify-center gap-1.5 hover:bg-stone-50 active:scale-95 transition-all text-xs font-bold focus:outline-none">
                          <span className="material-symbols-outlined text-[1rem]">fast_forward</span>
                          Skip
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Actionable Zone: Customer Profile */}
                      <button
                        onClick={() => onSetLinkedCustomer(insightsCustomer)}
                        className="w-full flex flex-col items-center p-2 -mt-2 rounded-2xl border-1 border-white hover:bg-stone-50 hover:border-stone-200 active:scale-95 transition-all focus:outline-none group"
                      >
                        <div className="relative mb-2 flex justify-center">
                          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-secondary-container shadow-sm transition-colors group-hover:border-secondary-container">
                            <img alt={insightsCustomer.name} className="w-full h-full object-cover" src={insightsCustomer.image} />
                          </div>
                        </div>
                        <h3 className="font-headline font-extrabold text-xl text-primary mb-0.5 text-center">{insightsCustomer.name}</h3>
                        <p className="text-stone-500 font-label text-[0.6875rem] text-center">{insightsCustomer.status} • {(insightsCustomer.points || 0).toLocaleString()} pts</p>
                      </button>

                      <div className="w-full space-y-2.5 text-left mt-2">
                        {(isRecommendationEngineDown || insightsCustomer.isRecommendationDown) ? (
                          <div className="w-full flex flex-col items-center justify-center h-[12.5rem] gap-3">
                            <span className="material-symbols-outlined text-stone-300/60 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
                            <span className="text-[0.5625rem] uppercase tracking-widest font-bold text-stone-300">Recommendations Unavailable</span>
                          </div>
                        ) : (
                          <>
                            {/* Actionable Zone: Usual Order */}
                            {insightsCustomer.usualOrderId && menuItems.find(i => i.id === insightsCustomer.usualOrderId) && (
                              <button
                                onClick={() => onAddToCart(menuItems.find(i => i.id === insightsCustomer.usualOrderId)!, insightsCustomer.usualSweetness && insightsCustomer.usualSweetness !== 'Regular' ? { sweetness: insightsCustomer.usualSweetness } : {})}
                                className="w-full bg-stone-50 p-3 rounded-2xl border border-stone-200 hover:border-primary hover:shadow-sm active:scale-[0.98] transition-all text-left group focus:outline-none"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-[0.5625rem] font-bold text-stone-400 uppercase tracking-widest cursor-pointer">Usual Order</label>
                                  <span className="material-symbols-outlined text-[0.875rem] text-stone-300 group-hover:text-primary transition-colors">add_circle</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-primary text-sm">{insightsCustomer.usualOrderIcon}</span>
                                  <span className="font-body font-bold text-sm text-stone-800 truncate">{insightsCustomer.usualOrder} {insightsCustomer.usualSweetness && insightsCustomer.usualSweetness !== 'Regular' ? `(${insightsCustomer.usualSweetness})` : ''}</span>
                                </div>
                              </button>
                            )}

                            {/* Actionable Zone: Upsell Suggestion */}
                            {insightsCustomer.upsellId && menuItems.find(i => i.id === insightsCustomer.upsellId) && (
                              <button
                                onClick={() => onAddToCart(menuItems.find(i => i.id === insightsCustomer.upsellId)!)}
                                className="w-full bg-primary-container p-3 rounded-2xl relative overflow-hidden shadow-sm hover:brightness-95 active:scale-[0.98] transition-all text-left group focus:outline-none border border-transparent hover:border-primary/20"
                              >
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                  <label className="text-[0.5625rem] font-bold text-primary-fixed uppercase tracking-widest cursor-pointer">Upsell Suggestion</label>
                                  <span className="material-symbols-outlined text-[0.875rem] text-primary-fixed opacity-50 group-hover:opacity-100 transition-opacity">add_circle</span>
                                </div>
                                <div className="flex items-center gap-2 relative z-10">
                                  <span className="material-symbols-outlined text-secondary-container text-sm">bakery_dining</span>
                                  <span className="font-body font-bold text-sm text-white truncate">{insightsCustomer.upsell}</span>
                                </div>
                              </button>
                            )}

                            <div className="border-l-2 border-primary-fixed pl-3 py-1">
                              <label className="text-[0.5625rem] font-bold text-stone-400 uppercase tracking-widest block mb-1">Greeting Script</label>
                              <p className="font-body italic text-primary text-[0.75rem] leading-relaxed line-clamp-3">
                                {insightsCustomer.greeting}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Exception Row */}
                      <div className="flex gap-3 w-full mt-auto mb-1">
                        <button onClick={onWrongPerson} className="flex-1 h-10 rounded-xl bg-error-container/30 text-error flex items-center justify-center gap-1.5 hover:bg-error-container/60 active:scale-95 transition-all text-xs font-bold">
                          <span className="material-symbols-outlined text-[1rem]">warning</span>
                          Wrong Person
                        </button>
                        <button onClick={onSkip} className="flex-1 h-10 rounded-xl border border-stone-200 text-stone-400 flex items-center justify-center gap-1.5 hover:bg-stone-50 active:scale-95 transition-all text-xs font-bold">
                          <span className="material-symbols-outlined text-[1rem]">fast_forward</span>
                          Skip
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Up Next Queue (Horizontal) */}
              {detectedCustomers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-stone-200/60 shrink-0">
                  <h4 className="text-[0.625rem] font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">Queuing</h4>
                  <div className="flex flex-row flex-wrap gap-2 items-center px-1">
                    <AnimatePresence mode="popLayout">
                      {detectedCustomers.slice(0, 4).map((customer) => (
                        <motion.button
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                          key={customer.id}
                          onClick={() => onFocus(customer.id)}
                          className="relative group focus:outline-none shrink-0"
                          title={`Focus ${customer.firstName}`}
                        >
                          {customer.isGuest ? (
                            <div className={`w-12 h-12 rounded-full bg-white border-2 group-hover:scale-105 transition-all shadow flex items-center justify-center ${insightsCustomerId === customer.id ? 'border-primary-fixed' : 'border-transparent group-hover:border-primary-container'}`}>
                              <span className="material-symbols-outlined text-stone-400 text-xl">person</span>
                            </div>
                          ) : (
                            <img
                              src={customer.image}
                              alt={customer.name}
                              className={`w-12 h-12 rounded-full object-cover border-2 group-hover:scale-105 transition-all shadow-sm ${insightsCustomerId === customer.id ? 'border-primary-fixed' : 'border-transparent group-hover:border-primary-container'}`}
                            />
                          )}

                        </motion.button>
                      ))}
                    </AnimatePresence>

                    {/* Overflow Pill */}
                    {detectedCustomers.length > 4 && (
                      <motion.div
                        layout
                        className="w-12 h-12 rounded-full bg-stone-100/80 text-stone-500 flex items-center justify-center font-bold text-sm shadow-inner border border-stone-200/50 shrink-0"
                      >
                        +{detectedCustomers.length - 4}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
