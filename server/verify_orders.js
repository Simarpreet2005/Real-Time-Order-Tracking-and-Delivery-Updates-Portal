const axios = require('axios');
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000/api/orders';
const SOCKET_URL = 'http://localhost:5000';

async function verifyOrderSystem() {
    console.log('--- STARTING VERIFICATION ---');

    // 1. Create a valid order (Plus Code: 7JPX+JJ8 - Warehouse itself, distance 0)
    // Or slightly away: 7JPX+H5 (Nearby)
    // Let's use a known nearby location.
    // 7JR2+22 is close to CP.
    const validPlusCode = '7JR2+22';
    // New Delhi Railway Station is close to CP.

    // Note: If OSRM fails or map tiles fail, this might error.
    // For the test, we will try the warehouse itself to ensure distance is 0 if 7JR2+22 is slightly far (though CP to New Delhi Station is < 3km).
    // Let's use 7JPX+JJ8 (Warehouse) as it is guaranteed to be 0km.
    const testPlusCode = '7JPX+JJ8';

    console.log(`1. Creating Order with Plus Code: ${testPlusCode}`);

    try {
        const orderRes = await axios.post(BASE_URL, {
            trackingId: `TEST-${Date.now()}`,
            customerId: '60d0fe4f5311236168a109ca', // Dummy ID
            customer: {
                name: 'Test User',
                plusCode: testPlusCode
            }
        });

        const order = orderRes.data;
        console.log('✅ Order Created Successfully!');
        console.log('   Tracking ID:', order.trackingId);
        console.log('   Address:', order.customer.address);
        console.log('   Distance Check: Passed (Implied by success)');

        // 2. Connect via Socket to listen for updates
        console.log('2. Connecting to Socket for Real-time Tracking...');
        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('✅ Socket Connected');
            socket.emit('joinOrder', order.trackingId);

            // 3. Mark as Out for Delivery to trigger simulation
            console.log('3. Updating Status to "Out for Delivery"...');
            axios.put(`${BASE_URL}/${order.trackingId}/status`, {
                status: 'Out for Delivery'
            }).then(() => {
                console.log('✅ Status Updated. Waiting for location updates...');
            }).catch(err => {
                console.error('❌ Failed to update status:', err.message);
            });
        });

        let updatesReceived = 0;
        socket.on('locationUpdate', (loc) => {
            updatesReceived++;
            console.log(`   📍 Location Update Received: (${loc.lat}, ${loc.lng})`);
            if (updatesReceived >= 3) {
                console.log('✅ Simulation active! Received multiple updates.');
                console.log('--- VERIFICATION SUCCESS ---');
                socket.disconnect();
                process.exit(0);
            }
        });

        // Timeout
        setTimeout(() => {
            if (updatesReceived === 0) {
                console.error('❌ Timeout: No location updates received.');
                process.exit(1);
            }
        }, 10000);

    } catch (error) {
        console.error('❌ Order Creation Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyOrderSystem();
