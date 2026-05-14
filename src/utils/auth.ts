import type { UserData, Permission } from '../types/auth';

const hasRequiredPermission = (permissions: Permission[]): boolean => {
  const distributionPermission = permissions.find(p => p.name === '管制結存');
  return distributionPermission?.state === true;
};

export const saveUserData = (userData: UserData): boolean => {
  if (!hasRequiredPermission(userData.Permissions)) {
    return false;
  }

  // Add login time to user data
  const userDataWithTime = {
    ...userData,
    loginTime: new Date().toISOString()
  };

  sessionStorage.setItem('user_session', JSON.stringify(userDataWithTime));
  return true;
};

export const getUserData = (): UserData | null => {
  const userSession = sessionStorage.getItem('user_session');
  if (!userSession) return null;
  
  try {
    const userData = JSON.parse(userSession);
    if (!userData.GUID || !userData.ID || !userData.Name || !hasRequiredPermission(userData.Permissions)) {
      clearUserData();
      return null;
    }
    return userData;
  } catch (error) {
    clearUserData();
    return null;
  }
};

export const clearUserData = () => {
  sessionStorage.removeItem('user_session');
};

export const isAuthenticated = (): boolean => {
  const userData = getUserData();
  if (!userData) return false;

  const loginTime = new Date(userData.loginTime).getTime();
  const now = new Date().getTime();
  const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    clearUserData();
    return false;
  }

  return true;
};

export const getLoggedName = () => {
  const userData = getUserData();
  return userData?.Name || '';
};