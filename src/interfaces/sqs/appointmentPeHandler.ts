import { SQSEvent } from "aws-lambda";
import { DynamoAppointmentRepository } from "../../infrastructure/dynamo/repositories/DynamoAppointmentRepository";
import { RdsAppointmentRepository } from "../../infrastructure/rds/repositories/RdsAppointmentRepository";
import { EventBridgePublisher } from "../../infrastructure/eventbridge/EventBridgePublisher";
import { ProcessCountryAppointmentCommand } from "../../application/appointment/commands/ProcessCountryAppointmentCommand";

const dynamoRepo = new DynamoAppointmentRepository();
const rdsRepo = new RdsAppointmentRepository();
const publisher = new EventBridgePublisher();
const processCommand = new ProcessCountryAppointmentCommand(dynamoRepo, rdsRepo, publisher);

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      if (payload.countryISO !== "PE") throw new Error("Invalid country for PE handler");

      await processCommand.execute(payload.insuredId, payload.scheduleId, "PE");
    } catch (error) {
      console.error("Error in PE handler:", error);
      // No manejo de fallos requerido
    }
  }
  return {};
};