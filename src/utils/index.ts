const UNIT = 5;
export const mappingKeyEvent = (key: string) => {
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
