import { DeviceRepository } from "../repository/DeviceRepository";
import { DeviceNotFoundError } from "../errors/DeviceNotFoundError";
import { logger } from "../lib/logger";

type GetDeviceParams = {
    id: number;
}

export class GetDevice {
    static async handle({ id }: GetDeviceParams) {
        logger.info({ deviceId: id }, 'Getting device');
        const device = await DeviceRepository.findDevice(id);

        if (!device) {
            logger.warn({ deviceId: id }, 'Device not found');
            throw new DeviceNotFoundError(id);
        }

        logger.info({ deviceId: id }, 'Device found');
        return device;
    }
}

