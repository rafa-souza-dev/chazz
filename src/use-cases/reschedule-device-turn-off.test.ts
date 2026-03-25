import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RescheduleDeviceTurnOff } from './reschedule-device-turn-off';
import { broadcastDeviceRescheduled } from '../realtime/device-updates-broadcast';
import { DeviceRepository } from '../repository/DeviceRepository';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';
import { TuyaDeviceService } from '../service/tuya-device.service';

vi.mock('../realtime/device-updates-broadcast', () => ({
  broadcastDeviceRescheduled: vi.fn(),
}));

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    findDevice: vi.fn(),
    updateDevice: vi.fn(),
  },
}));

vi.mock('../service/tuya-device.service', () => ({
  TuyaDeviceService: {
    turnOn: vi.fn(),
  },
}));

describe('RescheduleDeviceTurnOff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should throw DeviceNotFoundError when device is not found', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(null);

      await expect(
        RescheduleDeviceTurnOff.handle({ deviceId, paidCents })
      ).rejects.toThrow(DeviceNotFoundError);
      await expect(
        RescheduleDeviceTurnOff.handle({ deviceId, paidCents })
      ).rejects.toThrow(`Device with id "${deviceId}" was not found`);

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).not.toHaveBeenCalled();
      expect(broadcastDeviceRescheduled).not.toHaveBeenCalled();
    });

    it('should not update device when paidCents is less than centsPerCycle', async () => {
      const deviceId = 1;
      const paidCents = 500;
      const device = {
        id: deviceId,
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt: new Date('2024-01-01T10:00:00Z'),
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).not.toHaveBeenCalled();
      expect(broadcastDeviceRescheduled).not.toHaveBeenCalled();
    });

    it('should update turnOffAt when paidCents equals centsPerCycle', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        externalId: 'device1',
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);
      vi.mocked(TuyaDeviceService.turnOn).mockResolvedValue({} as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(TuyaDeviceService.turnOn).toHaveBeenCalledWith('device1');
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T11:00:00Z'),
      });
      expect(broadcastDeviceRescheduled).toHaveBeenCalledWith(
        deviceId,
        new Date('2024-01-01T11:00:00Z'),
      );
    });

    it('should update turnOffAt when paidCents is greater than centsPerCycle', async () => {
      const deviceId = 1;
      const paidCents = 2000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        externalId: 'device2',
        centsPerCycle: 1000,
        secondsPerCycle: 1800,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);
      vi.mocked(TuyaDeviceService.turnOn).mockResolvedValue({} as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(TuyaDeviceService.turnOn).toHaveBeenCalledWith('device2');
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T10:30:00Z'),
      });
      expect(broadcastDeviceRescheduled).toHaveBeenCalledWith(
        deviceId,
        new Date('2024-01-01T10:30:00Z'),
      );
    });

    it('should use new Date() as base when turnOffAt is null', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const device = {
        id: deviceId,
        externalId: 'device3',
        centsPerCycle: 1000,
        secondsPerCycle: 7200,
        turnOffAt: null,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);
      vi.mocked(TuyaDeviceService.turnOn).mockResolvedValue({} as any);

      const beforeCall = new Date();
      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });
      const afterCall = new Date();

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(TuyaDeviceService.turnOn).toHaveBeenCalledWith('device3');
      expect(DeviceRepository.updateDevice).toHaveBeenCalledTimes(1);

      const updateCall = vi.mocked(DeviceRepository.updateDevice).mock.calls[0];
      const rescheduledDate = updateCall[1].turnOffAt as Date;

      const expectedMin = new Date(beforeCall.getTime() + 7200 * 1000);
      const expectedMax = new Date(afterCall.getTime() + 7200 * 1000);

      expect(rescheduledDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(rescheduledDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());

      expect(broadcastDeviceRescheduled).toHaveBeenCalledWith(deviceId, rescheduledDate);
    });

    it('should correctly calculate rescheduledTurnOffAt with different secondsPerCycle values', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        externalId: 'device4',
        centsPerCycle: 1000,
        secondsPerCycle: 900,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);
      vi.mocked(TuyaDeviceService.turnOn).mockResolvedValue({} as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(TuyaDeviceService.turnOn).toHaveBeenCalledWith('device4');
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T10:15:00Z'),
      });
      expect(broadcastDeviceRescheduled).toHaveBeenCalledWith(
        deviceId,
        new Date('2024-01-01T10:15:00Z'),
      );
    });
  });
});
