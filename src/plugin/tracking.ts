import {UAParser} from 'ua-parser-js';

class Tracking {
    root: string;
    apiKey: string;
    userId: string;
    userProps = {};
    UUID: string;
    UA: UAParser.IResult;
    parser = new UAParser();
    constructor() {
        this.root = 'https://api.amplitude.com/httpapi';
        this.apiKey = '';
        this.userId = '';
        this.userProps = {};
        this.UUID = '';
        // this.UA = {};
        this.parser = new UAParser();
    }

    createUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    setup(apiKey: string, UUID: string) {
        // if (true) return console.log(this, UUID, apiKey || {});
        this.apiKey = apiKey;
        this.UUID = UUID;
        this.UA = this.parser.getResult();
    }

    track(event: string, props?) {
        let evtObj = {
            user_id: this.userId,
            device_id: this.UUID,
            event_type: event,
            os_name: this.UA?.os?.name,
            os_version: this.UA?.os?.version,
            platform: `${this.UA?.browser?.name} ${this.UA?.browser?.major}`,
            language: navigator.language,
            user_properties: this.userProps,
            event_properties: props,
            time: Math.floor(Date.now()),
        };

        var data = new FormData();
        data.append('api_key', this.apiKey);
        data.append('event', JSON.stringify(evtObj));
        // if (true) return console.log(this, event, props, data || {});
        fetch(this.root, {
            method: 'POST',
            body: data,
        });
    }
}

export default new Tracking();
