import {KeyCode} from './keycodes';
import {fromEvent, merge, combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, share, filter} from 'rxjs/operators';

const RATIO = 1.2;
const MOVERATIO = 0.8;
export const mappingKeyEvent = (key: string, base: number = 6) => {
  const _base = Math.sqrt(Math.sqrt(base));

  switch (key) {
    case 'Up':
    case 'ArrowUp':
      return {
        x: 0,
        y: -_base * RATIO,
      };
    case 'ArrowRight':
      return {
        x: _base * MOVERATIO,
        y: 0,
      };
    case 'ArrowLeft':
      return {
        x: -_base * MOVERATIO,
        y: 0,
      };
    default:
      return {
        x: 0,
        y: 0,
      };
  }
};

export const shortcut = (shortcut: KeyCode[]): Observable<KeyboardEvent[]> => {
  // Observables for all keydown and keyup events
  const keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown');
  const keyUp$ = fromEvent<KeyboardEvent>(document, 'keyup');

  // All KeyboardEvents - emitted only when KeyboardEvent changes (key or type)
  const keyEvents$ = merge(keyDown$, keyUp$).pipe(
    distinctUntilChanged((a: KeyboardEvent, b: KeyboardEvent) => a.code === b.code && a.type === b.type),
    share()
  );

  // Create KeyboardEvent Observable for specified KeyCode
  const createKeyPressStream = (charCode: KeyCode) =>
    keyEvents$.pipe(filter((event: KeyboardEvent) => event.code === charCode.valueOf()));

  // Create Event Stream for every KeyCode in shortcut
  const keyCodeEvents$ = shortcut.map((s) => createKeyPressStream(s));

  // Emit when specified keys are pressed (keydown).
  // Emit only when all specified keys are pressed at the same time.
  // More on combineLatest below
  return combineLatest(keyCodeEvents$).pipe(
    filter<KeyboardEvent[]>((arr) => arr.every((a) => a.type === 'keydown'))
  );
};
