export type Customer = {
  face_id: string;
  name: string;
  status: string;
  points: number;
  rank: 'Gold' | 'Silver' | 'Regular' | 'New' | 'Guest';
  image: string;
  usualOrder: string;
  usualOrderIcon: string;
  usualOrderId: string;
  usualSweetness: string;
  upsell: string;
  upsellId: string;
  greeting: string;
  isGuest: boolean;
  phone: string;
  isRecommendationAvailable: boolean;
  orderId: string;
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

export type Feedback = {
  type: 'true_positive' | 'true_negative' | 'false_positive' | 'false_negative' | 'skip';
  face_id: string;
  customerName: string;
  isGuest: boolean;
  orderId: string | null;
  timestamp: string;
};
