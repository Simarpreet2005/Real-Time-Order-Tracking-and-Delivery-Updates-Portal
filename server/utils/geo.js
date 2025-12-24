const OpenLocationCode = require('open-location-code').OpenLocationCode;
const axios = require('axios');

const olc = new OpenLocationCode();

// Warehouse Coordinates (Jalandhar, Punjab)
// User provided: 31.28650278795713, 75.64906612235929
const WAREHOUSE_COORDS = {
    lat: 31.28650278795713,
    lng: 75.64906612235929,
    address: 'Warehouse (Jalandhar)',
    plusCode: '7JPX+JJ8' // Kept for reference
};

// Use Warehouse as the reference point for short codes
const REF_LAT = WAREHOUSE_COORDS.lat;
const REF_LNG = WAREHOUSE_COORDS.lng;

const decodePlusCode = (code) => {
    try {
        let fullCode = code;

        if (!olc.isValid(code)) {
            throw new Error(`Invalid code format: ${code}`);
        }

        if (olc.isShort(code)) {
            // Recover nearest to Jalandhar Warehouse
            fullCode = olc.recoverNearest(code, REF_LAT, REF_LNG);
            console.log(`[DEBUG] Recovered short code '${code}' to full code '${fullCode}'`);
        }

        // Decode the full code
        const codeObj = olc.decode(fullCode);

        return {
            lat: codeObj.latitudeCenter,
            lng: codeObj.longitudeCenter,
            address: `Plus Code: ${code}`
        };
    } catch (error) {
        console.error('OLC Decode Error:', error.message);
        throw new Error('Invalid Plus Code');
    }
};

const getOSRMRoute = async (origin, destination) => {
    try {
        // OSRM expects: {lon},{lat}
        const originStr = `${origin.lng},${origin.lat}`;
        const destStr = `${destination.lng},${destination.lat}`;

        const url = `http://router.project-osrm.org/route/v1/driving/${originStr};${destStr}?overview=full&geometries=geojson`;

        const response = await axios.get(url);

        if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
            throw new Error('No route found');
        }

        const route = response.data.routes[0];

        return {
            distance: route.distance, // in meters
            duration: route.duration, // in seconds
            // Convert [lng, lat] to {lat, lng} for the app
            geometry: route.geometry.coordinates.map(p => ({ lat: p[1], lng: p[0] })),
            distanceText: `${(route.distance / 1000).toFixed(2)} km`
        };

    } catch (error) {
        console.error('OSRM API Error:', error.message);
        throw new Error('Failed to find route');
    }
};

const checkDeliveryRange = (distanceInMeters) => {
    // Limit is 3km = 3000 meters
    if (distanceInMeters <= 3000) {
        return { allowed: true };
    }
    return { allowed: false, distance: distanceInMeters };
};

module.exports = {
    decodePlusCode,
    getOSRMRoute,
    checkDeliveryRange,
    WAREHOUSE_COORDS
};
