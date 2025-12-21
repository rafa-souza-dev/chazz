import { DeviceUpdateInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";

export class DeviceRepository {
    static async updateDevice(id: number, data: DeviceUpdateInput) {
        return await prisma.device.update({
            where: {
                id
            },
            data
        })
    }

    static listDevicesToTurnOff() {
        return prisma.device.findMany({
            where: {
                turnOffAt: {
                    lte: new Date(),
                    not: null
                }
            }
        })
    }
}
