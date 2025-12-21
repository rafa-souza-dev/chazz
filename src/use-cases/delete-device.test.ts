import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteDevice } from './delete-device';
import { DeviceRepository } from '../repository/DeviceRepository';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    findDevice: vi.fn(),
    deleteDevice: vi.fn(),
  },
}));

describe('DeleteDevice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should throw DeviceNotFoundError when device is not found', async () => {
      const deviceId = 999;
      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(null);

      await expect(DeleteDevice.handle({ id: deviceId })).rejects.toThrow(DeviceNotFoundError);
      await expect(DeleteDevice.handle({ id: deviceId })).rejects.toThrow(`Device with id "${deviceId}" was not found`);

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.deleteDevice).not.toHaveBeenCalled();
    });

    it('should delete device successfully', async () => {
      const deviceId = 1;
      const device = {
        id: deviceId,
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt: null,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.deleteDevice).mockResolvedValue(device as any);

      const result = await DeleteDevice.handle({ id: deviceId });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.deleteDevice).toHaveBeenCalledWith(deviceId);
      expect(result).toEqual(device);
    });
  });
});

