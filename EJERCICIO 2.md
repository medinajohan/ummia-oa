## MODELADO Y ARQUITECTURA

1. Propuesta de Single Table Design para OA: 
- PK sugerida:
Usaria PAIS#<pais> de esta manera separamos los datos por país

- SK sugerida:
Usaria OA#<codigo>#V#<version> para guardar múltiples versiones de un mismo OA y facilitar las consultas posteriormente 

- Estrategia multi-tenant:
El país en la PK asegura que cada consulta esté limitada a un país específico y no se mezclan los datos

- GSIs necesarios:
GSI1 - Un index para buscar OAs por estado, asignatura o nivel dentro de un país.
GSI2 - Un index para obtener la última versión activa de un OA usando su código.

2. Estrategia de versionamiento en DynamoDB:
La idea es que cada versión del OA se guarde como un registro nuevo, sin sobrescribir versiones anteriores. Cuando se crea una nueva versión se obtiene la versión actual y se incrementa en 1 asi mantenemos el historial completo y evitamos perder información

3. Cómo restringir acceso por país usando AppSync (@auth rules):
Sé que en AWS AppSync se pueden usar reglas basadas en el usuario que inicio sesión. Si el usuario inicia sesión con Amazon Cognito su token debería incluir el país. Con las reglas de autorización se puede validar ese país para que el usuario solo acceda a datos de su propio país.

4. Riesgos de controlar acceso solo en frontend:
El frontend no es seguro porque el usuario puede modificarlo. Es posible llamar directamente a la API con herramientas usando Postman por ejemplo y es muy sencillo obtener el curl desde las herramientas del navegador, se pueden cambiar parámetros y acceder a otros datos, por eso es mejor implementar el control de acceso desde el backend o en la API, no solo en el frontend.