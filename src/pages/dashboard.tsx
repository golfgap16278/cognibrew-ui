import { useState, useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { Customer, MenuItem, Category, CartItem, Feedback } from '../types';
import { apiService } from '../services/api';
import { useDashboardData } from '../hooks/useDashboardData';
import { useCustomerNotification } from '../hooks/useCustomerNotification';

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

  const menuItemsRef = useRef(menuItems);
  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);

  const updateCustomerList = useCallback((newCustomer: Customer) => {
    setDetectedCustomers((prev) => {
      const existingIndex = prev.findIndex((c) => c.face_id === newCustomer.face_id);
      if (existingIndex !== -1) {
        const updatedList = [...prev];
        updatedList[existingIndex] = { ...prev[existingIndex], ...newCustomer };
        return updatedList;
      }
      return [...prev, newCustomer];
    });
  }, []);

  const { processPayload } = useCustomerNotification(
    menuItemsRef.current,
    updateCustomerList,
  );

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

  useEffect(() => {
    if (isFaceRecognitionDown) return;

    // 1. ตั้งค่าการเชื่อมต่อ SignalR
    const hubUrl = apiService.getHubEndpoint();
    const token = localStorage.getItem('access_token') || ""; // ดึง Token

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    // 2. ฟังก์ชันจัดการเมื่อได้รับข้อมูลจาก SignalR เพื่อให้ UI แสดงผลได้ถูกต้อง
    connection.on("Notify", (payload) => {
      // ส่ง Payload กลับไปให้ Server ช่วยรับ Log (Fire and Forget)
      apiService.logPayload(payload).catch(err => console.error("Failed to log payload:", err));

      if (payload && payload.customer) {
        processPayload(payload.customer);
      }
    });

    // เพิ่ม Event listeners for connection state changes ส่งกลับ Proxy Server สำหรับ debug
    connection.onreconnecting(error => {
      apiService.logStatus({ status: 'Reconnecting', details: error?.message }).catch(() => { });
    });

    connection.onreconnected(connectionId => {
      apiService.logStatus({ status: 'Reconnected', details: { connectionId } }).catch(() => { });
    });

    connection.onclose(error => {
      apiService.logStatus({ status: 'Disconnected', details: error?.message }).catch(() => { });
    });

    // 3. เริ่มการเชื่อมต่อ
    connection.start()
      .then(() => {
        console.log("SignalR Connected to Hub");
        apiService.logStatus({ status: 'Connected' }).catch(() => { });
      })
      .catch((err) => {
        console.error("SignalR Connection Error: ", err);
        apiService.logStatus({ status: 'Connection Error', details: err?.message }).catch(() => { });
      });

    // Cleanup เมื่อ Component ถูกทำลาย
    return () => {
      connection.stop();
      if (faceDetectionTimerRef.current) {
        clearTimeout(faceDetectionTimerRef.current);
      }
    };
  }, [isFaceRecognitionDown]);

  // ใช้ useEffect ตัวนี้จัดการแทนเมื่อมีลูกค้าใหม่เข้ามาเป็นคนแรก
  useEffect(() => {
    // ถ้ายังไม่มีคนที่ถูกเลือก (Insights) และมีลูกค้าในคิวแล้ว ให้เลือกคนแรก
    if (detectedCustomers.length > 0 && !insightsCustomerId) {
      const firstCustomer = detectedCustomers[0];
      setInsightsCustomerId(firstCustomer.face_id || firstCustomer.id);
    }
  }, [detectedCustomers, insightsCustomerId]);

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
