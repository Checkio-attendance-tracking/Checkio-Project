export type AttendanceCorrectionMarkType = "checkIn" | "lunchStart" | "lunchEnd" | "checkOut";
export type AttendanceCorrectionStatus = "pending" | "approved" | "rejected";

export type AttendanceCorrectionEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AttendanceCorrectionReviewer = {
  id: string;
  name: string;
  email: string;
};

export type AttendanceCorrectionAttendance = {
  date: string;
};

export interface AttendanceCorrectionRequest {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceId: string;
  attendance?: AttendanceCorrectionAttendance;
  employee?: AttendanceCorrectionEmployee;
  markType: AttendanceCorrectionMarkType;
  requestedTime: string;
  previousTimeAtRequest: string;
  previousTimeApplied?: string | null;
  status: AttendanceCorrectionStatus;
  reason: string;
  reviewComment?: string | null;
  reviewedByUserId?: string | null;
  reviewedByUser?: AttendanceCorrectionReviewer | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
