// server.ts
import express from 'express';
import cors from 'cors';

const PORT = 3001;
// The local network IP of your Edge Machine
const EDGE_API_URL = process.env.EDGE_API_URL || 'http://192.168.1.50:8000';

const app = express();

// Enable CORS for your React UI
app.use(cors());
app.use(express.json());

// Mock Data for offline testing
const SWEETNESS_LEVELS = ["No Sugar", "Less Sugar", "Regular", "More Sugar"];
const MILK_TYPES = ["Whole Milk", "Oat Milk", "Almond Milk", "Soy Milk"];
const BEAN_TYPES = ["House Blend", "Single Origin", "Decaf"];

const customerDatabase = [
  {
    id: '1',
    orderId: '184',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    status: 'Gold Member',
    points: 4200,
    rank: 'Gold',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    usualOrder: 'Americano',
    usualOrderIcon: 'local_cafe',
    usualOrderId: '5',
    usualSweetness: 'No Sugar',
    upsell: 'Croissant',
    upsellId: '9',
    greeting: '"Hey Sarah! Welcome back. Shall we get your usual Americano started, and maybe pair it with a fresh Croissant today?"',
    phone: '555-0101'
  },
  {
    id: '2',
    orderId: '185',
    name: 'Guest Customer',
    firstName: 'Guest',
    status: 'Unregistered Profile',
    points: 0,
    rank: 'Guest',
    image: '',
    usualOrder: '',
    usualOrderIcon: '',
    upsell: '',
    greeting: '',
    isGuest: true,
    isRecommendationDown: true
  },
  {
    id: '3',
    orderId: '186',
    name: 'David Chen',
    firstName: 'David',
    status: 'Silver Member',
    points: 1500,
    rank: 'Silver',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    usualOrder: 'Latte',
    usualOrderIcon: 'local_cafe',
    usualOrderId: '1',
    usualSweetness: 'Less Sugar',
    upsell: 'Blueberry Muffin',
    upsellId: '10',
    greeting: '"Hi David! The usual Latte today?"',
    phone: '555-0102',
    isRecommendationDown: true
  },
  {
    id: '4',
    orderId: '187',
    name: 'Guest Customer',
    firstName: 'Guest',
    status: 'Unregistered Profile',
    points: 0,
    rank: 'Guest',
    image: '',
    usualOrder: '',
    usualOrderIcon: '',
    upsell: '',
    greeting: '',
    isGuest: true
  },
  {
    id: '5',
    orderId: '188',
    name: 'Emma Wilson',
    firstName: 'Emma',
    status: 'New Customer',
    points: 200,
    rank: 'New',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    usualOrder: 'Mocha Frappe',
    usualOrderIcon: 'blender',
    usualOrderId: '15',
    usualSweetness: 'More Sugar',
    upsell: 'Pumpkin Bread',
    upsellId: '11',
    greeting: '"Welcome back Emma! Would you like to try our Pumpkin Bread with your Frappe?"',
    phone: '555-0103'
  },
  {
    id: '6',
    orderId: '189',
    name: 'Michael Chang',
    firstName: 'Michael',
    status: 'Regular',
    points: 800,
    rank: 'Regular',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    usualOrder: 'Cold Brew',
    usualOrderIcon: 'ac_unit',
    usualOrderId: '7',
    usualSweetness: 'Regular',
    upsell: 'Peppermint Mocha',
    upsellId: '12',
    greeting: '"Morning Michael! Cold brew to start the day?"',
    phone: '555-0104'
  }
];

const menuItems = [
    { id: '1', name: 'Latte', price: 4.50, category: 'Hot Drinks', icon: 'local_cafe' },
    { id: '2', name: 'Cappuccino', price: 4.50, category: 'Hot Drinks', icon: 'local_cafe' },
    { id: '3', name: 'Flat White', price: 4.25, category: 'Hot Drinks', icon: 'local_cafe' },
    { id: '4', name: 'Cortado', price: 4.00, category: 'Hot Drinks', icon: 'local_cafe' },
    { id: '5', name: 'Americano', price: 3.50, category: 'Hot Drinks', icon: 'local_cafe' },
    { id: '6', name: 'Iced Latte', price: 5.00, category: 'Iced Drinks', icon: 'ac_unit' },
    { id: '7', name: 'Cold Brew', price: 4.50, category: 'Iced Drinks', icon: 'ac_unit' },
    { id: '8', name: 'Iced Matcha', price: 5.50, category: 'Iced Drinks', icon: 'ac_unit' },
    { id: '15', name: 'Mocha Frappe', price: 6.00, category: 'Frappe', icon: 'blender' },
    { id: '16', name: 'Caramel Frappe', price: 6.00, category: 'Frappe', icon: 'blender' },
    { id: '9', name: 'Croissant', price: 3.50, category: 'Pastries', icon: 'bakery_dining' },
    { id: '10', name: 'Blueberry Muffin', price: 3.00, category: 'Pastries', icon: 'bakery_dining' },
    { id: '11', name: 'Pumpkin Bread', price: 4.00, category: 'Seasonal', icon: 'eco' },
    { id: '12', name: 'Peppermint Mocha', price: 5.50, category: 'Seasonal', icon: 'eco' },
    { id: '13', name: 'House Blend (12oz)', price: 18.00, category: 'Coffee Beans', icon: 'shopping_bag' },
    { id: '14', name: 'Single Origin (12oz)', price: 24.00, category: 'Coffee Beans', icon: 'shopping_bag' },
];

