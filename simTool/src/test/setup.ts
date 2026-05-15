import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

Object.defineProperty(HTMLElement.prototype, "clientWidth", {
  configurable: true,
  value: 800
});

Object.defineProperty(HTMLElement.prototype, "clientHeight", {
  configurable: true,
  value: 320
});
