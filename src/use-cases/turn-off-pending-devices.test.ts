import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TurnOffPendingDevices } from './turn-off-pending-devices';
import { DeviceRepository } from '../repository/DeviceRepository';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    turnOffPendingDevices: vi.fn(),
  },
}));

describe('TurnOffPendingDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should call DeviceRepository.turnOffPendingDevices', async () => {
      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue({ count: 0 });

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
    });

    it('should handle successful turn off operation', async () => {
      const mockResult = { count: 5 };
      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue(mockResult);

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
    });

    it('should handle when no devices are turned off', async () => {
      const mockResult = { count: 0 };
      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue(mockResult);

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
    });
  });
});

