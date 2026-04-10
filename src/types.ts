export type Customer = {
  id: string;
  orderId: string;
  name: string;
  firstName: string;
  status: string;
  points: number;
  rank: 'Gold' | 'Silver' | 'Regular' | 'New' | 'Guest';
  image: string;
  usualOrder: string;
  usualOrderIcon: string;
  usualOrderId?: string;
  usualSweetness?: string;
  upsell: string;
  upsellId?: string;
  greeting: string;
  isGuest?: boolean;
  phone?: string;
  isRecommendationDown?: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
};

export type Category = {
  name: string;
  icon: string;
};

export type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: Record<string, string>;
};
