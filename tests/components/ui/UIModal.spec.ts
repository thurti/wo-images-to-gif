import "@testing-library/jest-dom";
import { render, cleanup, screen, fireEvent } from "@testing-library/svelte";
import { html } from "@playpilot/svelte-htm";
import UIModal from "@/components/ui/UIModal.svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";

describe("UIModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const user = userEvent.setup();

  it("should render correctly", async () => {
    render(html`<${UIModal} open>My Content</${UIModal}>`);
    expect(screen.getByTitle("Close")).toBeInTheDocument();
    expect(screen.getByText("My Content")).toBeInTheDocument();
  });

  it("should close dialog on click", async () => {
    const spyClose = vi.spyOn(HTMLDialogElement.prototype, "close");
    render(html`<${UIModal} open>My Content</${UIModal}>`);

    await user.click(screen.getByTitle("Close"));
    expect(spyClose).toHaveBeenCalled();
  });

  it("should close on destroy", async () => {
    const spyClose = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { unmount } = render(html`<${UIModal} open>My Content</${UIModal}>`);

    unmount();
    expect(spyClose).toHaveBeenCalled();
  });
});
