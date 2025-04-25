// src/core/PureHttpClient.ts
import * as http from "http";
import * as https from "https";
import { URL } from "url";
import { EventEmitter } from "events";

// src/errors/HttpError.ts
var HttpError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
};

// src/core/ExceptionManager.ts
var ExceptionManager = class {
  static handle(error) {
    if (error instanceof Error) {
      return new HttpError(error.message);
    }
    return new HttpError("Unknown error occurred");
  }
};

// src/config/constants.ts
var DEFAULT_TIMEOUT = 1e4;
var DEFAULT_RETRY_COUNT = 3;
var DEFAULT_RETRY_DELAY = 1e3;

// src/core/PureHttpClient.ts
var PureHttpClient = class extends EventEmitter {
  constructor(config) {
    super();
    this.baseUrl = config.baseUrl;
  }
  async send(request, signal) {
    const url = new URL(request.path ?? "", this.baseUrl);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: url.pathname + url.search,
      method: request.method,
      headers: request.headers,
      timeout: request.timeout ?? DEFAULT_TIMEOUT
    };
    const retries = request.retries ?? DEFAULT_RETRY_COUNT;
    return this.tryRequest(client, options, request.data, retries, signal);
  }
  tryRequest(client, options, data, retries, signal) {
    return new Promise((resolve, reject) => {
      const req = client.request(options, (res) => {
        let body = "";
        const total = Number(res.headers["content-length"]) || 0;
        let loaded = 0;
        res.on("data", (chunk) => {
          loaded += chunk.length;
          this.emit("progress:update", {
            type: "download",
            percent: Math.round(loaded * 100 / total)
          });
          body += chunk.toString();
        });
        res.on("end", () => {
          const safeHeaders = {};
          for (const key in res.headers) {
            const value = res.headers[key];
            if (value !== void 0) {
              safeHeaders[key] = value;
            }
          }
          resolve({
            status: res.statusCode ?? 0,
            headers: safeHeaders,
            data: JSON.parse(body)
          });
        });
      });
      if (signal) {
        signal.addEventListener("abort", () => {
          req.destroy();
          reject(new Error("Request Aborted"));
        });
      }
      req.on("timeout", () => {
        req.destroy();
        if (retries > 0) {
          setTimeout(() => {
            this.tryRequest(client, options, data, retries - 1, signal).then((resp) => resolve(resp)).catch(reject);
          }, DEFAULT_RETRY_DELAY);
        } else {
          reject(new Error("Request Timeout"));
        }
      });
      req.on("error", (err) => {
        if (retries > 0) {
          setTimeout(() => {
            this.tryRequest(client, options, data, retries - 1, signal).then((resp) => resolve(resp)).catch(reject);
          }, DEFAULT_RETRY_DELAY);
        } else {
          reject(ExceptionManager.handle(err));
        }
      });
      if (data) {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        req.write(payload);
      }
      req.end();
    });
  }
};

// src/core/AuthManager.ts
var AuthType = /* @__PURE__ */ ((AuthType2) => {
  AuthType2["NONE"] = "none";
  AuthType2["BEARER"] = "bearer";
  AuthType2["BASIC"] = "basic";
  AuthType2["API_KEY_HEADER"] = "api_key_header";
  AuthType2["API_KEY_QUERY"] = "api_key_query";
  return AuthType2;
})(AuthType || {});
var AuthManager = class {
  constructor(authConfig) {
    this.authConfig = authConfig;
  }
  applyAuth(options) {
    const updated = { ...options };
    if (!updated.headers) updated.headers = {};
    switch (this.authConfig.type) {
      case "none" /* NONE */:
        break;
      case "bearer" /* BEARER */:
        updated.headers["Authorization"] = `Bearer ${this.authConfig.credentials?.token}`;
        break;
      case "basic" /* BASIC */:
        const username = this.authConfig.credentials?.username ?? "";
        const password = this.authConfig.credentials?.password ?? "";
        const encoded = Buffer.from(`${username}:${password}`).toString("base64");
        updated.headers["Authorization"] = `Basic ${encoded}`;
        break;
      case "api_key_header" /* API_KEY_HEADER */:
        updated.headers[this.authConfig.credentials?.headerName ?? "X-API-KEY"] = this.authConfig.credentials?.apiKey ?? "";
        break;
      case "api_key_query" /* API_KEY_QUERY */:
        break;
    }
    return updated;
  }
};
export {
  AuthManager,
  AuthType,
  ExceptionManager,
  HttpError,
  PureHttpClient
};
