// src/services/api.ts
import type { Feedback } from '../types';

const API_BASE_URL = 'http://localhost:3002/api';
const HUB_API = 'http://localhost:5010/chatHub';

export const apiService = {
  getHubEndpoint: () => {
    return HUB_API;
  },

  // ดึงข้อมูลการตั้งค่าพื้นฐาน
  getConfig: async () => {
    const res = await fetch(`${API_BASE_URL}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  },

  // ดึงข้อมูลเมนู
  getMenu: async () => {
    const res = await fetch(`${API_BASE_URL}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  // ดึงข้อมูลเมนูยอดฮิต
  getPopular: async () => {
    const res = await fetch(`${API_BASE_URL}/popular`);
    if (!res.ok) throw new Error('Failed to fetch popular items');
    return res.json();
  },

  // ดึงข้อมูลลูกค้าจากกล้อง (จำลอง)
  detectCustomer: async () => {
    const res = await fetch(`${API_BASE_URL}/detect`);
    if (!res.ok) throw new Error('Failed to detect customer');
    return res.json();
  },

  // ส่งข้อมูล Order
  submitOrder: async (orderData: any) => {
    const res = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  // ส่งข้อมูล Feedback ให้ AI
  sendFeedback: async (feedbackData: Feedback) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    return res.json();
  }
};