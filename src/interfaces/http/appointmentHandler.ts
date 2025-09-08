import { DynamoAppointmentRepository } from "../../infrastructure/dynamo/repositories/DynamoAppointmentRepository";
import { SnsEventPublisher } from "../../infrastructure/sns/SnsEventPublisher";
import { CreateAppointmentCommand } from "../../application/appointment/commands/CreateAppointmentCommand";
import { GetAppointmentsByInsuredIdQuery } from "../../application/appointment/queries/GetAppointmentsByInsuredIdQuery";
import { APIGatewayProxyHandler } from "aws-lambda";

const repo = new DynamoAppointmentRepository();
const publisher = new SnsEventPublisher();
const createAppointment = new CreateAppointmentCommand(repo, publisher);
const getAppointments = new GetAppointmentsByInsuredIdQuery(repo);

export const handler: APIGatewayProxyHandler = async (event: any) => {
  console.log("Appointment handler received event:", JSON.stringify(event, null, 2));
  
  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    
    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      
      if (!body.insuredId || !body.scheduleId || !body.countryISO) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            error: "Missing required fields: insuredId, scheduleId, countryISO" 
          })
        };
      }
      
      const appointment = await createAppointment.execute(body);
      
      return {
        statusCode: 202,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "agendamiento en proceso",
          appointment: {
            insuredId: appointment.insuredId,
            scheduleId: appointment.scheduleId,
            countryISO: appointment.countryISO,
            status: appointment.status,
            createdAt: appointment.createdAt
          }
        })
      };
    }
    
    if (method === "GET") {
      const insuredId = event.pathParameters?.insuredId;
      
      if (!insuredId) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "insuredId parameter is required" })
        };
      }
      
      const appointments = await getAppointments.execute(insuredId);
      
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          insuredId,
          appointments: appointments.map(apt => ({
            scheduleId: apt.scheduleId,
            countryISO: apt.countryISO,
            status: apt.status,
            centerId: apt.centerId,
            specialtyId: apt.specialtyId,
            medicId: apt.medicId,
            date: apt.date,
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt
          }))
        })
      };
    }
    
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
    
  } catch (error) {
    console.error("Error in appointment handler:", error);
    
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      })
    };
  }
};