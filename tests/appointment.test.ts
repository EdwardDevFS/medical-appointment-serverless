import { CreateAppointmentCommand } from '../src/application/appointment/commands/CreateAppointmentCommand';
import { ProcessCountryAppointmentCommand } from '../src/application/appointment/commands/ProcessCountryAppointmentCommand';
import { CompleteAppointmentCommand } from '../src/application/appointment/commands/CompleteAppointmentCommand';
import { GetAppointmentsByInsuredIdQuery } from '../src/application/appointment/queries/GetAppointmentsByInsuredIdQuery';
import { Appointment } from '../src/domain/Appointment';

describe('Appointment System', () => {
  const mockAppointment: Appointment = {
    insuredId: '00001',
    scheduleId: 100,
    countryISO: 'PE',
    centerId: 4,
    specialtyId: 3,
    medicId: 4,
    date: '2024-09-30T12:30:00Z',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const mockRepo = {
    create: jest.fn(),
    findByInsuredId: jest.fn().mockResolvedValue([mockAppointment]),
    findByKey: jest.fn().mockResolvedValue(mockAppointment),
    updateStatus: jest.fn(),
  };

  const mockCountryRepo = { 
    create: jest.fn() 
  };

  const mockSnsPublisher = { 
    publishAppointmentCreated: jest.fn() 
  };

  const mockEventBridgePublisher = { 
    publishAppointmentConfirmed: jest.fn() 
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateAppointmentCommand', () => {
    it('should create appointment successfully', async () => {
      const command = new CreateAppointmentCommand(mockRepo, mockSnsPublisher);
      const result = await command.execute({ 
        insuredId: '00001', 
        scheduleId: 100, 
        countryISO: 'PE',
        centerId: 4,
        specialtyId: 3,
        medicId: 4,
        date: '2024-09-30T12:30:00Z'
      });

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        insuredId: '00001',
        scheduleId: 100,
        countryISO: 'PE',
        status: 'pending'
      }));
      expect(mockSnsPublisher.publishAppointmentCreated).toHaveBeenCalled();
      expect(result.status).toBe('pending');
    });

    it('should validate insuredId format', async () => {
      const command = new CreateAppointmentCommand(mockRepo, mockSnsPublisher);
      
      await expect(command.execute({ 
        insuredId: '123', // Invalid format
        scheduleId: 100, 
        countryISO: 'PE' 
      })).rejects.toThrow('insuredId must be 5 digits');
    });

    it('should validate countryISO values', async () => {
      const command = new CreateAppointmentCommand(mockRepo, mockSnsPublisher);
      
      await expect(command.execute({ 
        insuredId: '00001',
        scheduleId: 100, 
        countryISO: 'XX' as any
      })).rejects.toThrow('countryISO must be PE or CL');
    });
  });

  describe('ProcessCountryAppointmentCommand', () => {
    it('should process country appointment successfully', async () => {
      const command = new ProcessCountryAppointmentCommand(
        mockRepo, 
        mockCountryRepo, 
        mockEventBridgePublisher
      );
      
      await command.execute('00001', 100, 'PE');
      
      expect(mockRepo.findByKey).toHaveBeenCalledWith('00001', 100);
      expect(mockCountryRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        insuredId: '00001',
        scheduleId: 100,
        countryISO: 'PE',
        status: 'completed'
      }));
      expect(mockEventBridgePublisher.publishAppointmentConfirmed).toHaveBeenCalledWith({
        insuredId: '00001',
        scheduleId: 100,
        countryISO: 'PE'
      });
    });

    it('should throw error when appointment not found', async () => {
      mockRepo.findByKey.mockResolvedValueOnce(null);
      const command = new ProcessCountryAppointmentCommand(
        mockRepo, 
        mockCountryRepo, 
        mockEventBridgePublisher
      );
      
      await expect(command.execute('00001', 100, 'PE'))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('CompleteAppointmentCommand', () => {
    it('should complete appointment successfully', async () => {
      const command = new CompleteAppointmentCommand(mockRepo);
      
      await command.execute('00001', 100);
      
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('00001', 100, 'completed');
    });
  });

  describe('GetAppointmentsByInsuredIdQuery', () => {
    it('should return appointments for valid insuredId', async () => {
      const query = new GetAppointmentsByInsuredIdQuery(mockRepo);
      
      const result = await query.execute('00001');
      
      expect(mockRepo.findByInsuredId).toHaveBeenCalledWith('00001');
      expect(result).toEqual([mockAppointment]);
    });

    it('should validate insuredId format', async () => {
      const query = new GetAppointmentsByInsuredIdQuery(mockRepo);
      
      await expect(query.execute('123'))
        .rejects.toThrow('insuredId must be 5 digits');
    });
  });

  describe('Integration Flow', () => {
    it('should handle complete appointment flow', async () => {
      // Step 1: Create appointment
      const createCommand = new CreateAppointmentCommand(mockRepo, mockSnsPublisher);
      const appointment = await createCommand.execute({ 
        insuredId: '00001', 
        scheduleId: 100, 
        countryISO: 'PE' 
      });
      
      expect(appointment.status).toBe('pending');
      
      // Step 2: Process country appointment
      const processCommand = new ProcessCountryAppointmentCommand(
        mockRepo, 
        mockCountryRepo, 
        mockEventBridgePublisher
      );
      await processCommand.execute('00001', 100, 'PE');
      
      // Step 3: Complete appointment
      const completeCommand = new CompleteAppointmentCommand(mockRepo);
      await completeCommand.execute('00001', 100);
      
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockSnsPublisher.publishAppointmentCreated).toHaveBeenCalled();
      expect(mockCountryRepo.create).toHaveBeenCalled();
      expect(mockEventBridgePublisher.publishAppointmentConfirmed).toHaveBeenCalled();
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('00001', 100, 'completed');
    });
  });
});