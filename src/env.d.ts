/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  // 私有环境变量（无 PUBLIC_ 前缀，仅构建时服务端可见，不进客户端 bundle）
  readonly NOTION_TOKEN: string | undefined;
  readonly NOTION_DATABASE_ID: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
