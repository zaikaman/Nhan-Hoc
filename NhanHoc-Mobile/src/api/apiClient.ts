/**
 * API Client
 * Base client để xử lý tất cả các HTTP requests
 */

import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { ApiException, RequestConfig } from '../types/api';

// Enable detailed logging only in development
const __DEV__ = process.env.NODE_ENV === 'development';
const ENABLE_API_LOGS = true; // Set to true to see detailed API logs

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Log helper - only logs if enabled
   */
  private log(message: string, data?: any) {
    if (ENABLE_API_LOGS && __DEV__) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Error log helper - only logs in development
   */
  private logError(message: string, error?: any) {
    if (__DEV__ && ENABLE_API_LOGS) {
      // console.error(message, error);
      console.log(message, error); // Use console.log instead to avoid red errors in UI
    }
  }

  /**
   * Tạo AbortController với timeout
   */
  private createAbortController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * Xử lý response từ API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Nếu response không ok, throw error
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        errorData = await response.json();
      } catch (e) {
        // Nếu không parse được JSON, dùng statusText
        errorData = { error: response.statusText };
      }

      throw new ApiException(
        errorData.error || errorData.message || 'API request failed',
        response.status,
        errorData
      );
    }

    // Parse JSON response
    try {
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw new ApiException('Failed to parse response', 500);
    }
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = config.timeout || this.defaultTimeout;
    const controller = this.createAbortController(timeout);

    const requestConfig: RequestInit = {
      ...config,
      signal: controller.signal,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    };

    try {
      this.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);
      if (config.body) {
        this.log('📦 Request Body:', config.body);
      }
      
      const response = await fetch(url, requestConfig);
      
      this.log(`📡 Response Status: ${response.status} ${response.statusText}`);
      
      const data = await this.handleResponse<T>(response);
      
      this.log(`✅ API Response: ${config.method || 'GET'} ${url}`, data);
      
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        // Chỉ log vào console.log (không dùng console.error để tránh hiển thị error màu đỏ)
        this.log(`⚠️ API Error: ${error.message}`, {
          statusCode: error.statusCode,
          url,
          method: config.method,
        });
        throw error;
      }

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        this.log('⏱️ Request timeout');
        throw new ApiException('Request timeout', 408);
      }

      // Handle network errors
      this.log('🔌 Network error:', error);
      throw new ApiException('Network error', 0);
    }
  }

  /**
   * GET request
   */
  public async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Set authorization token
   */
  public setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  public clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Update base URL
   */
  public setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default apiClient;
