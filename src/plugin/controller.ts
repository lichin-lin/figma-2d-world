import Tracking from './tracking';
figma.showUI(__html__);

// init: Setting tracking info / fetch storage
const USER_DATA_ENDPOINT = 'user_data';
figma.clientStorage.getAsync(USER_DATA_ENDPOINT).then((data) => {
    if (!data || !data?.UUID) {
        const _data = {
            UUID: Tracking.createUUID(),
        };
        figma.clientStorage.setAsync(USER_DATA_ENDPOINT, _data);
        figma.ui.postMessage({
            type: 'track-init-without-data',
            message: _data,
        });
        return;
    } else {
        figma.ui.postMessage({
            type: 'track-init-with-data',
            message: data,
        });
        return;
    }
});

figma.ui.onmessage = (msg) => {
    if (msg.type === 'create-rectangles') {
        const nodes = [];

        for (let i = 0; i < msg.count; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        // This is how figma responds back to the ui
        figma.ui.postMessage({
            type: 'create-rectangles',
            message: `Created ${msg.count} Rectangles`,
        });
    }

    figma.closePlugin();
};
