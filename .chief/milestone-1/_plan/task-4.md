# Task 4: Write Unit Tests for Utils and Stores

## Goal Reference

- `unit-test-coverage.md` - Utils and stores tested

## Contract Reference

- `unit-test-spec.md` - Test scenarios for utils and stores

## Work Description

### Create Test Directory Structure

```
lib/__tests__/
store/__tests__/
```

### Tests for `lib/utils.ts`

#### `lib/__tests__/utils.test.ts`

Test the `cn()` function:

```typescript
import { cn } from "../utils";

describe("cn", () => {
  it("merges two classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles array of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
```

### Tests for Zustand Stores

#### `store/__tests__/use-saved-tab.test.ts`

```typescript
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

  it("toggles to true on onSelect", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.onSelect();
    });

    expect(result.current.isSelected).toBe(true);
  });

  it("toggles to false on onCancel", () => {
    const { result } = renderHook(() => useSavedTab());

    act(() => {
      result.current.onSelect();
    });

    act(() => {
      result.current.onCancel();
    });

    expect(result.current.isSelected).toBe(false);
  });
});
```

#### `store/__tests__/use-post-modal.test.ts`

```typescript
import { renderHook, act } from "@testing-library/react";
import usePostModal from "../use-post-modal";

describe("usePostModal", () => {
  beforeEach(() => {
    usePostModal.setState({ isOpen: false });
  });

  it("initializes with isOpen false", () => {
    const { result } = renderHook(() => usePostModal());
    expect(result.current.isOpen).toBe(false);
  });

  it("opens modal on onOpen", () => {
    const { result } = renderHook(() => usePostModal());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("closes modal on onClose", () => {
    const { result } = renderHook(() => usePostModal());

    act(() => {
      result.current.onOpen();
    });

    act(() => {
      result.current.onClose();
    });

    expect(result.current.isOpen).toBe(false);
  });
});
```

#### `store/__tests__/use-option-modal.test.ts`

Same pattern as above - test open/close functionality.

## Acceptance Criteria

- [ ] `lib/__tests__/utils.test.ts` created and passing
- [ ] 3 store test files created in `store/__tests__/`
- [ ] Each store has at least 3 test cases
- [ ] All tests pass (`npm run test:unit`)
