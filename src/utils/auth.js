export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getShopId = () => {
  return localStorage.getItem('shopId');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('shopId');
};