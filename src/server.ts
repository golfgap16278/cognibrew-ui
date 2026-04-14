// server.ts
import express from 'express';
import cors from 'cors';

const PORT = 3002;
// The local network IP of your Edge Machine
const EDGE_API_URL = process.env.EDGE_API_URL || 'http://localhost:8001/api/v1';

const app = express();

// Enable CORS for your React UI
app.use(cors());
app.use(express.json());

// Mock Data for offline testing
const SWEETNESS_LEVELS = ["0%", "25%", "50%", "100%"];
// const MILK_TYPES = ["Whole Milk", "Oat Milk", "Almond Milk", "Soy Milk"];
// const BEAN_TYPES = ["House Blend", "Single Origin", "Decaf"];

// const menuCategories = [
//     { name: 'Hot Drinks', icon: 'local_cafe' },
//     { name: 'Iced Drinks', icon: 'ac_unit' },
//     { name: 'Frappe', icon: 'blender' },
//     { name: 'Pastries', icon: 'bakery_dining' },
//     { name: 'Seasonal', icon: 'eco' },
//     { name: 'Coffee Beans', icon: 'shopping_bag' },
// ];

// const menuItems = [
//     { id: '1', name: 'Latte', price: 4.50, category: 'Hot Drinks' },
//     { id: '2', name: 'Cappuccino', price: 4.50, category: 'Hot Drinks' },
//     { id: '3', name: 'Flat White', price: 4.25, category: 'Hot Drinks' },
//     { id: '4', name: 'Cortado', price: 4.00, category: 'Hot Drinks' },
//     { id: '5', name: 'Americano', price: 3.50, category: 'Hot Drinks' },
//     { id: '6', name: 'Iced Latte', price: 5.00, category: 'Iced Drinks' },
//     { id: '7', name: 'Cold Brew', price: 4.50, category: 'Iced Drinks' },
//     { id: '8', name: 'Iced Matcha', price: 5.50, category: 'Iced Drinks' },
//     { id: '15', name: 'Mocha Frappe', price: 6.00, category: 'Frappe' },
//     { id: '16', name: 'Caramel Frappe', price: 6.00, category: 'Frappe' },
//     { id: '9', name: 'Croissant', price: 3.50, category: 'Pastries' },
//     { id: '10', name: 'Blueberry Muffin', price: 3.00, category: 'Pastries' },
//     { id: '11', name: 'Pumpkin Bread', price: 4.00, category: 'Seasonal' },
//     { id: '12', name: 'Peppermint Mocha', price: 5.50, category: 'Seasonal' },
//     { id: '13', name: 'House Blend (12oz)', price: 18.00, category: 'Coffee Beans' },
//     { id: '14', name: 'Single Origin (12oz)', price: 24.00, category: 'Coffee Beans' },
// ].map(item => ({
//     ...item,
//     icon: menuCategories.find(c => c.name === item.category)?.icon || 'star'
// }));

