export interface Appointment {
  insuredId: string;
  scheduleId: number;
  centerId?: number | null;
  specialtyId?: number | null;
  medicId?: number | null;
  date?: string | null;
  countryISO: "PE" | "CL";
  status: "pending" | "completed";
  createdAt: string;
  updatedAt?: string;
}