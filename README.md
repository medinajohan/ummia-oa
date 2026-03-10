# UMMIA OA

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

## Stack y decisiones técnicas

Elegí **React 19 + TypeScript + Vite** como base. No agregué librerías de UI ni de estado global a propósito: quería demostrar que con los hooks nativos de React se puede resolver perfectamente el manejo de estado complejo sin dependencias extra.

**Vite** Use Vite ya que es el bundler más rápido para desarrollo con React hoy en día. No requiere mucha configuración, y el build de producción con Rollup es sólido. No había razón para usar CRA o Next.js para una SPA sin SSR.

**¿Por qué no Redux/Zustand?** El estado de esta app es local a una vista. Un `useReducer` con acciones tipadas me da lo mismo que un store global pero con menos boilerplate y sin re-renders innecesarios en componentes que no consumen ese estado.

**¿Por qué no MUI/Tailwind?** Para el alcance de esta prueba, CSS puro con clases bien nombradas es suficiente.

## Arquitectura

```
src/
  hooks/useOA.ts         → Hook principal con useReducer, paginación acumulativa y optimistic update
  utils/oaUtils.ts       → Lógica pura: deduplicación por última versión activa + filtros
  services/oaService.ts  → Capa de abstracción sobre la API 
  components/
    form/OAForm.tsx      → Formulario de creación con validaciones
    modal/Modal.tsx      → Modal usando <dialog> nativo 
  mocks/                 → Mock API proporcionado
```

Separé la lógica en capas a propósito:

- **`oaService.ts`** abstrae la fuente de datos. Por ahora llama al mock, pero en producción se reemplazaría por llamadas a AppSync/GraphQL sin tocar el hook ni los componentes.
- **`oaUtils.ts`** tiene funciones puras y testeables para la lógica de negocio (deduplicación, filtros). No depende de React.
- **`useOA.ts`** orquesta todo: fetch, paginación, filtros, creación con optimistic update. Usa `useReducer` para centralizar las transiciones de estado y `useMemo` para derivar los items visibles sin recalcular en cada render.

## Lógica de negocio clave

El criterio de "última versión ACTIVA por código" se resuelve en `getLatestActiveByCode()`:

1. Recorre todos los items acumulados de todas las páginas
2. Descarta los que tienen `estado !== "ACTIVO"`
3. Agrupa por `codigo` y se queda con la `version` más alta
4. Si un código no tiene ninguna versión activa, no aparece

Esto cubre los edge cases del mock:
- `CIE-2M-05` (solo INACTIVO) → no se muestra
- `HIS-2M-03` (v2 INACTIVA, v1 ACTIVA) → muestra v1
- `LEN-1B-02` (v1 ACTIVA, v2 INACTIVA, v3 ACTIVA) → muestra v3

## Optimistic Update

Cuando el usuario crea un OA:

1. Se genera un item temporal y se agrega al estado inmediatamente
2. Se llama a la API
3. Si la API responde OK, se reemplaza el temporal por el real
4. Si falla, se revierte el temporal y se muestra el error

El usuario ve el resultado al instante sin esperar la respuesta del servidor.

## Qué haría diferente en producción

- Reemplazar `oaService.ts` por llamadas reales a AWS AppSync con Amplify
- Implementar virtualización de la tabla para volúmenes grandes
- Mover los filtros al backend (GSIs en DynamoDB) en lugar de filtrar client-side
