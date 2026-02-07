/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly ADSENSE_PUBLISHER_ID: string;
  readonly ADSENSE_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: any;
      };
    };
  }
}
