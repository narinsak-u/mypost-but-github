import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NewTag from "@/components/new-tag";
import { TagOptions } from "@/data/tags";

describe("NewTag Component", () => {
  it("should render '+ Tag' when no tag is selected", () => {
    const setSelectedtag = vi.fn();
    render(<NewTag selectedTag={null} setSelectedtag={setSelectedtag} />);
    
    expect(screen.getByText("+ Tag")).toBeDefined();
  });

  it("should render the label of the selected tag", () => {
    const setSelectedtag = vi.fn();
    const mockTag = TagOptions[0];
    render(<NewTag selectedTag={mockTag} setSelectedtag={setSelectedtag} />);
    
    expect(screen.getByText(mockTag.label)).toBeDefined();
    expect(screen.queryByText("+ Tag")).toBeNull();
  });

  it("should call setSelectedtag when a tag is selected from the menu", async () => {
    const setSelectedtag = vi.fn();
    render(<NewTag selectedTag={null} setSelectedtag={setSelectedtag} />);
    
    // Click to open popover
    const button = screen.getByText("+ Tag");
    fireEvent.click(button);

    // Find a tag in the popover and click it
    // Note: Radix Popover might render in a portal, so we might need to search globally
    // But JSDOM should handle it if the portal is in the same document.body
    const firstTagLabel = TagOptions[0].label;
    const tagOption = await screen.findByText(firstTagLabel);
    fireEvent.click(tagOption);

    expect(setSelectedtag).toHaveBeenCalledWith(TagOptions[0]);
  });
});
