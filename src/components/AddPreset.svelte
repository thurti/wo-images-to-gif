<script lang="ts" context="module">
  const showAddPresetModal = writable(false);
  const isEditing = writable(false);

  export function openAddPresetModal(edit = false) {
    showAddPresetModal.set(true);
    isEditing.set(edit);
  }
</script>

<script lang="ts">
  import { customPresets, selectedFormat, selectedSettings } from "@/store";
  import UiButton from "./ui/UIButton.svelte";
  import UiInputText from "./ui/UIInputText.svelte";
  import UiModal from "./ui/UIModal.svelte";
  import { config, type FormatOption } from "@/config";
  import { get, writable } from "svelte/store";
  import { tick } from "svelte";
  import UiInputSelect from "./ui/UIInputSelect.svelte";

  let id = "";
  let name = "";
  let filter_complex = "";
  let duration = "";
  let scale = "";
  let loop = "";

  const qualitySettings = config.settings.find(
    (s) => s.id === "filter_complex",
  );
  const loopSettings = config.settings.find((s) => s.id === "loop");

  // show current values on open
  $: if ($showAddPresetModal === true) {
    const settings = get(selectedSettings);

    id = get(selectedFormat).id;
    name = "My Preset";
    filter_complex = settings.filter_complex.value;
    duration = settings.duration.value;
    scale = settings.scale.value?.replace(":-1", "") ?? "";
    loop = settings.loop.value;
  }

  // pattern dont allow ids already defined in config.format.options
  const patternAppDefaultFormatNames = `^(?!(?:${config.formats
    .map((f) => f.label.replace("(", "\\(").replace(")", "\\)"))
    .join("|")})$).*$`;

  // check if values would work
  $: newPreset = {
    id: $isEditing ? id : name,
    label: name,
    value: name,
    ext: "gif",
    mimetype: "image/gif",
    isCustomPreset: false,
    isRemovable: true,
    selectedSettings: {
      filter_complex: {
        id:
          qualitySettings?.options?.find((s) => s.value === filter_complex)
            ?.id ?? "filter_complex-hi",
      },
      duration: { id: "gif-duration-custom", value: duration },
      scale: { id: "gif-scale-custom", value: scale },
      loop: {
        id:
          loopSettings?.options?.find((s) => s.value === loop)?.id ??
          "gif-loop-1",
      },
    },
  } satisfies FormatOption;

  $: formatAlreadyExists = $customPresets.some((f) => f.id === newPreset.id);

  async function onSavePreset() {
    $customPresets = Array.from(
      new Set([
        ...$customPresets.filter((p) => p.id !== newPreset.id),
        newPreset,
      ]),
    );

    await tick();

    $showAddPresetModal = false;
    $selectedFormat = newPreset;
  }
</script>

<UiModal bind:open={$showAddPresetModal} on:submit={onSavePreset}>
  <h3 class="mb-6 mt-2 text-current">Preset</h3>

  <div class="flex flex-wrap gap-4 text-left">
    <UiInputText
      label="Preset Name"
      placeholder="eg. mp3 low"
      required
      pattern={patternAppDefaultFormatNames}
      title="Preset name cannot be the same as an app default format."
      bind:value={name}
    />
    {#if !$isEditing && formatAlreadyExists}
      <span class="text-yellow-600"
        >A preset with this name already exists and will be overwritten.</span
      >
    {/if}
    <UiInputSelect
      label="Quality"
      options={qualitySettings?.options ?? []}
      bind:value={filter_complex}
    />
    <UiInputText
      label="Duration in Seconds"
      placeholder="eg. 3"
      bind:value={duration}
    />
    <UiInputText
      label="width (empty for original)"
      placeholder="eg. 320"
      bind:value={scale}
    />
    <UiInputSelect
      label="Loop"
      options={loopSettings?.options ?? []}
      bind:value={loop}
    />
  </div>

  <div slot="action">
    <UiButton title="Save Preset" type="submit" />
  </div>
</UiModal>
