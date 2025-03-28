<script lang="ts">
  import { isDownloadReady } from "@/store";
  import { scale } from "svelte/transition";
  import UiFileDrop from "./UIFileDrop.svelte";
  import { config } from "@/config";

  export let files: File[] = [];

  const duration = 200;

  let currentDragItemIdx: number;
  let currentHoverItemIdx: number;

  let isDragging = false;
  let dropped = false;

  let filesCurrentState = [...files];
  $: filesWhileSort = [...files];

  function onDragStart(event: DragEvent, file: File) {
    isDragging = true;
    (event.target as HTMLElement)?.classList.add("dragging");

    currentDragItemIdx = files.findIndex((f) => f === file);
    filesCurrentState = [...files];
  }

  function onDragOver(event: DragEvent, file: File) {
    event.preventDefault();

    // prevent dragover from other drag events
    if (!isDragging) return;

    const idx = files.findIndex((f) => f === file);

    if (idx === currentDragItemIdx || idx === currentHoverItemIdx) {
      return;
    }

    currentHoverItemIdx = idx;

    files = filesWhileSort.map((f, i) => {
      if (i === currentDragItemIdx) {
        return filesWhileSort[currentHoverItemIdx];
      }

      if (i === currentHoverItemIdx) {
        return filesWhileSort[currentDragItemIdx];
      }

      return f;
    });

    currentDragItemIdx = currentHoverItemIdx;
  }

  function onDrop(event: DragEvent, file: File) {
    dropped = true;
    $isDownloadReady = false;
  }

  function onDragEnd(event: DragEvent, file: File) {
    (event.target as HTMLElement)?.classList.remove("dragging");
    currentDragItemIdx = -1;
    currentHoverItemIdx = -1;

    // revert if not dropped
    if (!dropped) {
      files = [...filesCurrentState];
    }

    dropped = false;
    isDragging = false;
  }
</script>

<div class="w-full h-max py-2" class:isDragging>
  <div
    class="file-list theme-border-color-50 w-full min-w-full p-4 rounded-lg border flex justify-center items-center min-h-48 overflow-auto"
  >
    {#if files.length <= 0}
      <slot name="empty" />
    {:else}
      <ol class="flex flex-wrap">
        {#each Array.from(files) as file (file?.name)}
          <li
            on:dragstart={(e) => onDragStart(e, file)}
            on:dragover={(e) => onDragOver(e, file)}
            on:dragend={(e) => onDragEnd(e, file)}
            on:drop={(e) => onDrop(e, file)}
            in:scale|local={{ duration }}
            class="bg-neutral-300 bg-opacity-10 odd:bg-opacity-20 hover:bg-neutral-500 theme-border-color-50 border-l border-r first:border-l-0 hover:cursor-move"
            draggable="true"
          >
            <slot {file} />
          </li>
        {/each}
        {#if files.length > 0}
          <li class="w-24 p-3">
            <UiFileDrop
              bind:files
              multiple
              label="+"
              maxFileSizeMb={config.maxFileSizeMb}
              accept={config.allowedFormats}
              reduced
            />
          </li>
        {/if}
      </ol>
    {/if}
  </div>
</div>

<style>
  :global(li img) {
    transition:
      0.2s transform ease-out,
      0.2s opacity ease-out;
  }

  :global(.dragging img) {
    transform: scale(1) !important;
  }

  :global(.dragging button) {
    opacity: 0;
  }

  :global(.isDragging img) {
    opacity: 0.7;
    transform: scale(0.8);
  }
</style>
