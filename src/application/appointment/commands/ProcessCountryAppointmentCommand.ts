import { Appointment } from "../../../domain/Appointment";
import { IAppointmentRepository } from "../repositories/IAppointmentRepository";
import { ICountryAppointmentRepository } from "../repositories/ICountryAppointmentRepository";
import { IEventPublisher } from "../../eventbridge/events/IEventPublisher";

export class ProcessCountryAppointmentCommand {
  constructor(
    private appointmentRepository: IAppointmentRepository, 
    private countryAppointmentRepository: ICountryAppointmentRepository, 
    private publisher: IEventPublisher
  ) {}

  async execute(insuredId: string, scheduleId: number, countryISO: "PE" | "CL"): Promise<void> {
    const appointment = await this.appointmentRepository.findByKey(insuredId, scheduleId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const countryAppointment: Appointment = {
      ...appointment,
      status: "completed",
      countryISO, 
    };

    await this.countryAppointmentRepository.create(countryAppointment);
    await this.publisher.publishAppointmentConfirmed({ insuredId, scheduleId, countryISO });
  }
}