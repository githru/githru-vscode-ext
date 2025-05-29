import { throttle } from "./throttle";

jest.useFakeTimers();

describe("throttle", () => {
  it("check throttle", () => {
    const mockFn = jest.fn();
    const throttledFunc = throttle(mockFn, 1000);

    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFunc();
    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(999);
    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("check default delay", () => {
    const mockFn = jest.fn();
    const throttledFunc = throttle(mockFn);

    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFunc();
    jest.advanceTimersByTime(999);
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1);
    throttledFunc();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
