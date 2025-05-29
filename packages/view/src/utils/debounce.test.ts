import { debounce } from "./debounce";

jest.useFakeTimers();

describe("debounce", () => {
  it("check debounce", () => {
    const mockFn = jest.fn();
    const debouncedFunc = debounce(mockFn, 1000);

    debouncedFunc("test1");
    debouncedFunc("test2");

    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(999);
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith("test2");
  });

  it("check default delay", () => {
    const mockFn = jest.fn();
    const debouncedFunc = debounce(mockFn);

    debouncedFunc("test");

    jest.advanceTimersByTime(999);
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
