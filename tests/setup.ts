import 'dotenv/config'; 
import { jest } from '@jest/globals';

process.env.APPOINTMENTS_TABLE = process.env.APPOINTMENTS_TABLE || 'test-appointments-table';
process.env.SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789:test-topic';
process.env.EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'test-event-bus';
process.env.RDS_HOST = process.env.RDS_HOST || 'localhost';
process.env.RDS_USER = process.env.RDS_USER || 'test';
process.env.RDS_PASSWORD = process.env.RDS_PASSWORD || 'test';
process.env.RDS_DATABASE = process.env.RDS_DATABASE || 'test_db';

jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
  DynamoDBDocumentClient: jest.fn(),
}));
jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(),
  PublishCommand: jest.fn(),
}));
jest.mock('@aws-sdk/client-eventbridge', () => ({
  EventBridgeClient: jest.fn(),
  PutEventsCommand: jest.fn(),
}));
jest.mock('mysql2/promise');

jest.setTimeout(10000);

beforeEach(() => {
  jest.clearAllMocks();
});
