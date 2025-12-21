import { DeviceNotFoundError } from "../errors/DeviceNotFoundError";
import { DeviceRepository } from "../repository/DeviceRepository";
import { TuyaDeviceService } from "../service/tuya-device.service";

type RescheduleDeviceTurnOffParams = {
    deviceId: number;
    paidCents: number;
}

export class RescheduleDeviceTurnOff {
    static async handle({ deviceId, paidCents }: RescheduleDeviceTurnOffParams) {
        const device = await DeviceRepository.findDevice(deviceId);

        if (!device) {
            throw new DeviceNotFoundError(deviceId);
        }

        if (paidCents < device.centsPerCycle) {
            return;
        }

        const turnOffAt = device.turnOffAt ?? new Date();
        const rescheduledTurnOffAt = new Date(
            turnOffAt.getTime() + (device.secondsPerCycle * 1000)
        );

        await TuyaDeviceService.turnOn(device.externalId);
        await DeviceRepository.updateDevice(device.id, { turnOffAt: rescheduledTurnOffAt });
    }
}
