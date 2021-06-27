import Tracking from './tracking';
import {IPropsElement} from '../app/interface';
import {rotateOriginXY} from '../app/utils';

figma.showUI(__html__, {width: 320, height: 100});

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
  if (msg.type === 'set-target-pos') {
    const target = figma.currentPage.selection[0];
    if (target && target.name === 'target') {
      const {pos} = msg;
      const {x, y} = pos;
      if (x && y) {
        // set camera
        if (Math.abs(target.x + target.width / 2 - x) + Math.abs(target.y + target.height / 2 - y) > 2) {
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
  if (target && target.name === 'target') {
    const getRatio = (target) =>
      (figma.viewport.bounds.width * figma.viewport.bounds.height) / (target.width * target.height);
    let ratioView = getRatio(target);
    let counter = 0;
    // recursive set zooming params, since hard to set it at once.
    while (Math.abs(ratioView - 100) > 5 && counter < 5) {
      counter += 1;
      let magicZoomInRation = 0;
      if (ratioView < 100) {
        magicZoomInRation = Math.sqrt(100 / ratioView) * -1;
      } else {
        magicZoomInRation = Math.sqrt(ratioView / 100) - 1;
      }
      figma.viewport.zoom = figma.viewport.zoom + magicZoomInRation;
      ratioView = getRatio(target);
    }
    figma.viewport.scrollAndZoomIntoView([target]);

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
    const allRect = target?.parent.findChildren(
      (element) => element.name.includes('rect') || element.name.includes('Rect')
    );
    const allRectElement = allRect.map(
      (rect: RectangleNode, id): IPropsElement => {
        const rectRotation = rect.rotation;
        rotateOriginXY([rect], -rectRotation, 0.5, 0.5, '%', '%');
        const rectData = {
          id: `rect-${id}`,
          data: {
            width: rect.width,
            height: rect.height,
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
            rotation: -rectRotation * (Math.PI / 180),
          },
        };
        rotateOriginXY([rect], rectRotation, 0.5, 0.5, '%', '%');
        return rectData;
      }
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
    return;
  }
  figma.ui.postMessage({
    type: 'remove-theme',
    message: [],
  });
});
