import { IEventPublisher } from "../../application/sns/events/IEventPublisher";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({});
const TOPIC_ARN = process.env.SNS_TOPIC_ARN!;

export class SnsEventPublisher implements IEventPublisher {
  async publishAppointmentCreated(payload: { insuredId: string; scheduleId: number; countryISO: string; centerId?: number | null; specialtyId?: number | null; medicId?: number | null; date?: string | null }) {
	await sns.send(new PublishCommand({
		TopicArn: TOPIC_ARN,
		Message: JSON.stringify(payload), 
		MessageAttributes: {
		countryISO: { DataType: "String", StringValue: payload.countryISO }
		}
	}));
	}
}
