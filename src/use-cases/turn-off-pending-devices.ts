import { DeviceRepository } from "../repository/DeviceRepository";

export class TurnOffPendingDevices {
    static async handle() {
        await DeviceRepository.turnOffPendingDevices();
    }
}
