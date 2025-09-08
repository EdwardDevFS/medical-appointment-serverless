import { Appointment } from "../../../domain/Appointment";

export interface ICountryAppointmentRepository {
  create(appointment: Appointment): Promise<void>;
}