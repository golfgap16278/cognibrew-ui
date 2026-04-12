// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useDashboardData() {
  // 1. State สำหรับเมนู
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [popularItems, setPopularItems] = useState([]);

  // 2. State สำหรับ Config (ที่เพิ่มเข้ามา)
  const [sweetnessLevels, setSweetnessLevels] = useState([]);
  const [milkTypes, setMilkTypes] = useState([]);
  const [beanTypes, setBeanTypes] = useState([]);
  const [customerDatabase, setCustomerDatabase] = useState({});

  // 3. State สำหรับสถานะการโหลด
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // เรียก API 3 ตัวพร้อมกัน
        const [configData, menuData, popularData] = await Promise.all([
          apiService.getConfig(),
          apiService.getMenu(),
          apiService.getPopular()
        ]);

        // นำข้อมูล Config มาเก็บลง State
        if (configData.SWEETNESS_LEVELS) setSweetnessLevels(configData.SWEETNESS_LEVELS);
        if (configData.MILK_TYPES) setMilkTypes(configData.MILK_TYPES);
        if (configData.BEAN_TYPES) setBeanTypes(configData.BEAN_TYPES);
        if (configData.customerDatabase) setCustomerDatabase(configData.customerDatabase);

        // นำข้อมูล Menu มาเก็บลง State
        if (menuData.menuItems) setMenuItems(menuData.menuItems);
        if (menuData.menuCategories) setMenuCategories(menuData.menuCategories);

        // นำข้อมูล Popular มาเก็บลง State
        setPopularItems(popularData.popularItems);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // ส่งข้อมูลทั้งหมดกลับไปให้ dashboard.tsx ใช้งาน
  return {
    menuItems,
    menuCategories,
    popularItems,
    sweetnessLevels,
    milkTypes,
    beanTypes,
    customerDatabase,
    isLoading
  };
}