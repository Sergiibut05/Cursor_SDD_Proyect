# Metodología de desarrollo por especificación con Cursor

## Objeto

El presente documento recoge la investigación del grupo para la práctica de Spec-Driven Development. El objeto de estudio es Cursor como entorno en el que una especificación escrita dirige la implementación asistida por un agente. El producto al que se aplica es Visor Pokémon, un catálogo de consulta sobre PokeAPI. La aplicación no forma parte de este documento: las especificaciones se cierran antes que el código, y la implementación sigue el orden de `specs/tareas.md`.

Cursor no impone un formato propio para la especificación del producto. Un briefing, un documento de requisitos o la carpeta `specs/` de este repositorio son archivos Markdown. El agente los consulta porque están en el proyecto y porque las instrucciones del repositorio se lo exigen. Lo propio de Cursor es la configuración del agente: las indicaciones que determinan su comportamiento, el procedimiento que debe seguir y los subagentes a los que puede delegar.

## Descripción general

El agente no conserva la conversación anterior. Cada sesión comienza sin ese contexto. Una decisión que exista solo en un mensaje no está disponible para el resto del equipo ni para una sesión posterior. Por ello, el contexto que debe permanecer se guarda en archivos versionados.

El repositorio separa dos capas:

1. La especificación del producto, en `specs/`. Define qué es Visor Pokémon, cómo se estructura y en qué orden se construye.
2. La configuración del agente. Reside en `.cursor/` y, en parte, en la raíz del repositorio. No describe la aplicación: obliga a leer la especificación y a no excederla.

La especificación prevalece sobre el código. Si durante la implementación un resultado no se ajusta a lo escrito, se corrige el código o se actualiza antes la especificación. No se documenta a posteriori para justificar una decisión improvisada.

## Herramientas y documentos

### Contenido de `.cursor/`

La documentación de Cursor agrupa en este directorio las piezas de configuración del agente. En el repositorio se emplean rules, una skill, dos subagentes y un comando. Hooks y MCP se describen a continuación y no se han instalado.

**Rules.** Archivos `.mdc` en `.cursor/rules/`, con un frontmatter que determina en qué sesiones se incluyen. El cuerpo contiene instrucciones breves. Un archivo `.md` sin frontmatter, colocado en esa carpeta, no es reconocido por el sistema de rules.

Una rule puede aplicarse de cuatro maneras:

- En todas las sesiones, mediante `alwaysApply: true`. Este repositorio no define ninguna en ese modo. El contrato breve del proyecto está en `AGENTS.md`, y duplicarlo en una rule aumentaría el contexto de cada conversación sin añadir una función distinta.
- Cuando el archivo en curso coincide con un glob. `stack.mdc` se asocia al TypeScript de `src/`, y `ui-dex.mdc` a los componentes y a las hojas de estilo.
- Cuando el agente la considera pertinente, a partir de su `description` y sin glob. Es el caso de `pokeapi.mdc`, que se consulta al trabajar con la API aunque el archivo de cliente todavía no exista.
- Únicamente si se cita de forma explícita con `@` en el chat. Ninguna rule de este proyecto queda limitada a ese uso.

**Skills.** Cada skill ocupa un directorio `.cursor/skills/<nombre>/` con un archivo `SKILL.md`. Describe un procedimiento. Cursor la descubre al abrir el proyecto y la carga cuando la petición se corresponde con su descripción, o cuando se invoca con `/`. A diferencia de una rule de aplicación permanente, no ocupa contexto en las sesiones que no están implementando. La skill de este repositorio es `seguir-spec`. No se ha añadido una segunda: el procedimiento de implementación es uno solo, y otra skill repetiría los mismos pasos.

**Subagentes.** Archivos `.cursor/agents/*.md`. Cada uno es un agente con su propia ventana de contexto. El agente principal le encomienda una tarea y recibe un resultado; el detalle intermedio no permanece en la conversación de quien dirige el trabajo. Cursor incluye además subagentes de serie, para explorar el código y para manejar el navegador, que no requieren configuración.

En este repositorio hay dos:

- `implementador`. Ejecuta una sola tarea de `specs/tareas.md`. Sigue la skill `seguir-spec`, puede modificar archivos y no amplía el alcance.
- `revisor-spec`. Es de solo lectura. Comprueba la tarea frente a los criterios de aceptación y no modifica archivos.

