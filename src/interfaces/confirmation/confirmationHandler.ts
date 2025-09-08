import { SQSEvent } from "aws-lambda";
import { DynamoAppointmentRepository } from "../../infrastructure/dynamo/repositories/DynamoAppointmentRepository";
import { CompleteAppointmentCommand } from "../../application/appointment/commands/CompleteAppointmentCommand";

const repo = new DynamoAppointmentRepository();
const completeCommand = new CompleteAppointmentCommand(repo);

export const handler = async (event: SQSEvent) => {
  console.log("Confirmation handler received event:", JSON.stringify(event, null, 2));
  
  for (const record of event.Records) {
    try {
      let payload;
      
      if (record.body.startsWith('{"Type":"Notification"')) {
        const snsMessage = JSON.parse(record.body);
        payload = JSON.parse(snsMessage.Message);
      } else {
        const eventBridgeMessage = JSON.parse(record.body);
        if (eventBridgeMessage.detail) {
          payload = eventBridgeMessage.detail;
        } else {
          payload = eventBridgeMessage;
        }
      }
      
      console.log("Processing confirmation for:", payload);
      
      const { insuredId, scheduleId } = payload;
      
      if (!insuredId || !scheduleId) {
        console.error("Missing insuredId or scheduleId in payload:", payload);
        continue;
      }

      await completeCommand.execute(insuredId, scheduleId);
      console.log(`Appointment ${insuredId}-${scheduleId} marked as completed`);
      
    } catch (error) {
      console.error("Error in confirmation handler:", error);
      console.error("Record body:", record.body);
    }
  }
  
  return { statusCode: 200 };
};