```markdown
# 🚀 pure-http-client-lib

A blazing-fast ⚡, fully typed 🧠, zero-dependency 🛡️ Node.js HTTP/HTTPS client library built with TypeScript!

---

## ✨ Features

- 🔥 Supports all HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- 🛡️ Zero external dependencies (pure `http`/`https`)
- 🔐 Authentication: Bearer Token, Basic Auth, API Key, HMAC
- 🔁 Retry on failure with exponential backoff
- ⏳ Timeout handling
- 📈 Upload/Download progress events
- 🚦 Loader start/stop events for multiple requests
- 🔄 Interceptors for request/response modification
- 🚨 Exception handling (`HttpError`)
- 🛠️ TDD-ready (full unit tests)

---

## 📦 Installation

```bash
npm install pure-http-client-lib
```

---

## ⚙️ Default Optional Configurations

| Option         | Type        | Default             | Description                        |
|:---------------|:------------|:--------------------|:-----------------------------------|
| `baseUrl`      | `string`    | (Required)           | Base URL for all requests          |
| `timeout`      | `number`    | `10000` ms           | Request timeout (in milliseconds)  |
| `retries`      | `number`    | `3`                  | Retry attempts on error            |
| `retryDelay`   | `number`    | `1000` ms            | Initial retry delay (doubles each retry) |

---

## 🛠️ Initialize Client

```ts
import { PureHttpClient } from 'pure-http-client-lib';

const client = new PureHttpClient({
  baseUrl: 'https://jsonplaceholder.typicode.com'
});
```

---

## 🌐 HTTP Request Examples

### 📥 GET

```ts
const response = await client.send<{ id: number }[]>({
  method: 'GET',
  path: '/users'
});
```

### 📤 POST

```ts
await client.send({
  method: 'POST',
  path: '/users',
  data: { name: 'John Doe' }
});
```

### ✍️ PUT

```ts
await client.send({
  method: 'PUT',
  path: '/users/1',
  data: { name: 'Updated Name' }
});
```

### ✍️ PATCH

```ts
await client.send({
  method: 'PATCH',
  path: '/users/1',
  data: { active: true }
});
```

### ❌ DELETE

```ts
await client.send({
  method: 'DELETE',
  path: '/users/1'
});
```

---

## 🔐 Authentication

### 🔑 Bearer Token

```ts
client.addAuth({
  type: 'bearer',
  credentials: { token: 'your-access-token' }
});
```

### 👥 Basic Auth

```ts
client.addAuth({
  type: 'basic',
  credentials: {
    username: 'admin',
    password: '1234'
  }
});
```

### 🔐 API Key in Header

```ts
client.addAuth({
  type: 'api_key_header',
  credentials: {
    apiKey: 'your-api-key',
    headerName: 'X-API-KEY'
  }
});
```

---

## 🧩 Interceptors (Request / Response)

You can intercept and modify requests/responses globally.

### 🔁 Request Interceptor

```ts
client.addRequestInterceptor((req) => {
  console.log(`[${req.method}] ${req.path}`);
  req.headers = {
    ...req.headers,
    'X-Custom-Header': 'value'
  };
  return req;
});
```

### 🔁 Response Interceptor

```ts
client.addResponseInterceptor((res) => {
  console.log(`Response status: ${res.status}`);
  return res;
});
```

✅ Useful for:
- Logging
- Injecting headers
- Response shaping
- Testing

---

## 🔁 Retry + Timeout

```ts
await client.send({
  method: 'GET',
  path: '/unstable-endpoint',
  retries: 3,
  timeout: 5000
});
```

---

## ⏳ AbortController Support

```ts
const controller = new AbortController();

setTimeout(() => controller.abort(), 3000); // cancel after 3s

await client.send(
  { method: 'GET', path: '/long-task' },
  controller.signal
);
```

---

## 📈 Track Progress (Upload/Download)

```ts
client.on('progress:update', (event) => {
  console.log(`${event.type} progress: ${event.percent}%`);
});
```

---

## 🚦 Loader Start/Stop Events

Track global request activity:

```ts
client.on('loader:start', () => {
  console.log('🟡 Loader ON');
});

client.on('loader:stop', () => {
  console.log('🟢 Loader OFF');
});

// Trigger multiple requests
Promise.all([
  client.send({ method: 'GET', path: '/posts/1' }),
  client.send({ method: 'GET', path: '/posts/2' }),
  client.send({ method: 'GET', path: '/posts/3' })
]);
```

✅ `loader:start` fires once  
✅ `loader:stop` fires after all complete

---

## 🚨 Exception Handling

```ts
import { HttpError } from 'pure-http-client-lib';

try {
  await client.send({ method: 'GET', path: '/fail' });
} catch (err) {
  if (err instanceof HttpError) {
    console.error('HttpError:', err.message, err.status);
  } else {
    console.error('Unknown Error:', err);
  }
}
```