const customerDatabase = [
    {
        face_id: 'vec_a7b3c9d2e1',
        name: 'Sarah Johnson',
        status: 'Gold Member',
        points: 4200,
        rank: 'Gold',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        usualOrderId: 'americano-hot',
        usualSweetness: '0%',
        upsellId: 'croissant',
        greeting: '"Hey Sarah! Welcome back. Shall we get your usual Americano started, and maybe pair it with a fresh Croissant today?"',
        phone: '0101',
        isRecommendationAvailable: true
    },
    {
        face_id: 'vec_f4e8d1a6b2',
        name: 'Guest Customer',
        status: 'Unregistered Profile',
        points: 0,
        rank: 'Guest',
        image: '',
        greeting: '',
        isGuest: true,
        isRecommendationAvailable: true
    },
    {
        face_id: 'vec_c2d9e5f3a8',
        name: 'David Chen',
        status: 'Silver Member',
        points: 1500,
        rank: 'Silver',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        usualOrderId: 'latte-hot',
        usualSweetness: '50%',
        upsellId: 'banana-bread',
        greeting: '"Hi David! The usual Latte today?"',
        phone: '0102',
        isRecommendationAvailable: true
    },
    {
        face_id: 'vec_b8a1d7c4e9',
        name: 'Guest Customer',
        status: 'Unregistered Profile',
        points: 0,
        rank: 'Guest',
        image: '',
        greeting: '',
        isGuest: true,
        isRecommendationAvailable: false
    },
    {
        face_id: 'vec_e6f2b5a9d3',
        name: 'Emma Wilson',
        status: 'New Customer',
        points: 200,
        rank: 'New',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
        usualOrderId: 'frappuccino-caramel',
        usualSweetness: '100%',
        upsellId: 'banana-bread',
        greeting: '"Welcome back Emma! Would you like to try our Banana Bread with your Frappuccino?"',
        phone: '0103',
        isRecommendationAvailable: true
    },
    {
        face_id: 'vec_d3c7a2e8f1',
        name: 'Michael Chang',
        status: 'Regular',
        points: 800,
        rank: 'Regular',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        usualOrderId: 'americano-cold',
        usualSweetness: '25%',
        upsellId: 'cheesecake',
        greeting: '"Morning Michael! Iced Americano to start the day?"',
        phone: '0104',
        isRecommendationAvailable: false
    }
].map(c => {
    // Hardcoded display values for mock data (in production, these come from the recommendation service)
    const usualOrderNames: Record<string, { name: string; icon: string }> = {
        'americano-hot': { name: 'Hot Americano', icon: 'local_cafe' },
        'latte-hot': { name: 'Hot Caffe Latte', icon: 'local_cafe' },
        'frappuccino-caramel': { name: 'Caramel Frappuccino', icon: 'blender' },
        'americano-cold': { name: 'Iced Americano', icon: 'ac_unit' },
    };
    const upsellNames: Record<string, string> = {
        'croissant': 'Butter Croissant',
        'banana-bread': 'Banana Bread',
        'cheesecake': 'New York Cheesecake',
    };

    const usualItem = c.usualOrderId ? usualOrderNames[c.usualOrderId] : null;

    return {
        ...c,
        usualOrder: usualItem?.name || '',
        usualOrderIcon: usualItem?.icon || '',
        upsell: c.upsellId ? (upsellNames[c.upsellId] || '') : '',
    };
});

let cachedMenuItems: any[] = [];

// Proxy: Fetch Config
app.get('/api/config', async (req, res) => {
    try {
        res.json({
            SWEETNESS_LEVELS,
            customerDatabase
        });
    } catch (error) {
        console.error('Error serving mock config:', error);
        res.status(500).json({ error: 'Failed to communicate with Edge' });
    }
});

// Proxy: Fetch Menu
const categoryIcons: Record<string, string> = {
    'Hot': 'local_cafe',
    'Cold': 'ac_unit',
    'Blended': 'blender',
    'Food': 'bakery_dining',
};

const categoryMapping: Record<string, string> = {
    'Hot': 'Hot Drinks',
    'Cold': 'Iced Drinks',
    'Blended': 'Frappe',
    'Food': 'Desserts',
};

