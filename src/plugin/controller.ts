import {mappingKeyEvent} from '../utils';
import Tracking from './tracking';
import {IPropsElement} from '../app/interface';

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
    const target = figma.currentPage.selection[0];
    if (target) {
      const {pos} = msg;
      const {x, y} = pos;
      if (x && y) {
        // set camera
        if (Math.abs(target.x + target.width / 2 - x) + Math.abs(target.y + target.height / 2 - y) > 1) {
          figma.viewport.scrollAndZoomIntoView([target]);
        }
        target.x = Math.floor(x - target.width / 2);
        target.y = Math.floor(y - target.height / 2);
      }
    }
  }
};

figma.on('selectionchange', async () => {
  const target = figma.currentPage.selection[0];
  if (target) {
    figma.viewport.scrollAndZoomIntoView([target]);
    const ratioView = (figma.viewport.bounds.width * figma.viewport.bounds.height) / (target.width * target.height);
    if (Math.abs(ratioView - 100) > 5) {
      const magicZoomInRation = ratioView / 100 - 1;
      figma.viewport.zoom = figma.viewport.zoom + magicZoomInRation;
    }
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
