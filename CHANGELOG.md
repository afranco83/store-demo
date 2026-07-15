## [1.3.1](https://github.com/afranco83/store-demo/compare/v1.3.0...v1.3.1) (2026-07-15)

### Bug Fixes

- corregir tilde duplicada en [@import](https://github.com/import) de CLAUDE.md tras prettier ([e189ea9](https://github.com/afranco83/store-demo/commit/e189ea91bead4eaf25a0318f1c085e00524651bb))

# [1.3.0](https://github.com/afranco83/store-demo/compare/v1.2.0...v1.3.0) (2026-07-14)

### Bug Fixes

- **i18n:** corregir los 10 hallazgos del /code-review high ([91f1cd6](https://github.com/afranco83/store-demo/commit/91f1cd62b6da105b9d2e1538bc085ba939b8ec1b))
- **i18n:** corregir los 2 hallazgos del agente bug-hunter ([b9f99d2](https://github.com/afranco83/store-demo/commit/b9f99d20cd9fcadc4e1c9b97737c753ff9f8c9b6))

### Features

- **i18n:** internacionalización (ES/EN) en apps/storefront con next-intl ([d5c58d3](https://github.com/afranco83/store-demo/commit/d5c58d3d8faecdc736ee56d44a72b77315809034))

# [1.2.0](https://github.com/afranco83/store-demo/compare/v1.1.0...v1.2.0) (2026-07-13)

### Features

- **api:** reset periódico del dataset de la demo pública ([b4c6129](https://github.com/afranco83/store-demo/commit/b4c6129e397ee9e9e126acf989a75db79cc9e4cc))

# [1.1.0](https://github.com/afranco83/store-demo/compare/v1.0.1...v1.1.0) (2026-07-13)

### Bug Fixes

- corregir 5 bugs reales encontrados en /code-review high + bug-hunter sobre la PR ([1959fb7](https://github.com/afranco83/store-demo/commit/1959fb72d813eaa62edb7b0ffa7329bdc41198e6))
- **e2e:** corregir el fallo real de CI en la PR (contraste + locators ambiguos ([b2bf906](https://github.com/afranco83/store-demo/commit/b2bf906f8e8457372a0e6bf08a3414f81cc53709))

### Features

- **storefront:** añadir SEO técnico, Open Graph/Twitter, JSON-LD y gate de Lighthouse ([8168f72](https://github.com/afranco83/store-demo/commit/8168f72abbc0f1001f461785ab5f8d0ac8b01f1b))
- **storefront:** mostrar productos relacionados en el detalle de producto ([1c075a4](https://github.com/afranco83/store-demo/commit/1c075a408a778ee24362e390ad0618d0c2fb5c96))
- **ui:** añadir molécula Hero y usarla en la home de storefront ([2b663b5](https://github.com/afranco83/store-demo/commit/2b663b5ccabb7de9f150736341df80eb93e7e0d8))
- **ui:** añadir organism Footer y enriquecer el footer de storefront ([14c89e7](https://github.com/afranco83/store-demo/commit/14c89e7a934ecacdf33d3b4832b2cf8a802387ab))

## [1.0.1](https://github.com/afranco83/store-demo/compare/v1.0.0...v1.0.1) (2026-07-13)

### Bug Fixes

- **turbo:** declarar package.json raíz como globalDependency ([3793368](https://github.com/afranco83/store-demo/commit/379336859880a7caec3b3aee482e9e7e23eb727c))

# 1.0.0 (2026-07-13)

### Bug Fixes

- ajustar imagen de CartLineItem para mantener proporciones ([199f87f](https://github.com/afranco83/store-demo/commit/199f87f52fbb620cad445467cac30dd48a75ea43))
- añadir AUTH_SECRET/AUTH_JWT_SECRET a ci.yml, ausentes en el runner real ([9de4cf2](https://github.com/afranco83/store-demo/commit/9de4cf23774e9fc06fdf646e7d5ea9b3110e0f0e)), closes [#10](https://github.com/afranco83/store-demo/issues/10)
- añadir el CTA de checkout que faltaba en el carrito ([14fd6ee](https://github.com/afranco83/store-demo/commit/14fd6eeea40cd426f433b1d60b049f43b4bbfb82))
- añadir variante dark del acento por contraste AA insuficiente ([2e52ee5](https://github.com/afranco83/store-demo/commit/2e52ee5b4b2c6780f0b59244ed7f023e6e449252)), closes [#c2410c](https://github.com/afranco83/store-demo/issues/c2410c)
- anclar el matcher de apps/admin a segmento de ruta completo ([91d3676](https://github.com/afranco83/store-demo/commit/91d3676c3dbd02240b3ac61fbcede1281873f2cf))
- aplicar hallazgos de /code-review high + bug-hunter sobre la Fase 8 ([03f83ce](https://github.com/afranco83/store-demo/commit/03f83ce3ccdbbd1412a8b4724765c4936d54c2ad)), closes [#10](https://github.com/afranco83/store-demo/issues/10)
- apps/api regenera el cliente de Prisma en su propio build, no solo en postinstall ([3652f4a](https://github.com/afranco83/store-demo/commit/3652f4aeaf2789d684978870a9fd5663f9d00cf3))
- corregir 10 hallazgos del code-review de la Fase 5 ([ff1fbb5](https://github.com/afranco83/store-demo/commit/ff1fbb5945cccc14f7e9422cfaf73a436e993779))
- corregir bugs y huecos detectados en la revisión de código de la Fase 4 ([554bbd7](https://github.com/afranco83/store-demo/commit/554bbd7ec2efb5403a3da8e82d08631071c754a4))
- corregir formato de precio y reboteo visual del estado en apps/admin ([621342b](https://github.com/afranco83/store-demo/commit/621342bd3ac82fbb56caf4200419697783554edc))
- dar más margen al test de concurrencia del carrito para CI ([ce290a5](https://github.com/afranco83/store-demo/commit/ce290a53ebaf2e4c7508992e7005125433979490))
- dar más margen de timeout al test flaky de concurrencia del carrito ([199dee6](https://github.com/afranco83/store-demo/commit/199dee6de1f9fdc3c44434d6b80b4fa5d862723e))
- enfocar el seed en apparel real con fotos de Unsplash ([62cfbc6](https://github.com/afranco83/store-demo/commit/62cfbc6ea23cf81f50b24872ee8b80724562eb6c))
- exigir rol admin para cambiar el estado de un pedido ([ae3df1c](https://github.com/afranco83/store-demo/commit/ae3df1c27a17c47e5d1d52611ff9593c73ffcd16))
- hacer dinámica la home para no depender de apps/api en build time ([dedd328](https://github.com/afranco83/store-demo/commit/dedd328d837f0821adbfe92dbf05df19c19947c8))
- mover API_URL a nivel de job y activar debug de Auth.js en CI ([cf53f20](https://github.com/afranco83/store-demo/commit/cf53f2064a331a74b88994f21dd3a5e4fd1d9ac9))
- no reventar /account/orders al deslizar la cookie api_token ([a54e721](https://github.com/afranco83/store-demo/commit/a54e72161f363e37d8473e4c7ac49f7ec355672a))
- quitar JSX de packages/testing/query-client para no romper api-client ([0a128a1](https://github.com/afranco83/store-demo/commit/0a128a1fb63b4510386cca5544b94964fdab4902))
- **release:** definir DATABASE_URL en release.yml para que postinstall no rompa el install ([d7b17ce](https://github.com/afranco83/store-demo/commit/d7b17ce8c8ae28ac91db86226b5b5a6b5ee9ccf6))
- resolver el alias @ en vitest.config.ts de apps/admin y apps/storefront ([426cf72](https://github.com/afranco83/store-demo/commit/426cf72c47879d37067e5dd04c902e4e11637a5a))
- turbo test:e2e con env-mode=loose, causa raíz real del fallo en CI ([909bb24](https://github.com/afranco83/store-demo/commit/909bb24aa9c59cfe9e0bcaefd3dbb71d07d5263d))
- usar 127.0.0.1 explícito para API_URL en E2E, no "localhost" ([aabe5c9](https://github.com/afranco83/store-demo/commit/aabe5c9595f9a7bf98f372e6779f37c68332f6b2))
- webServer.env de Playwright reemplazaba el entorno heredado, no lo ampliaba ([a8d62e3](https://github.com/afranco83/store-demo/commit/a8d62e390b0e4cbd3bdf85546556fa34c497367a))

### Features

- añadir botón de añadir al carrito a ProductCard ([5e3a3fe](https://github.com/afranco83/store-demo/commit/5e3a3feada46cda6b5ed898618e6176f5e260e9a))
- cerrar Fase 8 (Calidad Transversal) — a11y, Lighthouse, cobertura, docs, bundle ([64bd0d0](https://github.com/afranco83/store-demo/commit/64bd0d019d80fb7408b3bfca28d0b6cd2d6dd532))
- crear agentes y skills reales del backlog, más frontend-patterns adaptada ([4e5d270](https://github.com/afranco83/store-demo/commit/4e5d27016cb11005192c4af9c28ffdf2d712981b))
- implementar Fase 2 - Backend Fake & Contratos ([ae52974](https://github.com/afranco83/store-demo/commit/ae529745d4f639870d6ef22bbf2003f2ab89666c))
- implementar Fase 3 - Design System (Base) ([3a922a4](https://github.com/afranco83/store-demo/commit/3a922a428bc51a45029f6b682c86865bbf3fbb2e))
- implementar Fase 4 - Storefront (Catálogo & Carrito) ([5706d37](https://github.com/afranco83/store-demo/commit/5706d379453fead8f36f50628e25ee92672462b6))
- implementar Fase 5 - Autenticación & Cuenta ([4c0289c](https://github.com/afranco83/store-demo/commit/4c0289cf2ff716a3021ada6a1ee2144608319d4b))
- implementar Fase 6 - Checkout ([1b1101e](https://github.com/afranco83/store-demo/commit/1b1101e43edbb2f96cc3cb04c9ba29ff4a21edd4))
- implementar Fase 7 - Admin ([adefbf4](https://github.com/afranco83/store-demo/commit/adefbf453a32c526feb420d5e038807101e18247))
- migrar apps/api de better-sqlite3 a Turso (libSQL) para demo pública en Vercel ([6059b22](https://github.com/afranco83/store-demo/commit/6059b22e39d1ef228b73527e687d988aabdddeca))
- mostrar la versión de la app en el footer de storefront y admin ([e610287](https://github.com/afranco83/store-demo/commit/e610287e5abcbd941da21182c12fe0b77afd5d58))
- permitir editar nombre y email desde Mi cuenta ([57e4f42](https://github.com/afranco83/store-demo/commit/57e4f42e1ff96e5fb6247ca3f0d8c733f22b136b))
- rediseñar el área de sesión del navbar con icono y menú de usuario ([5308218](https://github.com/afranco83/store-demo/commit/530821844c4b8ac11d507a65791f607cb6b35ed5))
- **release:** añadir pipeline de versionado automático con semantic-release ([7403ae5](https://github.com/afranco83/store-demo/commit/7403ae5924c4c6d8860badbb650db157101a53b7))
- scaffolding Fase 1 - monorepo & tooling base ([07a2f8c](https://github.com/afranco83/store-demo/commit/07a2f8c5c435a7c026529bab1a057db4321dac39))
- **ui:** añadir átomo VersionBadge al design system ([7193245](https://github.com/afranco83/store-demo/commit/719324502918fa9be70c39bbc9ba1f7ba2c6b359))
