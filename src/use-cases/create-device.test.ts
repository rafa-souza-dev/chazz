import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDevice } from './create-device';
import { DeviceRepository } from '../repository/DeviceRepository';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    createDevice: vi.fn(),
  },
}));

describe('CreateDevice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should create a device successfully', async () => {
      const deviceData = {
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
      };

      const createdDevice = {
        id: 1,
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt: null,
      };

      vi.mocked(DeviceRepository.createDevice).mockResolvedValue(createdDevice as any);

      const result = await CreateDevice.handle({ data: deviceData });

      expect(DeviceRepository.createDevice).toHaveBeenCalledWith(deviceData);
      expect(result).toEqual(createdDevice);
    });

    it('should create a device with turnOffAt', async () => {
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const deviceData = {
        externalId: 'device2',
        centsPerCycle: 2000,
        secondsPerCycle: 1800,
        turnOffAt,
      };

      const createdDevice = {
        id: 2,
        externalId: 'device2',
        centsPerCycle: 2000,
        secondsPerCycle: 1800,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.createDevice).mockResolvedValue(createdDevice as any);

      const result = await CreateDevice.handle({ data: deviceData });

      expect(DeviceRepository.createDevice).toHaveBeenCalledWith(deviceData);
      expect(result).toEqual(createdDevice);
    });
  });
});

