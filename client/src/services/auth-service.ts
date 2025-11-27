import { config } from "@/config";

export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    defaultDietaryRestrictions: string[];
    favoriteCuisines: string[];
  };
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = "mealmind_token";

  /**
   * Store token in localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove token from localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Get authorization header
   */
  static getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${config.api.url}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to register");
    }

    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${config.api.url}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to login");
    }

    const result = await response.json();
    if (result.success && result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  /**
   * Logout user
   */
  static logout(): void {
    this.removeToken();
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${config.api.url}/api/auth/me`, {
        headers: {
          ...this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        // Token might be invalid, remove it
        this.removeToken();
        return null;
      }

      const result = await response.json();
      return result.success ? result.user : null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: {
    defaultDietaryRestrictions?: string[];
    favoriteCuisines?: string[];
  }): Promise<{ success: boolean; preferences: any }> {
    const response = await fetch(`${config.api.url}/api/auth/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update preferences");
    }

    return await response.json();
  }
}

