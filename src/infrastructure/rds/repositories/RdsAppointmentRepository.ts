import mysql from "mysql2/promise";
import { Appointment } from "../../../domain/Appointment";
import { ICountryAppointmentRepository } from "../../../application/appointment/repositories/ICountryAppointmentRepository";

export class RdsAppointmentRepository implements ICountryAppointmentRepository{
  private config = {
    host: process.env.RDS_HOST!,
    user: process.env.RDS_USER!,
    password: process.env.RDS_PASSWORD!,
    database: process.env.RDS_DATABASE!,
  };

  async create(appointment: Appointment): Promise<void> {
    const conn = await mysql.createConnection(this.config);

    try {
      await conn.execute(
        `INSERT INTO appointments
        (insured_id, schedule_id, country_iso, center_id, specialty_id, medic_id, datetime, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointment.insuredId,
          appointment.scheduleId,
          appointment.countryISO,
          appointment.centerId ?? null,
          appointment.specialtyId ?? null,
          appointment.medicId ?? null,
          appointment.date ?? null,
          appointment.status,
          appointment.createdAt,
        ]
      );
    } finally {
      await conn.end();
    }
  }
}
