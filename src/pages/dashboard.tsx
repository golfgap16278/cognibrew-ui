import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { Customer, MenuItem, Category, CartItem, Feedback } from '../types';
import { apiService } from '../services/api';
import { useDashboardData } from '../hooks/useDashboardData';

import Sidebar from '../components/Sidebar';
import AiInsightsPanel from '../components/AiInsightsPanel';
import MenuPanel from '../components/MenuPanel';
import OrderPanel from '../components/OrderPanel';
import CustomizeModal from '../components/CustomizeModal';
import MembershipModal from '../components/MembershipModal';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  // ─── State ──────────────────────────────────────────────────────────
  const [detectedCustomers, setDetectedCustomers] = useState<Customer[]>([]);
  const [insightsCustomerId, setInsightsCustomerId] = useState<string>('');
  const [isFaceRecognitionDown, setIsFaceRecognitionDown] = useState<boolean>(false);
  const [isFaceDetecting, setIsFaceDetecting] = useState<boolean>(false);
  const faceDetectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [isDineIn, setIsDineIn] = useState<boolean>(true);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [linkedCustomer, setLinkedCustomer] = useState<Customer | null>(null);

  const {
    menuItems,
    menuCategories,
    popularItems,
    sweetnessLevels,
    milkTypes,
    beanTypes,
    customerDatabase,
    isLoading
  } = useDashboardData();

  // ─── Callbacks ──────────────────────────────────────────────────────

  // Fire-and-forget feedback to ML backend (never blocks UI)
  const sendFeedback = (type: Feedback['type'], customer: Customer, orderId?: string) => {
    apiService.sendFeedback({
      type,
      face_id: customer.face_id,
      customerName: customer.name,
      isGuest: customer.isGuest || false,
      orderId: orderId || null,
      timestamp: new Date().toISOString(),
    }).catch(err => console.error('Feedback send failed (non-blocking):', err));
  };

  const handleAddToCart = (item: MenuItem, modifiers: Record<string, string> = {}) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && JSON.stringify(i.modifiers || {}) === JSON.stringify(modifiers));
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: Math.random().toString(36).substr(2, 9), menuItemId: item.id, name: item.name, price: item.price, quantity: 1, modifiers }];
    });
  };

  // Remove focused customer from queue (shared by all dismiss-type actions)
  const dismissFocused = () => {
    if (detectedCustomers.length === 0) return;
    setDetectedCustomers(prev => {
      const remaining = prev.filter(c => c.face_id !== insightsCustomerId);
      if (remaining.length > 0) {
        setInsightsCustomerId(remaining[0].face_id);
      }
      return remaining;
    });
  };

  // Registered card: "Wrong Person" → False Positive
  const handleWrongPerson = () => {
    const customer = detectedCustomers.find(c => c.face_id === insightsCustomerId);
    if (customer) sendFeedback('false_positive', customer);
    dismissFocused();
  };

  // Guest card: "Not a Guest" → False Negative
  const handleNotAGuest = () => {
    const customer = detectedCustomers.find(c => c.face_id === insightsCustomerId);
    if (customer) sendFeedback('false_negative', customer);
    dismissFocused();
  };

  // Both cards: "Skip" → Ignored (track skip rates)
  const handleSkip = () => {
    const customer = detectedCustomers.find(c => c.face_id === insightsCustomerId);
    if (customer) sendFeedback('skip', customer);
    dismissFocused();
  };

  const handleFocus = (idToFocus: string) => {
    if (idToFocus === insightsCustomerId) return;
    setInsightsCustomerId(idToFocus);
  };

  const handleCustomizeSave = (editedItem: CartItem, cleanModifiers: Record<string, string>) => {
    setCartItems(prev => {
      const identicalExisting = prev.find(i => i.id !== editedItem.id && i.menuItemId === editedItem.menuItemId && JSON.stringify(i.modifiers || {}) === JSON.stringify(cleanModifiers));
      if (identicalExisting) {
        return prev.map(i => {
          if (i.id === identicalExisting.id) return { ...i, quantity: i.quantity + editedItem.quantity };
          return i;
        }).filter(i => i.id !== editedItem.id);
      } else {
        return prev.map(i => i.id === editedItem.id ? { ...i, modifiers: cleanModifiers } : i);
      }
    });
    setEditingCartItem(null);
  };

  const handleClear = () => {
    setCartItems([]);
    setLinkedCustomer(null);
  };

  const handleOpenMembership = () => {
    setIsMembershipModalOpen(true);
    setPhoneNumber('');
    setPhoneError('');
  };

  const handleCheckout = async () => {

    // Submit the order to the backend first
    try {
      await apiService.submitOrder({
        face_id: linkedCustomer?.face_id || 'guest',
        orderId: linkedCustomer?.orderId || 'New',
        items: cartItems,
        total: (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.10).toFixed(2),
        isDineIn
      });

      // Then send the feedback to the backend (fire-and-forget)
      if (linkedCustomer) {
        const feedbackType = linkedCustomer.isGuest ? 'true_negative' : 'true_positive';
        sendFeedback(feedbackType, linkedCustomer, linkedCustomer.orderId);
      }

      // Only clear UI after successful submission
      setCartItems([]);
      setActiveMenuCategory(null);

      if (linkedCustomer) {
        setDetectedCustomers(prev => {
          const remaining = prev.filter(c => c.face_id !== linkedCustomer.face_id);
          if (insightsCustomerId === linkedCustomer.face_id && remaining.length > 0) {
            setInsightsCustomerId(remaining[0].face_id);
          }
          return remaining;
        });
        setLinkedCustomer(null);
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Failed to submit the order to the kitchen. Please try again.');
    }
  };

  // ─── Effects ────────────────────────────────────────────────────────

  /*
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://192.168.1.50:8000/inferenceHub')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('FaceDetected', (data) => {
      const customerId = data.customerId;
      console.log('FaceDetected event received for customerId:', customerId);
    });

    connection.start().catch((error) => console.error('SignalR Connection Error: ', error));

    return () => {
      connection.stop();
    };
  }, []);
  */

  useEffect(() => {
    if (isFaceRecognitionDown) return;

    const pollDetection = async () => {
      try {
        const data = await apiService.detectCustomer();

        if (data.customer) {
          setIsFaceDetecting(true);

          if (faceDetectionTimerRef.current) {
            clearTimeout(faceDetectionTimerRef.current);
          }

          faceDetectionTimerRef.current = setTimeout(() => {
            setIsFaceDetecting(false);
            faceDetectionTimerRef.current = null;
          }, 4000);

          setDetectedCustomers(prev => {
            if (prev.length === 0) setInsightsCustomerId(data.customer.face_id);
            return [...prev, data.customer];
          });
        }
      } catch (error) {
        console.error('Failed to poll detection:', error);
      }
    };

    // Auto-detect a new customer every 15 seconds by querying the proxy
    const intervalId = setInterval(pollDetection, 15000);
    return () => clearInterval(intervalId);
  }, [isFaceRecognitionDown]);

  const insightsCustomer = detectedCustomers.find(c => c.face_id === insightsCustomerId) || detectedCustomers[0];

  // ─── Render ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-white text-xl">
        กำลังโหลดระบบ...
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex h-screen w-full bg-background text-on-background">
      {/* Zone 1: Sidebar */}
      <Sidebar onLogout={onLogout} />

      {/* Main Content Area */}
      <main className="ml-24 flex-1 flex flex-col h-screen overflow-hidden">
        {/* POS Canvas */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Zone 2: AI Insights */}
          <AiInsightsPanel
            detectedCustomers={detectedCustomers}
            insightsCustomerId={insightsCustomerId}
            isFaceRecognitionDown={isFaceRecognitionDown}
            isFaceDetecting={isFaceDetecting}
            menuItems={menuItems}
            popularItems={popularItems}
            insightsCustomer={insightsCustomer}
            onAddToCart={handleAddToCart}
            onWrongPerson={handleWrongPerson}
            onNotAGuest={handleNotAGuest}
            onSkip={handleSkip}
            onFocus={handleFocus}
            onSetLinkedCustomer={setLinkedCustomer}
            onSetIsFaceRecognitionDown={setIsFaceRecognitionDown}
          />

          {/* Right Area: Standard POS (Menu + Order) */}
          <div className="flex-1 flex gap-6 min-h-0">
            {/* Zone 3: Menu */}
            <MenuPanel
              menuCategories={menuCategories}
              menuItems={menuItems}
              activeMenuCategory={activeMenuCategory}
              onSelectCategory={setActiveMenuCategory}
              onAddToCart={handleAddToCart}
            />

            {/* Zone 4: Order */}
            <OrderPanel
              cartItems={cartItems}
              linkedCustomer={linkedCustomer}
              isDineIn={isDineIn}
              onSetCartItems={setCartItems}
              onSetEditingCartItem={setEditingCartItem}
              onSetIsDineIn={setIsDineIn}
              onOpenMembership={handleOpenMembership}
              onClear={handleClear}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CustomizeModal
        editingCartItem={editingCartItem}
        sweetnessLevels={sweetnessLevels}
        milkTypes={milkTypes}
        beanTypes={beanTypes}
        onSetEditingCartItem={setEditingCartItem}
        onSave={handleCustomizeSave}
      />

      <MembershipModal
        isOpen={isMembershipModalOpen}
        customerDatabase={customerDatabase}
        phoneNumber={phoneNumber}
        phoneError={phoneError}
        onClose={() => setIsMembershipModalOpen(false)}
        onSetPhoneNumber={setPhoneNumber}
        onSetPhoneError={setPhoneError}
        onSetLinkedCustomer={setLinkedCustomer}
      />
    </div>
  );
}
