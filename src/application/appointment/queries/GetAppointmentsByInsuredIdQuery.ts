import { Appointment } from "../../../domain/Appointment";
import { IAppointmentRepository } from "../repositories/IAppointmentRepository";

export class GetAppointmentsByInsuredIdQuery {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(insuredId: string): Promise<Appointment[]> {
    if (!/^\d{5}$/.test(insuredId)) {
      throw new Error("insuredId must be 5 digits");
    }

    return await this.appointmentRepository.findByInsuredId(insuredId);
  }
}