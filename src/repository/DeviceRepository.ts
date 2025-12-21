import { DeviceUpdateInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";

export class DeviceRepository {
    static async findDevice(id: number) {
        return await prisma.device.findUnique({
            where: {
                id
            },
        })
    }

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
