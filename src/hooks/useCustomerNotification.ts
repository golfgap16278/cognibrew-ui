import { useRef, useCallback } from 'react';
import type { Customer, MenuItem } from '../types';

type BufferedCustomer = Partial<Customer> & {
  _hasFirstTimerFired?: boolean;
};

export function useCustomerNotification(
  menuItems: MenuItem[],
  onCustomerVerified: (customer: Customer) => void,
  //onDetectionStart: () => void
) {
  const bufferRef = useRef<Record<string, BufferedCustomer>>({});
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const processPayload = useCallback(
    (rawCustomer: any) => {
      const id = rawCustomer.id || rawCustomer.face_id;
      if (!id) return;

      // Always trigger scanning effect if it's a valid ID
      //onDetectionStart();

      // ============================================
      // 1. THE GUEST FAST-TRACK
      // ============================================
      if (rawCustomer.isGuest === true) {
        const guestData: Customer = {
          face_id: id,
          name: 'Guest Customer',
          status: 'Unregistered Profile',
          points: 0,
          rank: 'Guest',
          image: '',
          usualOrder: '',
          usualOrderIcon: '',
          usualOrderId: '',
          usualSweetness: '',
          upsell: '',
          upsellId: '',
          greeting: '',
          isGuest: true,
          phone: '',
          isRecommendationAvailable: true,
          orderId: 'New',
        };
        // Instantly Push to React
        onCustomerVerified(guestData);
        return;
      }

      // ============================================
      // 2. THE REGISTERED CUSTOMER PIPELINE
      // ============================================

      // Initialize buffer structure if new person
      if (!bufferRef.current[id]) {
        bufferRef.current[id] = {
          face_id: id,
          isGuest: false,
          isRecommendationAvailable: false,
        };
      }
      const buffer = bufferRef.current[id];

      const menu_items = JSON.parse(localStorage.getItem('menu_items') || '[]') as MenuItem[];

      // Extraction Helpers
      const inFirstName = rawCustomer.firstName || '';
      const inUsualOrderId = rawCustomer.usualOrderId || '';
      const inUsualOrderName = rawCustomer.usualOrder || '';


      // const mappedUsualOrderName = inUsualOrderId
      //   ? menuItems.find((x) => x.id.trim().toLowerCase() === inUsualOrderId.trim().toLowerCase())?.name || null
      //   : null;

      const mappedUsualOrderId = menu_items?.find((x) => x.name_old === inUsualOrderName)?.id || null

      //const inUpsellId = rawCustomer.upsellId || '';

      const inUpsellName = rawCustomer.upsell || '';

      // const mappedUpsellName = inUpsellId
      //   ? menuItems.find((x) => x.id.trim().toLowerCase() === inUpsellId.trim().toLowerCase())?.name || null
      //   : null;

      const mappedUpsellId = menu_items?.find((x) => x.name_old === inUpsellName)?.id || null

      // -- Accumulate Component: CRM Identity --
      // (Only merge if it has real CRM data, prevents Out-Of-Order noise from overwriting it)
      if (inFirstName !== '') {
        buffer.name = rawCustomer.firstName;
        buffer.status = rawCustomer.status;
        buffer.points = rawCustomer.points;
        buffer.rank = rawCustomer.rank;
        buffer.image = rawCustomer.image;
        buffer.isGuest = false;
        buffer.orderId = 'New';
        //console.log(buffer)
      }

      // -- Accumulate Component: Recommendation --
      if (inUsualOrderId !== '') {
        buffer.usualOrderId = mappedUsualOrderId;
        buffer.usualOrder = rawCustomer.usualOrder;
        buffer.usualSweetness = rawCustomer.usualSweetness;
        buffer.upsellId = mappedUpsellId;
        buffer.upsell = rawCustomer.upsell;
        buffer.greeting = rawCustomer.greeting;
        buffer.isRecommendationAvailable = true;
        //console.log(buffer)

      }

      // ============================================
      // 3. DISPATCH EVALUATOR GUARDRAILS
      // ============================================

      const hasCRM = !!buffer.name;
      const hasRecommendation = !!buffer.usualOrderId;

      const commit = () => {

        onCustomerVerified({ ...buffer } as Customer);
      };

      // Rule A: Missing CRM (e.g. Stage 1 Payload or out-of-order Stage 3) -> Block Render
      if (!hasCRM) {
        return;
      }

      // Rule B: Has CRM but NO Recommendation (Stage 2) -> Wait 100ms
      if (hasCRM && !hasRecommendation) {
        if (!buffer._hasFirstTimerFired) {
          if (timerRef.current[id]) clearTimeout(timerRef.current[id]);

          timerRef.current[id] = setTimeout(() => {
            buffer._hasFirstTimerFired = true;
            commit(); // Render Partial
          }, 100);
        }
        return;
      }

      // Rule C: Has Both (Stage 3) -> Clear Timers, Push Instantly
      if (hasCRM && hasRecommendation) {
        if (timerRef.current[id]) {
          clearTimeout(timerRef.current[id]);
        }
        buffer._hasFirstTimerFired = true;
        commit(); // Render Full
      }
    },
    [menuItems, onCustomerVerified]
    //[menuItems, onCustomerVerified, onDetectionStart]
  );

  return { processPayload };
}