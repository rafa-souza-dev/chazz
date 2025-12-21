import { DeviceCreateInput, DeviceUpdateInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export class DeviceRepository {
    static async findDevice(id: number) {
        logger.debug({ deviceId: id }, 'Finding device');
        const device = await prisma.device.findUnique({
            where: {
                id
            },
        });
        logger.debug({ deviceId: id, found: !!device }, 'Device query completed');
        return device;
    }

    static async findAllDevices() {
        logger.debug('Finding all devices');
        const devices = await prisma.device.findMany({
            orderBy: {
                id: 'asc'
            }
        });
        logger.debug({ deviceCount: devices.length }, 'All devices query completed');
        return devices;
    }

    static async createDevice(data: DeviceCreateInput) {
        logger.debug({ data }, 'Creating device');
        const device = await prisma.device.create({
            data
        });
        logger.debug({ deviceId: device.id }, 'Device created');
        return device;
    }

    static async updateDevice(id: number, data: DeviceUpdateInput) {
        logger.debug({ deviceId: id, data }, 'Updating device');
        const updated = await prisma.device.update({
            where: {
                id
            },
            data
        });
        logger.debug({ deviceId: id }, 'Device updated');
        return updated;
    }

    static async deleteDevice(id: number) {
        logger.debug({ deviceId: id }, 'Deleting device');
        const device = await prisma.device.delete({
            where: {
                id
            }
        });
        logger.debug({ deviceId: id }, 'Device deleted');
        return device;
    }

    static async turnOffPendingDevices() {
        logger.debug('Querying pending devices to turn off');
        const devices = await prisma.device.findMany({
            where: {
                turnOffAt: {
                    lte: new Date(),
                    not: null
                }
            }
        });

        logger.debug({ deviceCount: devices.length }, 'Found pending devices');

        if (devices.length > 0) {
            const result = await prisma.device.updateMany({
                where: {
                    turnOffAt: {
                        lte: new Date(),
                        not: null
                    }
                },
                data: {
                    turnOffAt: null
                }
            });
            logger.info({ updatedCount: result.count }, 'Updated devices turnOffAt to null');
        }

        return devices;
    }
}
