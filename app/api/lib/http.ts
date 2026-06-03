interface RequestConfig extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number>;
  timeout?: number;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, opts?: { headers?: Record<string, string> }) {
    this.baseUrl = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...opts?.headers,
    };
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      method = "GET",
      params,
      body,
      headers,
      timeout = 30000,
      ...rest
    } = config;

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value.toString()),
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        ...rest,
        method,
        headers: { ...this.defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const responseText = await response.text();
      const data = isJson && responseText.trim()
        ? JSON.parse(responseText) as Record<string, any>
        : null;

      if (!response.ok) {
        throw new Error(data?.message || `HTTP Error: ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  get<T>(
    url: string,
    params?: RequestConfig["params"],
    config?: RequestConfig,
  ) {
    return this.request<T>(url, { ...config, method: "GET", params });
  }

  post<T>(url: string, body?: any, config?: RequestConfig) {
    return this.request<T>(url, { ...config, method: "POST", body });
  }
}
