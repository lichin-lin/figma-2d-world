import * as React from 'react';

const Resizer = ({}) => {
    // https://gist.github.com/sonnylazuardi/e55300f28fbe109db052f6568fee5a04
    const resizeWindow = (e) => {
        const size = {
            w: Math.max(50, Math.floor(e.clientX + 5)),
            h: Math.max(50, Math.floor(e.clientY + 5)),
        };
        parent.postMessage({pluginMessage: {type: 'resize', size: size}}, '*');
    };
    React.useEffect(() => {
        const corner = document.getElementById('cornerRef');
        corner.onpointerdown = (e) => {
            corner.onpointermove = resizeWindow;
            corner.setPointerCapture(e.pointerId);
        };
        corner.onpointerup = (e) => {
            corner.onpointermove = null;
            corner.releasePointerCapture(e.pointerId);
        };
    }, []);
    return (
        <div
            id="cornerRef"
            className="absolute w-6 h-6 right-1 bottom-1 p-1 hover:bg-gray-100"
            style={{
                cursor: 'nwse-resize',
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
            </svg>
        </div>
    );
};

export default Resizer;
