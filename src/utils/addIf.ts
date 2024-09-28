export const addIf = <T>(condition: boolean, item: T) => {
  return condition ? [item] : [];
};
