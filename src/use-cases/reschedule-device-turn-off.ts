import { DeviceNotFoundError } from "../errors/DeviceNotFoundError";
import { DeviceRepository } from "../repository/DeviceRepository";
import { broadcastDeviceRescheduled } from "../realtime/device-updates-broadcast";
import { TuyaDeviceService } from "../service/tuya-device.service";
import { logger } from "../lib/logger";

type RescheduleDeviceTurnOffParams = {
    deviceId: number;
    paidCents: number;
}

export class RescheduleDeviceTurnOff {
    static async handle({ deviceId, paidCents }: RescheduleDeviceTurnOffParams) {
        logger.info({ deviceId, paidCents }, 'Starting device reschedule');

        const device = await DeviceRepository.findDevice(deviceId);

        if (!device) {
            logger.warn({ deviceId }, 'Device not found');
            throw new DeviceNotFoundError(deviceId);
        }

        logger.debug({ deviceId, centsPerCycle: device.centsPerCycle, paidCents }, 'Device found, checking payment');

        if (paidCents < device.centsPerCycle) {
            logger.info({ deviceId, paidCents, centsPerCycle: device.centsPerCycle }, 'Payment insufficient, skipping reschedule');
            return;
        }

        const turnOffAt = device.turnOffAt ?? new Date();
        const rescheduledTurnOffAt = new Date(
            turnOffAt.getTime() + (device.secondsPerCycle * 1000)
        );

        logger.info({ deviceId, externalId: device.externalId, turnOffAt, rescheduledTurnOffAt }, 'Turning on device and rescheduling');

        await TuyaDeviceService.turnOn(device.externalId);
        logger.debug({ deviceId, externalId: device.externalId }, 'Device turned on via Tuya');

        await DeviceRepository.updateDevice(device.id, { turnOffAt: rescheduledTurnOffAt });
        logger.info({ deviceId, rescheduledTurnOffAt }, 'Device reschedule completed');
        broadcastDeviceRescheduled(device.id, rescheduledTurnOffAt);
    }
}
