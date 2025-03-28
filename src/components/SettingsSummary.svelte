<script lang="ts">
  import type { SelectedSettings } from "@/store";

  export let settings = {} as SelectedSettings;

  $: settingsString = Object.values(settings)
    .map((setting) => {
      if (!setting.isInput) {
        return setting.label;
      } else {
        return `${setting.label}: ${setting.value}`;
      }
    })
    .join(" | ");
</script>

<p class="mx-auto text-sm text-center font-thin">
  {settingsString}
</p>
