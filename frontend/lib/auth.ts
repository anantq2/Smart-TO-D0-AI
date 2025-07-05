// Define User
export interface User {
  id: number | string;
  email: string;
  created_at?: string;
}

export class AuthService {
  private static authListeners: ((user: User | null) => void)[] = [];

  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),  // ✅ Correct for SimpleJWT

      });

      if (!response.ok) {
        const errorData = await response.json();
        return { user: null, error: errorData.detail || "Login failed" };
      }

      const data = await response.json();
      const { access, refresh } = data;

      // Save tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Decode token to extract user info (or hit backend if needed)
      const decoded = AuthService.parseJwt(access);
      const user: User = {
        id: decoded?.user_id || "unknown",
        email: email,
        created_at: new Date().toISOString(),
      };

      this.notifyAuthListeners(user);
      return { user, error: null };
    } catch (err: any) {
      return { user: null, error: "Server error: " + err.message };
    }
  }

  static async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const response = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { user: null, error: data.error || "Registration failed" };
    }

    // ✅ User created successfully
    return {
      user: {
        id: data.id || 1,  // backend agar id bhejta ho to use karo
        email,
        created_at: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: "Server error: " + err.message };
  }
}


  static async signOut(): Promise<void> {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.notifyAuthListeners(null);
  }

  static getCurrentUser(): User | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const decoded = AuthService.parseJwt(token);
    if (!decoded) return null;

    return {
      id: decoded.user_id || "unknown",
      email: decoded.email || "unknown",
      created_at: new Date(decoded?.iat * 1000).toISOString(),
    };
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authListeners.push(callback);
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  private static notifyAuthListeners(user: User | null): void {
    this.authListeners.forEach(callback => callback(user));
  }

  private static parseJwt(token: string): any | null {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}
