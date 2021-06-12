import * as React from 'react';
import Tracking from '../../plugin/tracking';
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

    return <div>hello world</div>;
};

export default App;
