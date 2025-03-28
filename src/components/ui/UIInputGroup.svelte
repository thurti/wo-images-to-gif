<script lang="ts">
  import type { UIInputItem } from "@/types/UIInputItem";
  import UiButton from "./UIButton.svelte";
  import xmark from "@/assets/xmark.svg?raw";
  import UiFloatingButton from "./UIFloatingButton.svelte";
  import { createEventDispatcher, tick } from "svelte";

  export let items: UIInputItem[] = [];
  export let selected: UIInputItem | null = null;
  export let disabled: boolean = false;

  $: isSelected = (item: UIInputItem) => selected?.id === item.id;
  const emit = createEventDispatcher();

  async function onSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    selected = items.find((i) => i.id === target.id) ?? null;

    if (selected?.isInput) {
      await tick();
      document.getElementById(`${selected?.id}_input`)?.focus();
    }
  }

  function onCustomInput(e: Event) {
    if (!selected) return;

    const target = e.target as HTMLInputElement;
    selected = { ...selected, value: target.value };
  }

  function onClickRemove(item: UIInputItem) {
    emit("remove", item);
  }
</script>

{#each items as item}
  <UiButton
    as="label"
    labelFor={item.id}
    title={item.label}
    outline={!isSelected(item)}
    small={true}
    {disabled}
    class="relative {item.isRemovable && 'flex gap-2 !pr-8'}"
  >
    {item.label}

    <input
      id={item.id}
      class="absolute opacity-0 hover:cursor-pointer"
      type="radio"
      on:click={onSelect}
      checked={item.id === selected?.id}
      value={item.value}
      {disabled}
    />

    {#if item.isRemovable}
      <UiFloatingButton
        title="Remove"
        on:click={() => onClickRemove(item)}
        class="!w-6 !h-6 absolute right-0.5 top-[1px] opacity-70 hover:opacity-100 border-none"
        iconClass="relative left-[0.5px]"
      >
        {@html xmark}
      </UiFloatingButton>
    {/if}
  </UiButton>

  {#if item.isInput && isSelected(item)}
    <input
      id={`${item.id}_input`}
      type={item.type ?? "text"}
      on:input={onCustomInput}
      value={selected?.value ?? ""}
      {disabled}
      class="w-16 text-center text-sm rounded-lg border theme-border-color-50 bg-white bg-opacity-10 px-2 py-1 placeholder:text-opacity-70 focus:bg-neutral-100 focus:bg-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
    />
  {/if}
{/each}
