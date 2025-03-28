<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import xmark from "@/assets/xmark.svg?raw";
  import UiFloatingButton from "./UIFloatingButton.svelte";

  export let file: File;
  export let showRemoveButton = true;

  let url: string;
  let dispatch = createEventDispatcher();

  $: {
    try {
      url = URL.createObjectURL(file);
    } catch (error) {
      console.log(error);
    }
  }

  function removeFile(file: File) {
    dispatch("remove", { file });
  }
</script>

{#if url}
  <div class="preview-img relative">
    <img
      src={url}
      alt="Preview"
      class="w-24 min-w-24 h-24 min-h-24 object-contain"
      style="height: calc(5rem - 4px)"
      draggable="false"
    />
    {#if showRemoveButton}
      <UiFloatingButton
        title="Remove Image"
        class="btn-remove absolute -top-2 -right-2 z-10 !w-7 !h-7 scale-0 opacity-0"
        iconClass="relative left-[0.5px]"
        on:click={() => removeFile(file)}
      >
        {@html xmark}
      </UiFloatingButton>
    {/if}
  </div>
{/if}

<style>
  :global(.preview-img .btn-remove) {
    transform: scale(0);
    transition: transform 0.1s;
  }

  :global(.preview-img:hover .btn-remove) {
    opacity: 1;
    transform: scale(1);
  }

  :global(.isDragging .btn-remove) {
    display: none !important;
  }
</style>