app.get('/api/menu', async (req, res) => {
    try {

        // --- ONLINE MODE (EDGE API) ---
        const response = await fetch(`${EDGE_API_URL}/catalog/menu`);
        const data = await response.json();

        // Replace item_id with item.name before mapping backend items
        // if (!data.items) {
        //    throw new Error(data.detail || 'Menu items not found from Edge API');
        // }

        // data.items.forEach((item: any) => {
        //     item.item_id = item.name;
        // });

        // Map backend items → frontend MenuItem schema
        const mappedMenuItems = data.items.map((item: any) => {

            const name_old = item.name;
            let itemName = item.name;
            const isHot = itemName.endsWith(' (Hot)') || item.category === 'Hot';
            const isCold = itemName.endsWith(' (Cold)') || item.category === 'Cold';

            itemName = itemName.replace(' (Hot)', '').replace(' (Cold)', '');

            if (isHot && !itemName.startsWith('Hot ')) itemName = `Hot ${itemName}`;
            if (isCold && !itemName.startsWith('Iced ')) itemName = `Iced ${itemName}`;

            return {
                id: item.item_id,
                name: itemName,
                name_old: name_old,
                price: item.price,
                category: categoryMapping[item.category] || item.category,
                icon: categoryIcons[item.category] || 'star',
            };
        });

        // Extract unique categories → frontend Category schema
        const mappedMenuCategories = [...new Set(data.items.map((item: any) => item.category))]
            .map((category: any) => ({
                name: categoryMapping[category] || category,
                icon: categoryIcons[category] || 'star',
            }));

        // Cache for /api/popular
        cachedMenuItems = mappedMenuItems;

        res.json({ menuItems: mappedMenuItems, menuCategories: mappedMenuCategories });
    } catch (error) {
        console.error('Edge API offline / Error serving mock:', error);
        res.status(500).json({ error: 'Failed to communicate with Edge' });
    }
});

// Proxy: Fetch Popular Items (for Guest Recommendations)
app.get('/api/popular', async (req, res) => {
    try {

        // Grab 4 items from the cached menu deterministically
        const deterministicIndices = [2, 7, 11, 15];
        const popularItems = deterministicIndices
            .map(index => cachedMenuItems[index])
            .filter(Boolean); // Filter out undefined if the menu is smaller than the indices

        res.json({ popularItems });

    } catch (error) {
        console.error('Error fetching popular items:', error);
        res.status(500).json({ error: 'Failed to fetch popular items' });
    }
});

// Proxy: Submit Order
app.post('/api/order', async (req, res) => {
    try {

        const { face_id, items } = req.body;
        const firstItemId = (items && items.length > 0) ? items[0].menuItemId : "";

        const payload = {
            username: face_id || "guest",
            item_id: firstItemId,
            device_id: "unknown"
        };

        console.log('[Edge API] Sending Order Payload:', JSON.stringify(payload, null, 2));

        // Forward Authorization header from the UI request to the gateway
        const authHeader = req.headers['authorization'];
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader as string;

        const response = await fetch(`${EDGE_API_URL}/order`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.status(response.status).json(data);

    } catch (error) {
        console.error('Error submitting order to Edge:', error);
        res.status(500).json({ error: 'Failed to submit order' });
    }
});

// Proxy: Log Connection Status from SignalR
app.post('/api/log-status', async (req, res) => {
    try {
        const { status, details } = req.body;
        console.log(`[SignalR Status] ${status}`, details ? details : '');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log status' });
    }
});

// Proxy: Log Payload from SignalR
app.post('/api/log-payload', async (req, res) => {
    try {
        console.log('[SignalR] Received Notify payload:', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to log payload' });
    }
});

// Proxy: Human-in-the-Loop Feedback
app.post('/api/feedback', async (req, res) => {
    try {

        //console.log('[Edge API] Sending payload:', JSON.stringify(req.body, null, 2));

        const { face_id, type, customerName, isGuest, orderId, timestamp } = req.body;

        const payload = {
            feedback: type || "",
        };

        console.log('[Edge API] Sending Feedback Payload:', JSON.stringify(payload, null, 2));

        // Forward Authorization header from the UI request to the gateway
        const authHeader = req.headers['authorization'];
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader as string;

        const response = await fetch(`${EDGE_API_URL}/feedback/${face_id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        res.status(response.status).json(data);


    } catch (error) {
        console.error('Error submitting feedback to Edge:', error);
        res.status(500).json({ error: 'Failed to send telemetry' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CogniBrew CORS Proxy running on http://localhost:${PORT}`);
});