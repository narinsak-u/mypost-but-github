import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSavedTab from "../use-saved-tab";

describe("useSavedTab", () => {
  beforeEach(() => {
    useSavedTab.setState({ isSelected: false });
  });

  it("initializes with isSelected false", () => {
    const { result } = renderHook(() => useSavedTab());
    expect(result.current.isSelected).toBe(false);
  });

  it("sets isSelected to true on onSelect", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.onSelect();
    });

    expect(result.current.isSelected).toBe(true);
  });

  it("sets isSelected back to false on onCancel", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.onSelect();
    });
    act(() => {
      result.current.onCancel();
    });

    expect(result.current.isSelected).toBe(false);
  });

  it("toggles correctly in sequence", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => result.current.onSelect());
    expect(result.current.isSelected).toBe(true);

    act(() => result.current.onCancel());
    expect(result.current.isSelected).toBe(false);

    act(() => result.current.onSelect());
    expect(result.current.isSelected).toBe(true);
  });
});
