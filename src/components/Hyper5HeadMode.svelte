<script lang="ts">
  import { logger, selectedFormat, selectedSettings } from "@/store";
  import UiDetails from "./ui/UIDetails.svelte";
  import UiTextOutput from "./ui/UITextOutput.svelte";
  import UiHeading from "./ui/UIHeading.svelte";
  import CurrentCommand from "./CurrentCommand.svelte";

  export let open: boolean = false;
</script>

<UiDetails {open}>
  <slot slot="summary">
    <UiHeading level={4} class="inline-block">Expert Stuff</UiHeading>
  </slot>
  <slot slot="details">
    <div
      class="theme-border-color-50 flow rounded-lg border p-4 md:p-8"
      style="background: var(--theme-bg-light-color);"
    >
      <CurrentCommand
        label="Current Command:"
        format={$selectedFormat}
        settings={$selectedSettings}
      />
      <UiTextOutput label="FFmpeg Output" value={$logger} rows={10} />
    </div>
  </slot>
</UiDetails>
