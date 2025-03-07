// auth.d.ts
export const isAuthenticated: () => boolean;
export const getToken: () => string | null;
export const getShopId: () => string | null;
export const logout: () => void;