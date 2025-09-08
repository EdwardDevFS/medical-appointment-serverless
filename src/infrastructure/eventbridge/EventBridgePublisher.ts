
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { IEventPublisher } from "../../application/eventbridge/events/IEventPublisher";

const eventBridge = new EventBridgeClient({});
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!;

export class EventBridgePublisher implements IEventPublisher {
  async publishAppointmentConfirmed(payload: { insuredId: string; scheduleId: number; countryISO: string }) {
    try {
      await eventBridge.send(new PutEventsCommand({
        Entries: [
          {
            Source: "appointment.service",
            DetailType: "AppointmentConfirmed",
            Detail: JSON.stringify(payload),
            EventBusName: EVENT_BUS_NAME,
          },
        ],
      }));
      console.log(`EventBridge: AppointmentConfirmed published for ${payload.insuredId}-${payload.scheduleId}`);
    } catch (error) {
      console.error("Error publishing to EventBridge:", error);
      throw error;
    }
  }
}