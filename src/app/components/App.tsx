import * as React from 'react';
import Tracking from '../../plugin/tracking';
import Resizer from './Resizer';
import {fromEvent} from 'rxjs';
import {throttleTime} from 'rxjs/operators';

require('dotenv').config();
declare function require(path: string): any;

const App = ({}) => {
    React.useEffect(() => {
        window.onmessage = (event) => {
            const {type, message} = event.data.pluginMessage;
            if (type === 'track-init-with-data') {
                Tracking.setup(process.env.AMP_KEY, message.UUID);
                Tracking.track('[Open] with data');
            } else if (type === 'track-init-without-data') {
                Tracking.setup(process.env.AMP_KEY, message.UUID);
                Tracking.track('[Open] without data');
            }
        };
    }, []);
    React.useEffect(() => {
        var keyDowns = fromEvent(document, 'keydown');
        keyDowns.pipe(throttleTime(100)).subscribe((value: KeyboardEvent) => {
            parent.postMessage({pluginMessage: {type: 'enter-key', key: value.key}}, '*');
        });
    }, []);
    return <Resizer />;
};

export default App;
