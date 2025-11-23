import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSelection } from "../useSelection";

describe("useSelection", () => {
  it("should initialize with empty array by default", () => {
    const { result } = renderHook(() => useSelection<string>());

    expect(result.current.selected).toEqual([]);
  });

  it("should initialize with provided initial value", () => {
    const { result } = renderHook(() => useSelection<string>(["item1"]));

    expect(result.current.selected).toEqual(["item1"]);
  });

  it("should toggle item selection", () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.toggle("item1");
    });

    expect(result.current.selected).toEqual(["item1"]);

    act(() => {
      result.current.toggle("item1");
    });

    expect(result.current.selected).toEqual([]);
  });

  it("should add multiple items", () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.toggle("item1");
      result.current.toggle("item2");
    });

    expect(result.current.selected).toEqual(["item1", "item2"]);
  });

  it("should reset selection", () => {
    const { result } = renderHook(() => useSelection<string>(["item1", "item2"]));

    expect(result.current.selected).toEqual(["item1", "item2"]);

    act(() => {
      result.current.reset();
    });

    expect(result.current.selected).toEqual([]);
  });

  it("should set selection directly", () => {
    const { result } = renderHook(() => useSelection<string>());

    act(() => {
      result.current.setSelected(["item1", "item2", "item3"]);
    });

    expect(result.current.selected).toEqual(["item1", "item2", "item3"]);
  });
});

