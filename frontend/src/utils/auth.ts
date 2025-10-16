import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded: any = jwtDecode(token);
    return decoded?.id || decoded?.userId || decoded?.sub || null;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
