interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  avatar: string;
}

interface PublicUser {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

interface TokenPayload extends PublicUser {
  exp: number;
}

// Mock users database
const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@company.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 2,
    email: "analyst@company.com",
    password: "analyst123",
    name: "Data Analyst",
    role: "analyst",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 3,
    email: "viewer@company.com",
    password: "viewer123",
    name: "Report Viewer",
    role: "viewer",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
];

// Mock JWT token generation
const generateToken = (user: User): string => {
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  // In a real app, this would be properly signed
  return btoa(JSON.stringify(payload));
};

export const authService = {
  async login(email: string, password: string): Promise<PublicUser> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user);
    localStorage.setItem("token", token);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    };
  },

  async getCurrentUser(): Promise<PublicUser | null> {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const decoded: TokenPayload = JSON.parse(atob(token));

      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        localStorage.removeItem("token");
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        avatar: decoded.avatar,
      };
    } catch (error) {
      localStorage.removeItem("token");
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem("token");
  },

  // Mock user management functions
  async getAllUsers(): Promise<PublicUser[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    }));
  },

  async updateUserRole(userId: number, newRole: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].role = newRole;
      return true;
    }
    return false;
  },

  async deleteUser(userId: number): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const userIndex = mockUsers.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
      return true;
    }
    return false;
  },
};
