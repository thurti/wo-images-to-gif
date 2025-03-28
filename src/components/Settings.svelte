<script lang="ts">
  import { type FormatOption, type SettingOption } from "@/config";
  import Setting from "./Setting.svelte";
  import UiHeading from "./ui/UIHeading.svelte";
  import {
    isCustomCommand,
    filesReadyForDownload,
    type SelectedSettings,
    isSharedSettings,
    selectedFormat,
    selectedSettings,
    customPresets,
    getDefaultFormat,
  } from "@/store";
  import { settingsIsForFormat } from "@/lib/utils/settings";
  import UiButton from "./ui/UIButton.svelte";
  import { openAddPresetModal } from "./AddPreset.svelte";
  import SettingCustom from "./SettingCustom.svelte";
  import { openShareModal } from "./ShareModal.svelte";
  import linkSvg from "@/assets/link.svg?raw";
  import UiTabs from "./ui/UITabs.svelte";
  import UiTabsPanel from "./ui/UITabsPanel.svelte";
  import { tick } from "svelte";

  export let formats: FormatOption[];
  export let settings: SettingOption[];
  export let defaultSettings: SelectedSettings;

  $: {
    // set settings from defaults only if a new format is selected or no selectedSettings are present
    // ignore if custom command is used
    // ignore if url shared settings are used
    if (!$selectedSettings && !$isCustomCommand && !$isSharedSettings) {
      $selectedSettings = { ...defaultSettings };
    } else {
      // trigger re-render
      $selectedSettings = {
        ...$selectedSettings,
      };
    }
  }

  selectedFormat.subscribe(async (format) => {
    // wait for defaults to update
    await tick();

    if (!$isCustomCommand && !$isSharedSettings) {
      $selectedSettings = {
        ...defaultSettings,
      };
    }
  });

  $: tabs =
    settings.map((setting: SettingOption) => ({
      id: setting.id,
      name: setting.label,
    })) ?? [];

  const onUpdateSelectedSetting = ({
    id,
    selected,
  }: {
    id: string;
    selected: SettingOption;
  }) => {
    $filesReadyForDownload = new Set();

    $selectedSettings = {
      ...$selectedSettings,
      [id]: selected,
    };
  };

  const onUpdateFormat = () => {
    $filesReadyForDownload = new Set();
  };

  const onRemoveFormat = async (e: any) => {
    const item = e.detail;

    if (
      await confirm(`Are you sure you want to remove preset "${item.label}"?`)
    ) {
      $customPresets = $customPresets.filter((preset) => preset.id !== item.id);

      $selectedFormat = getDefaultFormat();
    }
  };
</script>

<div class="space-y-7 max-w-3xl m-auto">
  <Setting
    id="format"
    label="Settings"
    options={formats}
    bind:selected={$selectedFormat}
    on:update:selected={onUpdateFormat}
    on:remove={onRemoveFormat}
  >
    <UiHeading
      level={3}
      id="format"
      slot="heading"
      class="mb-6 ml-24 flex items-center justify-center gap-4"
    >
      Settings

      <UiButton
        title="Share Settings"
        small
        outline
        on:click={openShareModal}
        class="flex items-center gap-1 !pl-3 !text-xs !pt-1.5"
      >
        <span class="-mt-1" style="transform:scale(0.65);">{@html linkSvg}</span
        >
        Share
      </UiButton>
    </UiHeading>

    <UiButton
      slot="after"
      class="!pl-2.5"
      title="+ Add Preset"
      small
      outline
      on:click={() => openAddPresetModal()}
    />
  </Setting>

  {#if settings}
    <UiTabs {tabs} class="!mt-12">
      {#each settings as setting (setting)}
        {#if setting.options}
          <UiTabsPanel id={setting.id}>
            <Setting
              id={setting.id}
              options={setting.options}
              selected={$selectedSettings[setting.id]}
              on:update:selected={(e) => onUpdateSelectedSetting(e.detail)}
            />
          </UiTabsPanel>
        {/if}
      {/each}
    </UiTabs>
  {/if}
</div>
