import { DeviceRepository } from "../repository/DeviceRepository";
import { logger } from "../lib/logger";
import { DeviceCreateInput } from "../../generated/prisma/models";

type CreateDeviceParams = {
    data: DeviceCreateInput;
}

export class CreateDevice {
    static async handle({ data }: CreateDeviceParams) {
        logger.info({ data }, 'Starting device creation');
        const device = await DeviceRepository.createDevice(data);
        logger.info({ deviceId: device.id }, 'Device created successfully');
        return device;
    }
}

