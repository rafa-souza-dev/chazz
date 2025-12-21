import { DeviceRepository } from "../repository/DeviceRepository";
import { logger } from "../lib/logger";

export class ListDevices {
    static async handle() {
        logger.info('Listing all devices');
        const devices = await DeviceRepository.findAllDevices();
        logger.info({ deviceCount: devices.length }, 'Devices listed successfully');
        return devices;
    }
}

