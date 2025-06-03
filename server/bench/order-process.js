import { check, sleep } from 'k6';
import http from 'k6/http';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = 'http://localhost:3000';
const ORDER_ENDPOINT = '/api/v1/orders';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjBmZDI0NC00N2M4LTRkMDItYTY3NC04YWIwZmNjNmFkNDkiLCJjdXN0b21lcklkIjoiNTZlN2VlM2QtZjlkMC00NjU2LWFlMjgtYTgyYzQ1YTgzZDdiIiwiaWF0IjoxNzQ4ODY1OTg2LCJleHAiOjE3NDg5MDkxODZ9.2lVrlDVXw66_18pDtavPY23gibzIMGZBQHroQJEdTxk';

export const options = {
  stages: [
    { duration: '2m', target: 50 }, 
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  noConnectionReuse: false,
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const idempotencyKey = uuidv4();

  const requestBody = {
    selectedProducts: [
      {
        productId: '9be551a8-d94f-4b53-ba03-210da5ba8164',
        quantity: 25,
      },
      {
        productId: '0c33ed4a-88e5-44dd-86fc-0e9c12b5f704',
        quantity: 15,
      },
      {
        productId: '8cbb0ecf-6727-4b31-b39b-20c9f93be464',
        quantity: 20,
      },
    ],
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
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response body contains order ID': (r) =>
      r.json() && r.json().uuid !== undefined,
  });

  sleep(1);
}