**Commands.** Archivos `.cursor/commands/*.md`. Son indicaciones reutilizables que se lanzan con `/` en el chat del agente. El comando `/implementar-tarea` no implementa por sí mismo: delega la tarea indicada en el subagente `implementador` y, al recibir el resultado, delega la comprobación en `revisor-spec`. De este modo, la misma petición produce siempre la misma cadena de trabajo.

**Hooks.** Se declaran en `.cursor/hooks.json`, con scripts en `.cursor/hooks/`. Son programas que Cursor ejecuta en puntos determinados del ciclo del agente, por ejemplo al iniciar la sesión, antes de un comando de terminal o después de editar un archivo. Pueden observar, avisar o bloquear una acción. Este repositorio no incluye ninguno. Un script sin función real no documenta el mecanismo, y en Windows un hook resulta frágil de mantener entre equipos distintos. La comprobación de la especificación corresponde al subagente revisor.

**MCP.** El archivo `.cursor/mcp.json` conecta Cursor con herramientas externas, como bases de datos o APIs expuestas mediante un servidor. No se ha configurado ninguno. Visor Pokémon consulta PokeAPI con `fetch` desde la propia aplicación, de modo que el editor no necesita un servidor intermedio.

Los plugins empaquetan rules, skills, subagentes, commands, hooks y servidores MCP para distribuirlos. Al tratarse de un único repositorio de la práctica, las piezas se mantienen en `.cursor/` y no se distribuyen como plugin.

### Archivos externos a `.cursor/`

Cursor también lee los siguientes archivos, aunque no residan en ese directorio.

**`AGENTS.md`, en la raíz.** Markdown sin frontmatter. Constituye la alternativa simple a las rules: el contrato del proyecto, breve y presente en todas las sesiones. Cursor admite además un `AGENTS.md` en un subdirectorio; sus instrucciones se suman a las de la raíz y, en caso de contradicción, prevalecen las del archivo más próximo al código. En este proyecto basta el de la raíz.

**`.cursorignore`, en la raíz.** Indica qué rutas no indexa el agente y no pueden citarse con `@`. No impide que un comando de terminal lea esos archivos. El de este repositorio excluye `node_modules/` y `dist/`. No sustituye a `.gitignore`: el primero afecta al agente y el segundo, a Git.

**`specs/`.** No es un formato de Cursor. Es la especificación del producto, y el agente la abre porque así lo exigen `AGENTS.md` y la skill.

- `specs/requisitos.md` establece qué debe hacer la aplicación y mediante qué criterios se comprueba.
- `specs/diseno.md` fija rutas, pantallas, datos, tokens visuales y la organización del código.
- `specs/tareas.md` divide el trabajo del Miembro 2 en pasos ordenados. La última tarea consiste en documentar en el README la ejecución de la aplicación.

El presente documento está destinado a la lectura y a la exposición. El agente no lo necesita para implementar una tarea.

La configuración situada en el directorio personal (`~/.cursor/`: rules globales, skills de usuario, hooks locales) no se versiona. Una decisión que existiera solo ahí no estaría a disposición del resto del grupo.

## Fases del proceso

El orden forma parte de lo que la práctica evalúa. No se escribe código de la aplicación hasta que las especificaciones están en el repositorio.

1. **Requisitos.** Se delimita el problema que resuelve Visor Pokémon, el alcance y los criterios que pueden comprobarse de forma binaria.
2. **Diseño.** Se fijan pantallas, datos, archivos y aspecto en `specs/diseno.md`, de manera que el agente no sustituya el stack ni la interfaz en el curso de una tarea.
3. **Tareas.** Cada función se descompone en pasos pequeños. Cada paso indica su responsable y los criterios que lo dan por terminado. En este repositorio, esa lista corresponde al Miembro 2.
4. **Implementación.** Quien ejecuta el trabajo abre el chat, invoca `/implementar-tarea` e indica el identificador (`T1`, `T2`…). El comando delega en `implementador`. La skill obliga a leer la tarea, el diseño y los criterios, y a no adelantar la tarea siguiente.
5. **Revisión.** El subagente `revisor-spec` contrasta el resultado con los criterios. Lo que no se cumple se corrige en el código. Si el defecto está en la especificación, esta se modifica primero, en un commit independiente, y el código se adapta después.

