import {mappingKeyEvent} from '../utils';
import Tracking from './tracking';

figma.showUI(__html__, {width: 300, height: 150});

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
  if (msg.type === 'resize') {
    figma.ui.resize(msg.size.w, msg.size.h);
  }
  if (msg.type === 'enter-key') {
    const {key} = msg;
    const movement = mappingKeyEvent(key);
    const target = figma.currentPage.selection[0];
    target.x += movement.x;
    target.y += movement.y;
  } else if (msg.type === 'set-target-pos') {
    const {pos} = msg;
    const target = figma.currentPage.selection[0];
    if (target) {
      const {x, y} = pos;
      if (x && y) {
        target.x = pos?.x - target.width / 2;
        target.y = pos?.y - target.height / 2;
      }
    }
  }
};

figma.on('selectionchange', async () => {
  const target = figma.currentPage.selection[0];
  if (target && target?.parent?.name === 'Theme') {
    // setup the game
    console.log('init game...');

    // Theme
    const theme = target?.parent as FrameNode;
    const themeElement: IPropsElement = {
      id: 'theme',
      data: {
        width: theme.width,
        height: theme.height,
        x: theme.x + theme.width / 2,
        y: theme.y + theme.height / 2,
      },
    };
    // Rect
    const allRect = target?.parent.findAll((element) => element.name === 'rect');
    const allRectElement = allRect.map(
      (rect: RectangleNode, id): IPropsElement => ({
        id: `rect-${id}`,
        data: {
          width: rect.width,
          height: rect.height,
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
        },
      })
    );

    // Target
    const targetElement: IPropsElement = {
      id: 'target',
      data: {
        width: target.width,
        height: target.height,
        x: target.x + target.width / 2,
        y: target.y + target.height / 2,
      },
    };
    figma.ui.postMessage({
      type: 'init-theme',
      message: [themeElement, targetElement, ...allRectElement],
    });
  }
});
