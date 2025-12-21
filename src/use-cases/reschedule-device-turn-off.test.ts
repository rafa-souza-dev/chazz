import { describe, it, expect, vi, beforeEach } from 'vitest';

import { RescheduleDeviceTurnOff } from './reschedule-device-turn-off';
import { DeviceRepository } from '../repository/DeviceRepository';
import { DeviceNotFoundError } from '../errors/DeviceNotFoundError';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    findDevice: vi.fn(),
    updateDevice: vi.fn(),
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
    });

    it('should update turnOffAt when paidCents equals centsPerCycle', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        centsPerCycle: 1000,
        secondsPerCycle: 3600,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T11:00:00Z'),
      });
    });

    it('should update turnOffAt when paidCents is greater than centsPerCycle', async () => {
      const deviceId = 1;
      const paidCents = 2000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        centsPerCycle: 1000,
        secondsPerCycle: 1800,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T10:30:00Z'),
      });
    });

    it('should use new Date() as base when turnOffAt is null', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const device = {
        id: deviceId,
        centsPerCycle: 1000,
        secondsPerCycle: 7200,
        turnOffAt: null,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);

      const beforeCall = new Date();
      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });
      const afterCall = new Date();

      expect(DeviceRepository.findDevice).toHaveBeenCalledWith(deviceId);
      expect(DeviceRepository.updateDevice).toHaveBeenCalledTimes(1);

      const updateCall = vi.mocked(DeviceRepository.updateDevice).mock.calls[0];
      const rescheduledDate = updateCall[1].turnOffAt as Date;

      const expectedMin = new Date(beforeCall.getTime() + 7200 * 1000);
      const expectedMax = new Date(afterCall.getTime() + 7200 * 1000);

      expect(rescheduledDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(rescheduledDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it('should correctly calculate rescheduledTurnOffAt with different secondsPerCycle values', async () => {
      const deviceId = 1;
      const paidCents = 1000;
      const turnOffAt = new Date('2024-01-01T10:00:00Z');
      const device = {
        id: deviceId,
        centsPerCycle: 1000,
        secondsPerCycle: 900,
        turnOffAt,
      };

      vi.mocked(DeviceRepository.findDevice).mockResolvedValue(device as any);
      vi.mocked(DeviceRepository.updateDevice).mockResolvedValue(device as any);

      await RescheduleDeviceTurnOff.handle({ deviceId, paidCents });

      expect(DeviceRepository.updateDevice).toHaveBeenCalledWith(deviceId, {
        turnOffAt: new Date('2024-01-01T10:15:00Z'),
      });
    });
  });
});
