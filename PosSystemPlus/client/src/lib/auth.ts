import { apiRequest } from "./queryClient";

export interface AuthEmployee {
  id: number;
  employeeId: string;
  name: string;
}

export interface LoginCredentials {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  employee: AuthEmployee;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiRequest("POST", "/api/login", credentials);
  return response.json();
}

export function getStoredEmployee(): AuthEmployee | null {
  const stored = localStorage.getItem("employee");
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function storeEmployee(employee: AuthEmployee): void {
  localStorage.setItem("employee", JSON.stringify(employee));
}

export function clearStoredEmployee(): void {
  localStorage.removeItem("employee");
}
