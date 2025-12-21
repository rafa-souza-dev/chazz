export class DeviceNotFoundError extends Error {
    constructor(deviceId: number) {
        super(`Device with id "${deviceId}" was not found`)
        this.name = 'DeviceNotFoundError'
    }
}
