import { Appointment } from "../../../domain/Appointment";

export interface IAppointmentRepository {
  create(appointment: Appointment): Promise<void>;
  findByInsuredId(insuredId: string): Promise<Appointment[]>;
  findByKey(insuredId: string, scheduleId: number): Promise<Appointment | null>;
  updateStatus(insuredId: string, scheduleId: number, status: "pending" | "completed"): Promise<void>;
}