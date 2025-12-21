import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListDevices } from './list-devices';
import { DeviceRepository } from '../repository/DeviceRepository';

vi.mock('../repository/DeviceRepository', () => ({
  DeviceRepository: {
    findAllDevices: vi.fn(),
  },
}));

describe('ListDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    it('should return empty array when no devices exist', async () => {
      vi.mocked(DeviceRepository.findAllDevices).mockResolvedValue([]);

      const result = await ListDevices.handle();

      expect(DeviceRepository.findAllDevices).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return list of devices', async () => {
      const devices = [
        {
          id: 1,
          externalId: 'device1',
          centsPerCycle: 1000,
          secondsPerCycle: 3600,
          turnOffAt: null,
        },
        {
          id: 2,
          externalId: 'device2',
          centsPerCycle: 2000,
          secondsPerCycle: 1800,
          turnOffAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      vi.mocked(DeviceRepository.findAllDevices).mockResolvedValue(devices as any);

      const result = await ListDevices.handle();

      expect(DeviceRepository.findAllDevices).toHaveBeenCalled();
      expect(result).toEqual(devices);
      expect(result.length).toBe(2);
    });
  });
});

