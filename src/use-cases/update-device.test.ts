import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDevice } from './update-device';
import { DeviceRepository } from '../repository/DeviceRepository';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    findDevice: vi.fn(),
    updateDevice: vi.fn(),
  },
}));

describe('UpdateDevice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should throw DeviceNotFoundError when device is not found', async () => {
      const deviceId = 999;
      const updateData = {
        centsPerCycle: 2000,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(null);

      await expect(UpdateDevice.handle({ id: deviceId, data: updateData })).rejects.toThrow(DeviceNotFoundError);
      await expect(UpdateDevice.handle({ id: deviceId, data: updateData })).rejects.toThrow(`Device with id "${deviceId}" was not found`);

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).not.toHaveBeenCalled();
    });

    it('should update device successfully', async () => {
      const deviceId = 1;
      const existingDevice = {
        id: deviceId,
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt: null,
      };

      const updateData = {
        centsPerCycle: 2000,
      };

      const updatedDevice = {
        ...existingDevice,
        centsPerCycle: 2000,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(existingDevice as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(updatedDevice as any);

      const result = await UpdateDevice.handle({ id: deviceId, data: updateData });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, updateData);
      expect(result).toEqual(updatedDevice);
    });

    it('should update device with multiple fields', async () => {
      const deviceId = 1;
      const existingDevice = {
        id: deviceId,
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt: null,
      };

      const updateData = {
        centsPerCycle: 2000,
        secondsPerCycle: 1800,
        turnOffAt: new Date('2024-01-01T10:00:00Z'),
      };

      const updatedDevice = {
        ...existingDevice,
        ...updateData,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(existingDevice as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(updatedDevice as any);

      const result = await UpdateDevice.handle({ id: deviceId, data: updateData });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, updateData);
      expect(result).toEqual(updatedDevice);
    });
  });
});

