import "dotenv/config";
import { TuyaContext } from '@tuya/tuya-connector-nodejs';

const tuya = new TuyaContext({
    baseUrl: 'https://openapi.tuyacn.com',
    accessKey: process.env.TUYA_ACCESS_KEY as string,
    secretKey: process.env.TUYA_SECRET_KEY as string,
});

export class TuyaDeviceService {
    static async turnOff(deviceExternalId: string) {
        return await tuya.device.changeFreezeState({
            device_id: deviceExternalId,
            state: 0
        });
    }

    static async turnOn(deviceExternalId: string) {
        return await tuya.device.changeFreezeState({
            device_id: deviceExternalId,
            state: 1
        });
    }
}
