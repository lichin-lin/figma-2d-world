import * as React from 'react';
import Tracking from '../../plugin/tracking';
import Resizer from './Resizer';
import {KeyCode} from './../../utils/keycodes';
import {fromEvent} from 'rxjs';
import {throttleTime, tap, filter, merge, distinctUntilChanged, debounceTime} from 'rxjs/operators';
import {shortcut} from './../../utils/index';
import {mappingKeyEvent} from './../../utils/index';

import Matter from 'matter-js';
import {IPropsElement} from '../interface';

require('dotenv').config();
declare function require(path: string): any;
let Engine = Matter.Engine;
let Render = Matter.Render;
let Body = Matter.Body;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Composite = Matter.Composite;
let MouseConstraint = Matter.MouseConstraint;
let Mouse = Matter.Mouse;

// TODO: rxjs -> key event non block
// TODO: Hide the canvas, show clock
// TODO: multiplayer timer

const App = ({}) => {
  const boxRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [targetState, setTargetState] = React.useState(null);

  const setupTheme = (elements: IPropsElement[]) => {
    let engine = Engine.create({});

    const themeElement = elements.find((e) => e.id === 'theme');
    let render = Render.create({
      element: boxRef.current,
      engine: engine,
      canvas: canvasRef.current,
      options: {
        width: themeElement.data.width || 300,
        height: themeElement.data.height || 300,
        background: '#50514F',
        wireframes: false,
      },
    });

    const floor = Bodies.rectangle(themeElement.data.width / 2, themeElement.data.height, themeElement.data.width, 10, {
      isStatic: true,
      render: {
        fillStyle: '#dcdcdc',
      },
    });

    const rectElement = elements.filter((e) => e.id.includes('rect'));
    const rectList = [];

    rectElement.forEach((rect) => {
      let body = Bodies.rectangle(rect.data.x, rect.data.y, rect.data.width, rect.data.height, {
        isStatic: true,
        render: {
          fillStyle: '#dcdcdc',
        },
      });
      rectList.push(body);
    });
    const targetElement = elements.find((e) => e.id === 'target');
    const target = Bodies.rectangle(
      targetElement.data.x,
      targetElement.data.y,
      targetElement.data.width,
      targetElement.data.height,
      {
        restitution: 0,
        render: {
          fillStyle: 'tomato',
        },
      }
    );

    setTargetState(target);
    World.add(engine.world, [floor, target]);
    Engine.run(engine);
    Render.run(render);

    let mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false,
          },
        },
      });
    Composite.add(engine.world, rectList);
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;
  };
  React.useEffect(() => {
    window.onmessage = (event) => {
      const {type, message} = event.data.pluginMessage;
      if (type === 'track-init-with-data') {
        Tracking.setup(process.env.AMP_KEY, message.UUID);
        Tracking.track('[Open] with data');
      } else if (type === 'track-init-without-data') {
        Tracking.setup(process.env.AMP_KEY, message.UUID);
        Tracking.track('[Open] without data');
      } else if (type === 'init-theme') {
        setTargetState(null);
        setupTheme(message);
      }
    };
  }, []);
  React.useEffect(() => {
    const setPosSyncInterval = setInterval(() => {
      parent.postMessage(
        {pluginMessage: {type: 'set-target-pos', pos: {x: targetState?.position?.x, y: targetState?.position?.y}}},
        '*'
      );
    }, 1000 / 60);
    return () => {
      clearInterval(setPosSyncInterval);
    };
  }, [targetState]);
  React.useEffect(() => {
    const keyDowns$ = fromEvent(document, 'keydown').subscribe((value: KeyboardEvent) => {
      if (value.key === 'ArrowLeft' || value.key === 'ArrowRight') {
        const _velocity = {
          x: mappingKeyEvent(value.key)?.x,
          y: mappingKeyEvent(value.key)?.y,
        };
        Body.setVelocity(targetState, _velocity);
      }
    });
    const jump$ = fromEvent(document, 'keydown')
      .pipe(throttleTime(700))
      .subscribe((value: KeyboardEvent) => {
        if (value.key === 'x') {
          const _velocity = {
            x: targetState?.velocity?.x + mappingKeyEvent('Up')?.x,
            y: targetState?.velocity?.y + mappingKeyEvent('Up')?.y,
          };
          Body.setVelocity(targetState, _velocity);
        }
      });
    return () => {
      keyDowns$.unsubscribe();
      jump$.unsubscribe();
    };
  }, [targetState]);
  return (
    <React.Fragment>
      <div
        ref={boxRef}
        style={{
          width: 300,
          height: 300,
        }}
      >
        <canvas ref={canvasRef} />
      </div>
      <Resizer />
    </React.Fragment>
  );
};

export default App;
