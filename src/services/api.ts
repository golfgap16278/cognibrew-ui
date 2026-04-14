// src/services/api.ts
import type { Feedback } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3002/api`;
const HUB_API = import.meta.env.VITE_HUB_API || `http://${window.location.hostname}:5010/chatHub`;
export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || `http://${window.location.hostname}:60080`;

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
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  // ส่งข้อมูล Feedback ให้ AI
  sendFeedback: async (feedbackData: Feedback) => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(feedbackData),
    });
    return res.json();
  },

  // ส่งข้อมูล Payload เพื่อ Log ใน Server
  logPayload: async (payload: any) => {
    const res = await fetch(`${API_BASE_URL}/log-payload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // ส่งข้อมูลสถานะการเชื่อมต่อ เพื่อ Log ใน Server
  logStatus: async (statusData: { status: string; details?: any }) => {
    const res = await fetch(`${API_BASE_URL}/log-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData),
    });
    return res.json();
  }
};