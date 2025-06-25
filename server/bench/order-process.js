import { check, sleep } from 'k6';
import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = 'http://localhost:3000';
const ORDER_ENDPOINT = '/api/v1/orders';

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    { headers: { 'content-type': 'application/json' } },
  );
  const token = loginRes.json().accessToken;

  const productsResponse = http.get(
    `${BASE_URL}/api/v1/products?page=1&limit=30`,
  );
  const products = productsResponse.json().data;

  return { token, products };
}

const getRandomProducts = (products) => {
  const min = 1;
  const max = 5;

  const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomProducts = [];
  const productIds = products.map((product) => product.id);
  for (let i = 0; i < randomCount; i++) {
    const randomIndex = Math.floor(Math.random() * productIds.length);
    const productId = productIds[randomIndex];
    const quantity = Math.floor(Math.random() * 10) + 1; // Random quantity between 1 and 10
    randomProducts.push({ productId, quantity });
  }

  return randomProducts;
};

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 VUs in 30 seconds
    { duration: '4m', target: 50 }, // Stay at 50 VUs for 4 minutes
    { duration: '30s', target: 0 }, // Ramp down to 0 VUs in 30 seconds
  ],
  noConnectionReuse: false,
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function (data) {
  const idempotencyKey = uuidv4();
  const { token, products } = data;

  const requestBody = {
    selectedProducts: getRandomProducts(products),
  };

  const headers = {
    'content-type': 'application/json',
    'idempotency-key': idempotencyKey,
    authorization: `Bearer ${token}`,
  };

  const res = http.post(
    `${BASE_URL}${ORDER_ENDPOINT}`,
    JSON.stringify(requestBody),
    {
      headers: headers,
    },
  );

  check(res, {
    'status is 202': (r) => r.status === 202,
    'response body contains order ID': (r) =>
      r.json() && r.json().uuid !== undefined,
  });

  sleep(1);
}
