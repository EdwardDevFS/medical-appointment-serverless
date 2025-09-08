import { Appointment } from "../../../domain/Appointment";
import { IAppointmentRepository } from "../repositories/IAppointmentRepository";
import { IEventPublisher } from "../../sns/events/IEventPublisher";

export class CreateAppointmentCommand {
  constructor(private appointmentRepository: IAppointmentRepository, private publisher: IEventPublisher) {}

  async execute(input: {
    insuredId: string;
    scheduleId: number;
    countryISO: "PE" | "CL";
    centerId?: number;
    specialtyId?: number;
    medicId?: number;
    date?: string;
  }): Promise<Appointment> {
    if (!/^\d{5}$/.test(input.insuredId)) throw new Error("insuredId must be 5 digits");
    if (!Number.isInteger(input.scheduleId)) throw new Error("scheduleId must be integer");
    if (input.countryISO !== "PE" && input.countryISO !== "CL") throw new Error("countryISO must be PE or CL");

    const appointment: Appointment = {
      insuredId: input.insuredId,
      scheduleId: input.scheduleId,
      countryISO: input.countryISO,
      centerId: input.centerId ?? null,
      specialtyId: input.specialtyId ?? null,
      medicId: input.medicId ?? null,
      date: input.date ?? null,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    await this.appointmentRepository.create(appointment);
    await this.publisher.publishAppointmentCreated({
      insuredId: appointment.insuredId,
      scheduleId: appointment.scheduleId,
      countryISO: appointment.countryISO,
      centerId: appointment.centerId,
      specialtyId: appointment.specialtyId,
      medicId: appointment.medicId,
      date: appointment.date
    });

    return appointment;
  }
}