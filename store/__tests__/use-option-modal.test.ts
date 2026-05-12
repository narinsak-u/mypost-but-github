import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useOptionModal from "../use-option-modal";

describe("useOptionModal", () => {
  beforeEach(() => {
    useOptionModal.setState({ isOpen: false });
  });

  it("initializes with isOpen false", () => {
    const { result } = renderHook(() => useOptionModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("opens modal on onOpen", () => {
    const { result } = renderHook(() => useOptionModal());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("closes modal on onClose", () => {
    const { result } = renderHook(() => useOptionModal());

    act(() => result.current.onOpen());
    act(() => result.current.onClose());

    expect(result.current.isOpen).toBe(false);
  });

  it("toggles correctly in sequence", () => {
    const { result } = renderHook(() => useOptionModal());

    act(() => result.current.onOpen());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.onClose());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.onOpen());
    expect(result.current.isOpen).toBe(true);
  });
});
