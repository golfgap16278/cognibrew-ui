# UI Architecture & State Management

## Tech Stack
* **Frontend:** React, Tailwind CSS, Framer Motion (for fluid animations).
* **Real-Time Data Processing:** SignalR (establishing a direct WebSocket connection from the backend machine to the frontend for low-latency ML inference streams).
* **API Proxy / Middleware:** A Node.js/Express application (`server.ts`). It currently serves as an offline mock-data provider but is architecturally positioned as an API proxy middleware. In the future, this will securely route client requests to the backend API Gateway.

## Layout Structure
The application is split into four main horizontal zones:
1. **Left Sidebar (`<aside>`):** Static navigation (Register, History, Kitchen, Customers, Settings). Fixed-positioned, `w-24` (96px at baseline).
2. **AI Insights Panel (`<section>`):** The dynamic "Customer Insight Card" area. Instead of standard HTTP polling, this section utilizes a **SignalR hook** directly in the React frontend to listen for near real-time camera detections. It renders a queue of recognized customers or guest profiles the moment an event is broadcasted. Fixed width `w-[26.25rem]` with `min-w-[21.25rem]` floor.
3. **Menu Panel (`<section>`):** A categorized menu grid displaying drink and food categories, with drill-down into individual items. Uses `flex-1` to fill remaining horizontal space.
4. **Order Panel (`<section>`):** The current order cart, showing line items, modifiers, totals, and checkout. Fixed width `w-80` (320px at baseline).

## Responsive Scaling
The UI is designed at a **1440×900 (16:10) baseline** resolution. All sizing uses `rem` units, and the root font-size scales proportionally with viewport dimensions:

```css
font-size: clamp(16px, min(1.1111vw, 1.7778vh), 22px);
```

* `min(vw, vh)` ensures the **tighter axis** always constrains scaling, preventing overflow on any aspect ratio.
* At 1440×900: 16px (1.0×). At 1920×1080: ~19.2px (1.2×, height-limited). Capped at 22px (1.375×).
* All hardcoded `px` values have been converted to `rem` to participate in scaling.

## Key State Variables
* `mockCustomers`, `menuItems`, `categories`: Initial configuration data fetched from the `server.ts` proxy middleware on mount.
* `customers`: An array of currently detected customers waiting in the physical queue, continuously updated and managed via incoming SignalR events.
* `focusedCustomerId`: Controls which customer card is currently expanded in the AI Insights panel.
* `cartItems`: The active order being built on the right side.
* `isAiDown` / `isRecommendationDown`: Feature flags to simulate graceful degradation. When toggled (or if the SignalR connection drops), the UI must adapt to hide AI features and rely entirely on the manual POS.

## Component Behaviors
* **Customization Modal:** Allows editing modifier states (Sweetness, Milk, Beans) for items in the cart.
* **Membership Modal:** A manual fallback lookup via phone number, satisfying the requirement to allow manual identification if the face recognition fails or the SignalR connection is interrupted.