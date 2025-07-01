# Vueflow Demo App

Este proyecto es una demo interactiva construida con [Vue Flow](https://vueflow.dev/) y [Quasar Framework](https://quasar.dev/), que permite crear, editar y visualizar flujos de nodos personalizados en una interfaz visual.

## ¿Qué hace esta app?

- Permite agregar nodos de diferentes tipos (simple, branch, goto) y conectarlos visualmente.
- Los nodos tipo "goto" pueden asociarse a otros nodos y cambian su icono según el destino.
- Soporta edición y eliminación de nodos y conexiones, con reglas especiales para los nodos "goto".
- Incluye estilos personalizados y componentes reutilizables para la visualización de los nodos y edges.

## Requisitos previos

- Node.js >= 18
- Yarn o npm

## Instalación

Instala las dependencias del proyecto:

```bash
yarn
# o
npm install
```

## Ejecución en modo desarrollo

Inicia la app con recarga en caliente y reporte de errores:

```bash
quasar dev
```

## Comandos útiles

### Lint (analizar y corregir estilo de código)

```bash
yarn lint
# o
npm run lint
```

### Formatear archivos

```bash
yarn format
# o
npm run format
```

### Compilar para producción

```bash
quasar build
```

## Personalización

Puedes personalizar la configuración de Quasar en el archivo [`quasar.config.ts`](./quasar.config.ts).

Más información: [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
