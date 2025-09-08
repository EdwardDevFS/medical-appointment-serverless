export interface IEventPublisher {
  publishAppointmentCreated(event: {
    insuredId: string;
    scheduleId: number;
    countryISO: string;
    centerId?: number | null;
    specialtyId?: number | null;
    medicId?: number | null;
    date?: string | null;
  }): Promise<void>;
}