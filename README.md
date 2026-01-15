# Electronic Counters in React

Electronic Counters in React es una herramienta web para el **diseño y análisis de contadores digitales síncronos** basada en Flip-Flops. La aplicación permite configurar un contador, generar su lógica de funcionamiento y visualizar sus distintas representaciones utilizadas en electrónica digital, todo desde una interfaz interactiva desarrollada con React.

Este proyecto está orientado al aprendizaje, análisis y validación de sistemas secuenciales digitales.

---

## Acceso a la aplicación

La versión en producción del proyecto está disponible en:

https://vercel.com/diegotercerodev-9412s-projects/v0-electronic-counters-in-react

---

## Descripción general

La aplicación funciona como un **Diseñador de Contadores Digitales**, permitiendo al usuario definir los parámetros principales de un contador síncrono y generar automáticamente su comportamiento lógico y estructural.

A partir de la configuración ingresada, el sistema procesa la información y produce representaciones clave utilizadas en el diseño digital, facilitando la comprensión del funcionamiento interno del contador.

---

## Configuración del contador

El usuario puede definir los siguientes parámetros antes de generar el contador:

- Tipo de contador: Síncrono  
- Elementos de memoria: Flip-Flops  
- Número máximo de estados: hasta 8  
- Rango de conteo: de 0 a 7  

Una vez configurados estos valores, el sistema queda listo para generar el contador y sus módulos de análisis.

---

## Generación del contador

Al ejecutar la opción **Generar Contador**, la aplicación calcula automáticamente la lógica del sistema y habilita las siguientes secciones:

---

## Diagrama de Estados

Representa gráficamente los estados del contador y las transiciones entre ellos.  
Permite analizar el flujo secuencial del sistema y verificar visualmente el ciclo de conteo.

---

## Tablas de Estado

Muestran la relación entre el estado presente y el estado siguiente del contador.  
Estas tablas sirven como base para el análisis lógico y el diseño de las funciones de control.

---

## Tabla de Transición

Describe de forma estructurada cómo evoluciona el contador entre estados en cada ciclo de reloj.  
Es un elemento fundamental para el diseño y verificación de sistemas secuenciales.

---

## Mapas de Karnaugh

Genera los mapas de Karnaugh correspondientes a cada Flip-Flop.  
Estos mapas permiten simplificar las funciones booleanas necesarias para implementar el contador de manera eficiente.

---

## Circuitos de Compuertas

A partir de las funciones lógicas simplificadas, la aplicación construye la representación del circuito a nivel de compuertas lógicas, mostrando cómo se implementa el contador en hardware digital.

---

## Diagrama Esquemático Completo

Integra todos los elementos del diseño en un solo esquema:

- Flip-Flops
- Compuertas lógicas
- Señales y conexiones

Este diagrama ofrece una visión completa del sistema, desde la lógica de control hasta su estructura final.

---

## Tecnologías utilizadas

- React  
- JavaScript (ES6+)  
- Vercel  

---

## Aplicaciones y utilidad

- Apoyo didáctico en cursos de electrónica digital  
- Diseño y análisis de contadores síncronos  
- Comprensión de la relación entre tablas, mapas y circuitos  
- Integración de conceptos de hardware con desarrollo frontend  

---

## Autor

Diego Tercero  
Estudiante de Ingeniería en Cibernética Electrónica  

---

## Licencia

Este proyecto se desarrolla con fines educativos.  
Puede utilizarse, modificarse y adaptarse libremente para aprendizaje y experimentación.

