<script lang="ts">
  import UiContainer from "@/components/ui/UIContainer.svelte";
  import UiFileDrop from "@/components/ui/UIFileDrop.svelte";
  import UiFileList from "@/components/ui/UIFileList.svelte";
  import Settings from "@/components/Settings.svelte";
  import {
    defaultSettings,
    filesReadyForDownload,
    isDownloadReady,
    isPreloadingFiles,
    logger,
    selectedFiles,
    selectedFormat,
    selectedSettings,
    configFormats,
    configSettings,
    type SelectedSettings,
    isCustomCommand,
    isSharedSettings,
    customPresets,
  } from "@/store";
  import FileConverter, { getResult } from "@/components/FileConverter.svelte";
  import ConvertButton from "@/components/ConvertButton.svelte";
  import Header from "@/components/Header.svelte";
  import { config, type FormatOption } from "@/config";
  import { fade } from "svelte/transition";
  import Hyper5HeadMode from "@/components/Hyper5HeadMode.svelte";
  import UiButton from "@/components/ui/UIButton.svelte";
  import UiFloatingButton from "@/components/ui/UIFloatingButton.svelte";
  import UiFloatingButtonsContainer from "@/components/ui/UIFloatingButtonsContainer.svelte";
  import { getDataFromUrlParam } from "@/lib/utils/url";
  import { onMount, tick } from "svelte";
  import AddPreset from "@/components/AddPreset.svelte";
  import ShareModal from "@/components/ShareModal.svelte";
  import infoSvg from "@/assets/info.svg?raw";
  import gearSvg from "@/assets/gear.svg?raw";
  import SettingsSummary from "@/components/SettingsSummary.svelte";
  import UiImagePreview from "@/components/ui/UIImagePreview.svelte";
  import UiDownloadData from "@/components/ui/UIDownloadData.svelte";

  let refConvertButton: HTMLDivElement;
  $: resultFile = null as File | null;
  $: resultFileData = null as Blob | null;

  $: {
    if ($filesReadyForDownload.size <= 0) {
      $isDownloadReady = false;
    }
  }

  $: {
    if ($isDownloadReady) {
      const { data, filename } = getResult();
      resultFile = new File([data], filename, { type: "image/gif" });
      resultFileData = data;
    }
  }

  const onRemoveFile = (file: File) => {
    $selectedFiles = $selectedFiles.filter((f) => f !== file);
  };

  const onRemoveAll = () => {
    $selectedFiles = [];
    resultFile = null;
  };

  onMount(async () => {
    // TODO: move to store or separate function
    // get settings from shared url
    try {
      const format = getDataFromUrlParam<FormatOption>("format");
      const settings = getDataFromUrlParam<SelectedSettings>("settings");

      if (format && settings) {
        $isSharedSettings = true;
        if (!$configFormats.find((f) => f.id === format.id)) {
          const preset = format as FormatOption;
          $customPresets = structuredClone([...$customPresets, preset]);
        }
        // $isCustomCommand = settings.custom ? true : false; //disabled for now
        $selectedSettings = settings;
        await tick(); //wait for derived store to update
        $selectedFormat = format;
        await tick(); //wait for derived store to update
        window.history.replaceState({}, "", window.location.pathname);
        $isSharedSettings = false;
      }
    } catch (error) {
      console.log(error);
    }
  });
</script>

<UiContainer maxWidth={false}>
  <!-- HEADER -->
  <Header title={config.titleHeader} />

  <div class="flow relative" in:fade={{ duration: 100 }}>
    <!-- FILE LIST -->
    <div class="grid relative pb-4">
      <UiFileList let:file bind:files={$selectedFiles}>
        <!-- FILE UPLOAD -->
        <UiFileDrop
          slot="empty"
          bind:files={$selectedFiles}
          disabled={$isPreloadingFiles}
          label={config.fileDropLabel}
          multiple={true}
          maxFileSizeMb={config.maxFileSizeMb}
          accept={config.allowedFormats}
        />
        <!-- IMAGES -->
        <UiImagePreview {file} on:remove={() => onRemoveFile(file)} />
      </UiFileList>
      {#if $selectedFiles.length > 0}
        <UiButton
          class="absolute w-max justify-self-end -bottom-3"
          title="Remove all"
          outline
          small={true}
          on:click={() => onRemoveAll()}>Remove All Images</UiButton
        >
      {/if}
    </div>

    <!-- SETTINGS -->
    <Settings
      formats={$configFormats}
      settings={$configSettings}
      defaultSettings={$defaultSettings}
    />

    <!-- SUMMARY -->
    {#if !$isCustomCommand}
      <SettingsSummary settings={$selectedSettings} />
    {/if}

    <!-- CONVERT BUTTON -->
    <div
      class="flex flex-wrap items-center justify-center gap-3"
      bind:this={refConvertButton}
    >
      <FileConverter
        files={$selectedFiles}
        format={$selectedFormat}
        settings={$selectedSettings}
        {logger}
      />

      <ConvertButton disabled={$selectedFiles.length <= 0} />

      {#if $selectedFiles.length <= 0}
        <p
          class="d-block w-full text-center text-sm font-light text-neutral-400"
        >
          Add some images above.
        </p>
      {/if}
    </div>

    <!-- PREVIEW -->
    {#if resultFile}
      <div
        class="gap-6 w-full max-w-prose m-auto flex flex-col items-center justify-center"
      >
        <hr class="w-full border-t border-white border-opacity-50 mb-6" />

        <UiImagePreview file={resultFile} showRemoveButton={false} />

        <UiDownloadData
          data={resultFileData}
          type="image/gif"
          filename={resultFile.name}
          useNative={true}>Download</UiDownloadData
        >
      </div>
    {/if}

    <!-- EXPERT STUFF -->
    <div class="max-w-prose mx-auto flow">
      <hr class="border-t border-white border-opacity-50" />
      <Hyper5HeadMode />
    </div>
  </div>
</UiContainer>

<AddPreset />
<ShareModal />

<UiFloatingButtonsContainer hasMenu={true}>
  <UiFloatingButton title="About" href="#/info"
    >{@html infoSvg}</UiFloatingButton
  >

  <UiFloatingButton title="Preferences" href="#/preferences"
    >{@html gearSvg}</UiFloatingButton
  >
</UiFloatingButtonsContainer>
