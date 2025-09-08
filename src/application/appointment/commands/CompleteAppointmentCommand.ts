import { IAppointmentRepository } from "../repositories/IAppointmentRepository";

export class CompleteAppointmentCommand {
  constructor(private appointmentRepository: IAppointmentRepository) {} // Dynamo

  async execute(insuredId: string, scheduleId: number): Promise<void> {
    await this.appointmentRepository.updateStatus(insuredId, scheduleId, "completed");
  }
}