import api from './api';

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createAt: string;
  updateAt: string;
}

export async function getMyProfile(): Promise<CustomerProfile> {
  const response = await api.get<CustomerProfile>('/users/me');

  return response.data;
}

export interface UpdateMyProfileRequest {
  name?: string;
  email?: string;
}

export async function updateMyProfile(
  data: UpdateMyProfileRequest,
): Promise<CustomerProfile> {
  const response = await api.patch<CustomerProfile>('/users/me', data);
  return response.data;
}
