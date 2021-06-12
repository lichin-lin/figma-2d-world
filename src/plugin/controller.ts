import Tracking from './tracking';
figma.showUI(__html__, {width: 300, height: 150});
interface IPropsElementData {
    width: number;
    height: number;
    x: number;
    y: number;
}
const UNIT = 20;
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

const mappingKeyEvent = (key: string) => {
    switch (key) {
        case 'ArrowRight':
            return {
                x: UNIT,
                y: 0,
            };
        case 'ArrowLeft':
            return {
                x: -UNIT,
                y: 0,
            };
        case 'ArrowUp':
            return {
                x: 0,
                y: -UNIT,
            };
        case 'ArrowDown':
            return {
                x: 0,
                y: UNIT,
            };
        default:
            return {
                x: 0,
                y: 0,
            };
    }
};

figma.ui.onmessage = (msg) => {
    if (msg.type === 'resize') {
        figma.ui.resize(msg.size.w, msg.size.h);
    }
    if (msg.type === 'enter-key') {
        const {key} = msg;
        const movement = mappingKeyEvent(key);
        const target = figma.currentPage.selection[0];
        target.x += movement.x;
        target.y += movement.y;
        // figma.currentPage.selection = nodes;
        // figma.viewport.scrollAndZoomIntoView(nodes);
        // This is how figma responds back to the ui
        // figma.ui.postMessage({
        //     type: 'create-rectangles',
        //     message: `Created ${msg.count} Rectangles`,
        // });
    }
};

figma.on('selectionchange', async () => {
    const target = figma.currentPage.selection[0];
    if (target && target?.parent?.name === 'Theme') {
        // setup the game
        console.log('init game...');

        // Theme
        const theme = target?.parent as FrameNode;
        const themeSize: IPropsElementData = {
            width: theme.width,
            height: theme.height,
            x: theme.x,
            y: theme.y,
        };
        // Rect
        const allRect = target?.parent.findAll((element) => element.name === 'rect');
        const allRectSize = allRect.map(
            (rect: RectangleNode): IPropsElementData => ({
                width: rect.width,
                height: rect.height,
                x: rect.x,
                y: rect.y,
            })
        );

        // Target
        const targetSize: IPropsElementData = {
            width: target.width,
            height: target.height,
            x: target.x,
            y: target.y,
        };
        console.log(themeSize, allRectSize, targetSize);
    }
});
