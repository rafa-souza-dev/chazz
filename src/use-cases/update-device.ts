import { DeviceRepository } from "../repository/DeviceRepository";
import { DeviceNotFoundError } from "../errors/DeviceNotFoundError";
import { logger } from "../lib/logger";
import { DeviceUpdateInput } from "../../generated/prisma/models";

type UpdateDeviceParams = {
    id: number;
    data: DeviceUpdateInput;
}

export class UpdateDevice {
    static async handle({ id, data }: UpdateDeviceParams) {
        logger.info({ deviceId: id, data }, 'Starting device update');

        const existingDevice = await DeviceRepository.findDevice(id);
        if (!existingDevice) {
            logger.warn({ deviceId: id }, 'Device not found');
            throw new DeviceNotFoundError(id);
        }

        const device = await DeviceRepository.updateDevice(id, data);
        logger.info({ deviceId: id }, 'Device updated successfully');
        return device;
    }
}

