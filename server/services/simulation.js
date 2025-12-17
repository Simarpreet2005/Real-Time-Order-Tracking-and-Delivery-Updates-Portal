// Simple linear interpolation service for demo
const activeSimulations = new Map();

const startSimulation = (io, trackingId, initialLocation, destination) => {
    if (activeSimulations.has(trackingId)) {
        return; // Already running
    }

    console.log(`Starting simulation for ${trackingId}`);

    // Default Delhi coordinates if missing
    let currentLat = initialLocation?.lat || 28.6139;
    let currentLng = initialLocation?.lng || 77.2090;

    const targetLat = destination?.lat || 28.6250;
    const targetLng = destination?.lng || 77.2250;

    const steps = 100; // number of steps to destination
    const duration = 60000; // 60 seconds total trip for demo
    const intervalTime = duration / steps;

    const latStep = (targetLat - currentLat) / steps;
    const lngStep = (targetLng - currentLng) / steps;

    let stepCount = 0;

    const intervalId = setInterval(() => {
        stepCount++;
        currentLat += latStep;
        currentLng += lngStep;

        const updateData = {
            trackingId,
            currentLocation: {
                lat: currentLat,
                lng: currentLng
            },
            status: stepCount > steps * 0.8 ? 'Arriving' : 'Out for Delivery'
        };

        // Emit to room
        io.to(trackingId).emit('orderUpdated', updateData);

        if (stepCount >= steps) {
            clearInterval(intervalId);
            activeSimulations.delete(trackingId);
            io.to(trackingId).emit('orderUpdated', { ...updateData, status: 'Delivered' });
        }
    }, intervalTime);

    activeSimulations.set(trackingId, intervalId);
};

module.exports = { startSimulation };
