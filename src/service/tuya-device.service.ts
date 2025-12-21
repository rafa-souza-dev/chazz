import "dotenv/config";
import { TuyaContext } from '@tuya/tuya-connector-nodejs';

const tuya = new TuyaContext({
    baseUrl: process.env.TUYA_BASE_URL || 'https://openapi.tuyaus.com',
    accessKey: process.env.TUYA_ACCESS_KEY as string,
    secretKey: process.env.TUYA_SECRET_KEY as string,
});

export class TuyaDeviceService {
    private static async sendCommand(
        deviceExternalId: string,
        value: boolean,
    ) {
        return tuya.request({
            method: 'POST',
            path: `/v1.0/iot-03/devices/${deviceExternalId}/commands`,
            body: {
                commands: [
                    {
                        code: 'switch_1',
                        value,
                    },
                ],
            },
        });
    }

    static async turnOn(deviceExternalId: string) {
        return this.sendCommand(deviceExternalId, true);
    }

    static async turnOff(deviceExternalId: string) {
        return this.sendCommand(deviceExternalId, false);
    }
}
