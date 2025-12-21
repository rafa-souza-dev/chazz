import { DeviceRepository } from "../repository/DeviceRepository";
import { DeviceNotFoundError } from "../errors/DeviceNotFoundError";
import { logger } from "../lib/logger";

type DeleteDeviceParams = {
    id: number;
}

export class DeleteDevice {
    static async handle({ id }: DeleteDeviceParams) {
        logger.info({ deviceId: id }, 'Starting device deletion');

        const existingDevice = await DeviceRepository.findDevice(id);
        if (!existingDevice) {
            logger.warn({ deviceId: id }, 'Device not found');
            throw new DeviceNotFoundError(id);
        }

        const device = await DeviceRepository.deleteDevice(id);
        logger.info({ deviceId: id }, 'Device deleted successfully');
        return device;
    }
}

