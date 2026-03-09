import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 users simulating hospitals discovering blood banks
        { duration: '1m', target: 50 },  // Maintain 50 users
        { duration: '30s', target: 100 }, // Ramp up to 100 users
        { duration: '1m', target: 100 }, // Maintain 100 users for a minute
        { duration: '30s', target: 0 },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should complete in under 500ms
        http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function loadTest() {
    // Simulate hospital discovering blood banks via the discovery API
    // Using randomized latitude/longitude somewhat close to Kathmandu or general center
    const lat = 27.7172 + (Math.random() - 0.5) * 0.1;
    const lng = 85.3240 + (Math.random() - 0.5) * 0.1;
    const radiusKm = 50;

    // We are hitting an endpoint that requires authentication in production.
    // We can instead hit the Health Check for load testing the basics or 
    // provide a valid JWT via __ENV.JWT_TOKEN to test the real endpoints.

    const headers = {
        'Content-Type': 'application/json',
    };

    if (__ENV.JWT_TOKEN) {
        headers['Authorization'] = `Bearer ${__ENV.JWT_TOKEN}`;
    }

    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
        'health check status is 200': (r) => r.status === 200,
        'health check claims operational': (r) => r.json().status === 'operational',
    });

    // If token is provided, test discovery API
    if (__ENV.JWT_TOKEN) {
        const discoverRes = http.get(
            `${BASE_URL}/api/blood-banks/discover?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
            { headers }
        );
        check(discoverRes, {
            'discover status is 200': (r) => r.status === 200,
        });
    }

    sleep(1);
}
