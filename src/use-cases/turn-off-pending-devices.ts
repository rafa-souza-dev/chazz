import { DeviceRepository } from "../repository/DeviceRepository";
import { TuyaDeviceService } from "../service/tuya-device.service";
import { logger } from "../lib/logger";

export class TurnOffPendingDevices {
    static async handle() {
        logger.info('Starting turn off pending devices');

        const devices = await DeviceRepository.turnOffPendingDevices();
        logger.info({ deviceCount: devices.length }, 'Found pending devices to turn off');

        if (devices.length === 0) {
            logger.debug('No pending devices to turn off');
            return;
        }

        logger.debug({ deviceIds: devices.map(d => d.id), externalIds: devices.map(d => d.externalId) }, 'Turning off devices');

        await Promise.all(
            devices.map(device => TuyaDeviceService.turnOff(device.externalId))
        );

        logger.info({ deviceCount: devices.length }, 'All pending devices turned off successfully');
    }
}
