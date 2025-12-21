import { DeviceRepository } from "../repository/DeviceRepository";
import { TuyaDeviceService } from "../service/tuya-device.service";

export class TurnOffPendingDevices {
    static async handle() {
        const devices = await DeviceRepository.turnOffPendingDevices();
        await Promise.all(
            devices.map(device => TuyaDeviceService.turnOff(device.externalId))
        );
    }
}
