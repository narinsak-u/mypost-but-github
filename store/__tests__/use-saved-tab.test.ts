import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useSavedTab from "../use-saved-tab";

describe("useSavedTab", () => {
  it("initializes with tab 'For You'", () => {
    const { result } = renderHook(() => useSavedTab());
    expect(result.current.tab).toBe("For You");
  });

  it("sets tab to 'Following' via setTab", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.setTab("Following");
    });

    expect(result.current.tab).toBe("Following");
  });

  it("sets tab to 'Starred' via setTab", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.setTab("Starred");
    });

    expect(result.current.tab).toBe("Starred");
  });

  it("changes tab correctly in sequence", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => result.current.setTab("Following"));
    expect(result.current.tab).toBe("Following");

    act(() => result.current.setTab("Starred"));
    expect(result.current.tab).toBe("Starred");

    act(() => result.current.setTab("For You"));
    expect(result.current.tab).toBe("For You");
  });
});
