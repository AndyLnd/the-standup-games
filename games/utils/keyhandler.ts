export function createKeyHandler() {
  const keyMap = new Set<string>();
  const funcMap = new Map<string, () => void>();
  const triggerMap = new Map<string, () => void>();

  const { signal, abort } = new AbortController();

  document.addEventListener(
    "keydown",
    ({ code }) => {
      triggerMap.get(code)?.();
      keyMap.add(code);
    },
    { signal }
  );

  document.addEventListener("keyup", ({ code }) => keyMap.delete(code), {
    signal,
  });

  return {
    addFunction: (keys: string | string[], keyFunction: () => void) =>
      [keys].flat().forEach((code) => funcMap.set(code, keyFunction)),

    clearKey: (keys: string | string[]) =>
      [keys].flat().forEach((code) => {
        triggerMap.delete(code);
        funcMap.delete(code);
      }),

    addTrigger: (keys: string | string[], keyFunction: () => void) =>
      [keys].flat().forEach((key) => triggerMap.set(key, keyFunction)),

    poll: () => keyMap.forEach((code) => funcMap.get(code)?.()),

    remove: abort,
  };
}
