<script lang="ts">
  import { isConverting } from "@/store";
  import UiHeading from "./ui/UIHeading.svelte";
  import UiInputGroup from "./ui/UIInputGroup.svelte";
  import type { SettingOption } from "@/config";
  import { createEventDispatcher } from "svelte";
  import type { UIInputItem } from "@/types/UIInputItem";

  export let id: string = "";
  export let label: string = "";
  export let options: SettingOption[] = [];
  export let selected: SettingOption | null = null;
  export let level: number = 3;

  let lastSelected: UIInputItem | null = null;
  const emits = createEventDispatcher();

  $: if (id && selected && selected.id !== lastSelected?.id) {
    lastSelected = selected;
    emits("update:selected", { id, selected });
  }

  $: if (
    selected &&
    selected.isInput &&
    selected.value !== lastSelected?.value
  ) {
    lastSelected = selected;

    options = options.map((option) =>
      option.id === selected?.id ? selected : option,
    );

    emits("update:selected", { id, selected });
  }
</script>

<form aria-labelledby={id} on:submit|preventDefault>
  <slot name="heading">
    <UiHeading {id} {level}>{label}</UiHeading>
  </slot>
  <div class="mt-4 flex flex-wrap justify-center gap-x-2 gap-y-3">
    <slot name="before" />
    <UiInputGroup
      items={options}
      bind:selected
      on:remove
      disabled={$isConverting}
    />
    <slot name="after" />
  </div>
</form>
