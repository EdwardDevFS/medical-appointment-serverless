export interface IEventPublisher {
  publishAppointmentConfirmed(payload: { insuredId: string; scheduleId: number; countryISO: string }): Promise<void>;
}