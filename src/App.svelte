<script lang="ts">
  import Router from "svelte-spa-router";
  import { routes } from "./routes";
  import active from "svelte-spa-router/active";
  import { config } from "./config";
  import Footer from "./components/Footer.svelte";
  import Updater, { isReady } from "./components/Updater.svelte";
  import UiContainer from "./components/ui/UIContainer.svelte";
  import Header from "./components/Header.svelte";
  import Home from "./pages/Home.svelte";
  import BrowserNotifications from "./components/BrowserNotifications.svelte";
  import Preloader from "./components/Preloader.svelte";
  import { isPreloadingFiles, preferedColorScheme } from "./store";
</script>

<div
  class="min-h-screen w-full p-1 theme-{config.colorScheme} {$preferedColorScheme}"
>
  {#if !$isReady || $isPreloadingFiles}
    <Preloader
      cacheName="wo-ffmpeg"
      cacheVersion={import.meta.env.VITE_FFMPEG_VERSION}
      urls={[
        import.meta.env.VITE_FFMPEG_CORE_PATH,
        import.meta.env.VITE_FFMPEG_WORKER_PATH,
        import.meta.env.VITE_FFMPEG_WASM_PATH,
      ]}
      ><Header title={config.titleHeader} class="!scale-75 !mb-0" /></Preloader
    >
  {:else}
    <!-- only hide to keep alive on page change  -->
    <div use:active={{ path: "/", inactiveClassName: "hidden" }}>
      <Home />
    </div>
    <Router {routes} restoreScrollState={true} />
    <BrowserNotifications />
  {/if}
  <Updater />
</div>
<Footer />

<style>
  div {
    background-color: var(--theme-bg-color);
    color: var(--theme-font-color);
  }

  /**
  *****************************
  ** NEUTRAL
  *****************************
  */
  :global(.theme-neutral) {
    --theme-bg-light-color: theme(colors.neutral.700);
    --theme-bg-color: theme(colors.neutral.800);
    --theme-bg-dark-color: theme(colors.neutral.900);
    --theme-btn-color: theme(colors.neutral.600);
    --theme-btn-color-dark: theme(colors.neutral.400);
    --theme-font-color: theme(colors.neutral.200);
    --theme-border-color: 245, 245, 245;

    @media (prefers-color-scheme: light) {
      --theme-bg-light-color: theme(colors.neutral.200);
      --theme-bg-color: theme(colors.neutral.100);
      --theme-bg-dark-color: theme(colors.neutral.400);
      --theme-btn-color: theme(colors.neutral.500);
      --theme-btn-color-dark: theme(colors.neutral.700);
      --theme-font-color: theme(colors.neutral.800);
      --theme-border-color: 38, 38, 38;
    }
  }

  :global(.theme-neutral.dark) {
    --theme-bg-light-color: theme(colors.neutral.700);
    --theme-bg-color: theme(colors.neutral.800);
    --theme-bg-dark-color: theme(colors.neutral.900);
    --theme-btn-color: theme(colors.neutral.600);
    --theme-btn-color-dark: theme(colors.neutral.400);
    --theme-font-color: theme(colors.neutral.200);
    --theme-border-color: 245, 245, 245;
  }

  :global(.theme-neutral.light) {
    --theme-bg-light-color: theme(colors.neutral.200);
    --theme-bg-color: theme(colors.neutral.100);
    --theme-bg-dark-color: theme(colors.neutral.400);
    --theme-btn-color: theme(colors.neutral.500);
    --theme-btn-color-dark: theme(colors.neutral.700);
    --theme-font-color: theme(colors.neutral.800);
    --theme-border-color: 38, 38, 38;
  }

  /**
  *****************************
  ** CYAN PURPLE
  *****************************
  */
  :global(.theme-zinc-cyan) {
    --theme-bg-light-color: theme(colors.zinc.600);
    --theme-bg-color: theme(colors.zinc.700);
    --theme-bg-dark-color: theme(colors.zinc.800);
    --theme-btn-color: theme(colors.cyan.600);
    --theme-btn-color-dark: theme(colors.cyan.400);
    --theme-font-color: theme(colors.cyan.50);
    /* --theme-border-color: theme(colors.neutral.100); */
    --theme-border-color: 245, 245, 245;

    @media (prefers-color-scheme: light) {
      --theme-bg-light-color: theme(colors.zinc.200);
      --theme-bg-color: theme(colors.zinc.100);
      --theme-bg-dark-color: theme(colors.zinc.400);
      --theme-btn-color: theme(colors.cyan.500);
      --theme-btn-color-dark: theme(colors.cyan.700);
      --theme-font-color: theme(colors.neutral.800);
      /* --theme-border-color: theme(colors.neutral.800); */
      --theme-border-color: 38, 38, 38;
    }
  }

  :global(.theme-zinc-cyan.dark) {
    --theme-bg-light-color: theme(colors.zinc.600);
    --theme-bg-color: theme(colors.zinc.700);
    --theme-bg-dark-color: theme(colors.zinc.800);
    --theme-btn-color: theme(colors.cyan.600);
    --theme-btn-color-dark: theme(colors.cyan.400);
    --theme-font-color: theme(colors.cyan.50);
    /* --theme-border-color: theme(colors.neutral.100); */
    --theme-border-color: 245, 245, 245;
  }

  :global(.theme-zinc-cyan.light) {
    --theme-bg-light-color: theme(colors.zinc.200);
    --theme-bg-color: theme(colors.zinc.100);
    --theme-bg-dark-color: theme(colors.zinc.400);
    --theme-btn-color: theme(colors.cyan.500);
    --theme-btn-color-dark: theme(colors.cyan.700);
    --theme-font-color: theme(colors.neutral.800);
    /* --theme-border-color: theme(colors.neutral.800); */
    --theme-border-color: 38, 38, 38;
  }
</style>
