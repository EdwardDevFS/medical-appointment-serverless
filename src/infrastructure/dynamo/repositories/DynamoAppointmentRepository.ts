import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Appointment } from "../../../domain/Appointment";
import { IAppointmentRepository } from "../../../application/appointment/repositories/IAppointmentRepository";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE = process.env.APPOINTMENTS_TABLE!;

export class DynamoAppointmentRepository implements IAppointmentRepository {
  async create(appointment: Appointment): Promise<void> {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: appointment }));
  }
  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const res = await ddb.send(new QueryCommand({ TableName: TABLE, KeyConditionExpression: "insuredId = :id", ExpressionAttributeValues: { ":id": insuredId } }));
    return (res.Items as Appointment[]) ?? [];
  }
  async findByKey(insuredId: string, scheduleId: number): Promise<Appointment | null> {
    const res = await ddb.send(new GetCommand({ TableName: TABLE, Key: { insuredId, scheduleId } }));
    return res.Item as Appointment ?? null;
  }
  async updateStatus(insuredId: string, scheduleId: number, status: "pending" | "completed"): Promise<void> {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { insuredId, scheduleId },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status, ":updatedAt": new Date().toISOString() },
    }));
  }
}