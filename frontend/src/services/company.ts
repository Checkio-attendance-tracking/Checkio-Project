import api from './api';

export interface CompanySettings {
  geofenceEnabled: boolean;
  geofenceLat?: number;
  geofenceLng?: number;
  geofenceRadius?: number;
}

export const companyService = {
  async getSettings() {
    const response = await api.get<CompanySettings>('/empresa/settings');
    return response.data;
  },

  async updateSettings(data: CompanySettings) {
    const response = await api.put<CompanySettings>('/empresa/settings', data);
    return response.data;
  }
};
