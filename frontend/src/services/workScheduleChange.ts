import api from "./api";
import type { AttendanceCorrectionRequest, AttendanceCorrectionStatus } from "../types/workScheduleChange";

export const workScheduleChangeService = {
  async create(data: { date: string; markType: string; requestedTime: string; reason: string }) {
    const response = await api.post<AttendanceCorrectionRequest>("/solicitudes-correccion", data);
    return response.data;
  },

  async listMine() {
    const response = await api.get<AttendanceCorrectionRequest[]>("/solicitudes-correccion/mias");
    return response.data;
  },

  async listCompany(status?: AttendanceCorrectionStatus) {
    const response = await api.get<AttendanceCorrectionRequest[]>("/solicitudes-correccion", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async approve(id: string, comment?: string) {
    const response = await api.post<AttendanceCorrectionRequest>(`/solicitudes-correccion/${id}/aprobar`, { comment });
    return response.data;
  },

  async reject(id: string, comment?: string) {
    const response = await api.post<AttendanceCorrectionRequest>(`/solicitudes-correccion/${id}/rechazar`, { comment });
    return response.data;
  },
};
