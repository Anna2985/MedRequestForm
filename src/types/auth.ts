export interface Permission {
  name: string;
  state: boolean;
}

export interface UserData {
  GUID: string;
  ID: string;
  Name: string;
  Employer?: string;
  Role?: string;
  Token?: string;
  Permissions: Permission[];
  loginTime: string;
}

export interface LoginRequest {
  Data: {
    ID: string;
    Password: string;
  };
}

export interface LoginResponse {
  Code: number;
  Data: UserData;
  Result: string;
}