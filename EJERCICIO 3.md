## ESCALABILIDAD Y PERFORMANCE

- ¿Qué haría si hay 100.000 OA por país?
Implementación de buenas practicas en el uso de muchos datos como la paginación, filtros usando los GSIs del ejercicio 2 y es posible hacer una virtualización desde el frontend.

- ¿Cómo optimizaría consultas en DynamoDB?
podemos diseñar sort keys compuestas para construir filtros eficientes, usando query en lugar de Scan para no leer toda la tabla, haciendo consultas paralelas cuando se necesiten varios registros.

- ¿Dónde implementaría caching? 
Podemos usar DAX en la Dynamo, se que AppSync tiene un caching integrado y podemos usar datos de sesión desde el frontend con storages o librerias como zustand

- ¿Qué herramientas usaría para detectar re-renders innecesarios?
Podemos usar react devtools para analizar qué componentes se renderizan, why-did-you-render para identificar por qué ocurre un re-render. Tambien es importante optimizar con memo, useMemo y useCallback para evitar renders innecesarios.