const menuCategories = [
    { name: 'Hot Drinks', icon: 'local_cafe' },
    { name: 'Iced Drinks', icon: 'ac_unit' },
    { name: 'Frappe', icon: 'blender' },
    { name: 'Pastries', icon: 'bakery_dining' },
    { name: 'Seasonal', icon: 'eco' },
    { name: 'Coffee Beans', icon: 'shopping_bag' },
];

// Proxy: Polling Detection for Mock AI Environment
app.get('/api/detect', async (req, res) => {
    try {
        // Randomly pick an offline profile and assign it a fresh ID and faux AI connection state
        const randomCustomer = customerDatabase[Math.floor(Math.random() * customerDatabase.length)];
        const newCustomer = {
            ...randomCustomer,
            id: Math.random().toString(36).substr(2, 9),
            orderId: Math.floor(100 + Math.random() * 900).toString(),
            isRecommendationDown: Math.random() > 0.7
        };
        res.json({ customer: newCustomer });
    } catch (error) {
        res.status(500).json({ error: 'Failed to simulate detection' });
    }
});

// Proxy: Fetch Config
app.get('/api/config', async (req, res) => {
    try {
        res.json({
            SWEETNESS_LEVELS,
            MILK_TYPES,
            BEAN_TYPES,
            customerDatabase
        });
    } catch (error) {
        console.error('Error serving mock config:', error);
        res.status(500).json({ error: 'Failed to communicate with Edge' });
    }
});

// Proxy: Fetch Menu
app.get('/api/menu', async (req, res) => {
    try {
        // --- OFFLINE MODE (MOCK DATA) ---
        res.json({ menuItems, menuCategories });

        // --- ONLINE MODE (EDGE API) ---
        // Uncomment the lines below and comment out the mock data above to connect to Edge
        // const response = await fetch(`${EDGE_API_URL}/menu`);
        // const data = await response.json();
        // res.json(data);
    } catch (error) {
        console.error('Edge API offline / Error serving mock:', error);
        res.status(500).json({ error: 'Failed to communicate with Edge' });
    }
});

// Proxy: Fetch Popular Items (for Guest Recommendations)
app.get('/api/popular', async (req, res) => {
    try {
        // --- OFFLINE MODE (MOCK DATA) ---
        // In production, this would query the ML recommendation engine for trending items
        const popularItemIds = ['4', '8', '9', '7']; // Cortado, Iced Matcha, Croissant, Cold Brew
        const popularItems = popularItemIds
            .map(id => menuItems.find(item => item.id === id))
            .filter(Boolean);
        res.json({ popularItems });

        // --- ONLINE MODE (EDGE API) ---
        // const response = await fetch(`${EDGE_API_URL}/recommendations/popular`);
        // const data = await response.json();
        // res.json(data);
    } catch (error) {
        console.error('Error fetching popular items:', error);
        res.status(500).json({ error: 'Failed to fetch popular items' });
    }
});

// Proxy: Submit Order
app.post('/api/order', async (req, res) => {
    try {
        // --- OFFLINE MODE (MOCK DATA) ---
        console.log('[Offline] Received order payload:', JSON.stringify(req.body, null, 2));
        res.json({ success: true, message: 'Order received offline!', mockOrderRef: `ORD-${Date.now()}` });

        // --- ONLINE MODE (EDGE API) ---
        // Uncomment the lines below and comment out the mock data above to connect to Edge
        // const response = await fetch(`${EDGE_API_URL}/order`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(req.body)
        // });
        // const data = await response.json();
        // res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit order' });
    }
});

// Proxy: Human-in-the-Loop Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        // --- OFFLINE MODE (MOCK DATA) ---
        const { type, customerId, customerName, isGuest, orderId } = req.body;
        const labels: Record<string, string> = {
            true_positive: '✅ TRUE POSITIVE',
            true_negative: '✅ TRUE NEGATIVE',
            false_positive: '❌ FALSE POSITIVE',
            false_negative: '❌ FALSE NEGATIVE',
            ignored: '⏭️  IGNORED',
        };
        const label = labels[type] || `❓ UNKNOWN (${type})`;
        console.log(`[Feedback] ${label} | ${isGuest ? 'Guest' : customerName} (${customerId}) | ${orderId ? `Order: ${orderId}` : 'No order'}`);
        res.json({ success: true, message: 'Feedback received offline!' });

        // --- ONLINE MODE (EDGE API) ---
        // Uncomment the lines below and comment out the mock data above to connect to Edge
        // const response = await fetch(`${EDGE_API_URL}/feedback`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(req.body)
        // });
        // const data = await response.json();
        // res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send telemetry' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CogniBrew CORS Proxy running on http://localhost:${PORT}`);
});