import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TurnOffPendingDevices } from './turn-off-pending-devices';
import { DeviceRepository } from '../repository/DeviceRepository';
import { TuyaDeviceService } from '../service/tuya-device.service';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    turnOffPendingDevices: vi.fn(),
  },
}));

vi.mock('../service/tuya-device.service', () => ({
  TuyaDeviceService: {
    turnOff: vi.fn(),
  },
}));

describe('TurnOffPendingDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should call TuyaDeviceService.turnOff for each device', async () => {
      const devices = [
        { id: 1, externalId: 'device1', centsPerCycle: 1000, secondsPerCycle: 3600, turnOffAt: new Date() },
        { id: 2, externalId: 'device2', centsPerCycle: 2000, secondsPerCycle: 1800, turnOffAt: new Date() },
      ];

      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue(devices as any);
      vi.mocked(TuyaDeviceService.turnOff).mockResolvedValue({} as any);

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
      expect(TuyaDeviceService.turnOff).toHaveBeenCalledTimes(2);
      expect(TuyaDeviceService.turnOff).toHaveBeenCalledWith('device1');
      expect(TuyaDeviceService.turnOff).toHaveBeenCalledWith('device2');
    });

    it('should handle when no devices are found', async () => {
      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue([]);

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
      expect(TuyaDeviceService.turnOff).not.toHaveBeenCalled();
    });

    it('should call turnOff with correct externalId for single device', async () => {
      const devices = [
        { id: 1, externalId: 'device123', centsPerCycle: 1000, secondsPerCycle: 3600, turnOffAt: new Date() },
      ];

      vi.mocked(DeviceRepository.turnOffPendingDevices).mockResolvedValue(devices as any);
      vi.mocked(TuyaDeviceService.turnOff).mockResolvedValue({} as any);

      await TurnOffPendingDevices.handle();

      expect(DeviceRepository.turnOffPendingDevices).toHaveBeenCalledTimes(1);
      expect(TuyaDeviceService.turnOff).toHaveBeenCalledTimes(1);
      expect(TuyaDeviceService.turnOff).toHaveBeenCalledWith('device123');
    });
  });
});