Los modos de conversación del editor (Plan, Agent y Ask) son una ayuda de la herramienta, no una fase del proceso. Plan permite examinar un cambio antes de editar, Agent permite realizarlo y Ask permite consultar sin modificar archivos. La fuente de verdad que se entrega es `specs/`, no el plan temporal que Cursor conserva en la máquina.

### Cambio de requisitos

Una vez cerrado el MVP, el cambio no se solicita en un mensaje aislado. Está descrito en `specs/requisitos.md` y en `specs/diseno.md` como C1, y `specs/tareas.md` declara de forma expresa que no forma parte de la lista actual. Cuando el grupo abra esa fase, actualizará primero la especificación, la incorporará a la lista de tareas y solo entonces la implementará con el mismo comando.

## Ejemplo de utilización

Visor Pokémon es un catálogo de Pokémon alimentado por PokeAPI. Permite buscar una ficha y consultarla. El equipo, de hasta seis ejemplares, es un apartado adicional: el catálogo puede utilizarse sin abrirlo. El detalle funcional está en las especificaciones. La tabla siguiente muestra qué archivo interviene en cada situación.

| Situación | Archivo que interviene |
| --- | --- |
| Cualquier sesión del repositorio | `AGENTS.md` |
| Invocar `/implementar-tarea` | comando que delega en el subagente `implementador` |
| Implementar la tarea | skill `seguir-spec` y, a través de ella, las tres especificaciones |
| Crear componentes o estilos | rule `ui-dex` y los tokens de `specs/diseno.md` |
| Escribir el cliente de PokeAPI, el catálogo, la ficha o el equipo | rule `pokeapi` |
| Editar TypeScript en `src/` | rule `stack` |
| Dar la tarea por terminada | subagente `revisor-spec` |

La primera tarea de código es la T1 de `specs/tareas.md`: el esqueleto con Vite, React, TypeScript, Tailwind y el marco visual. Las tareas posteriores, incluida la actualización del README con los pasos de ejecución, corresponden al mismo responsable y se realizan en el orden escrito.

## Ventajas e inconvenientes

El hecho de depositar el proceso en estos archivos presenta las siguientes ventajas:

- Los miembros del grupo comparten las mismas instrucciones, porque residen en Git y no en la conversación de una sola persona.
- La especificación y la configuración pueden revisarse mediante un diff, del mismo modo que el código.
- El comando y la skill evitan repetir en cada sesión la exigencia de leer la especificación y de respetar su alcance.
- El subagente implementador aísla la construcción de una tarea. El revisor, al ser de solo lectura, comprueba los criterios sin reescribir el trabajo.
- Las rules de aspecto y de API son breves y se incorporan cuando corresponden, de modo que una sesión dedicada a la ficha no arrastra el conjunto de las instrucciones.

Conviene señalar también los límites:

- Ninguno de estos archivos impide solicitar código en un chat que ignore `specs/`. El procedimiento depende de que se utilice el comando. La disciplina corresponde al equipo.
- Si una rule crece en exceso o queda desactualizada, el agente continúa aplicándola. Por eso el detalle permanece en `specs/` y las rules se limitan a remitir a esos archivos.
- Un subagente actúa cuando se le delega o cuando el agente principal decide hacerlo. El comando `/implementar-tarea` fija esa delegación para que no dependa de cada formulación.
- Hooks y MCP cubren otras necesidades, como bloquear un comando o conectar un servicio externo. Incorporarlos aquí añadiría un mecanismo que esta práctica no requiere.

## Bibliografía

- Customize Cursor: https://cursor.com/docs/customize-cursor
- Rules: https://cursor.com/docs/rules
- Agent Skills: https://cursor.com/docs/skills
- Subagents: https://cursor.com/docs/subagents
- Hooks: https://cursor.com/docs/hooks
- MCP: https://cursor.com/docs/mcp
- Ignore files: https://cursor.com/docs/reference/ignore-file
- Plan mode: https://cursor.com/docs/agent/plan-mode
- Tailwind CSS con Vite: https://tailwindcss.com/docs/installation/using-vite
- Variables de theme en Tailwind: https://tailwindcss.com/docs/theme
- PokeAPI v2: https://pokeapi.co/docs/v2
