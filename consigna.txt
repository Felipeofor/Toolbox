Choice Técnico- FULL STACK
Ver en formato PDF: https://cs1.ssltrust.me/s/YeaQjE8XFljaMxv

---
CODE CHALLENGE

El JavaScript challenge para Full Stack está dividido en 3 partes:
1) Un API usando Node + Express
2) Un Frontend cliente usando Bootstrap + React
3) Puntos opcionales para el challenge


¿Que tomamos en cuenta al revisar el challenge?
- El código entregado tiene que funcionar y cumplir con lo solicitado.
- Las instrucciones y documentación deben ser prolijas y claras.
- Debe cumplir con los requisitos técnicos solicitados (incluir las librerias/frameworks específicos, versiones pedidas, test, instrucciones para correrlo, documentación, etc).
- Los puntos opcionales no restan en caso de no entregarse o no cumplir lo esperado, pero suman en caso de estar bien.


¿Que hacer si tengo dudas sobre algo de lo pedido?
Ponte en contacto con la persona que te envió el challenge, es preferible aclarar dudas antes de enviar mal el challenge y también nos ayuda a mejorar las consignas.


¿Como envío el challenge?
Debes dejar tu código en un repo git publico o uno al cual podamos acceder y luego enviarle la información a la persona que te envió este examen (url y datos de acceso).

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

OBJETIVO

El siguiente diagrama de secuencia (ver link) muestra cómo es el el flujo de las peticiones de información para este ejercicio: https://cs1.ssltrust.me/s/6u9aC5hCTEhTpT1
Si bien el formateo del contenido de archivos no es una llamada REST, el diagrama la incluye porque es una parte fundamental de este desafío.

Este challenge te pide desarrollar un frontend que consumirá datos de un API que también deberás desarrollar.
El frontend deberá mostrar la información obtenida respetando las pautas que se describirán más abajo.
Así mismo la API también debe ser desarrollada siguiendo requisitos explícitos.

EL API Externo es provisto por nosotros y sólo debe ser consumido.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

1) API

El API a desarrollar, es un API REST que toma información de un API externa y la reformatea para exponerla.
El API Externo de la cual se toma la información está documentada en el siguiente Swagger: https://echo-serv.tbxnet.com/explorer/#/Secret
Para poder utilizarla, la API Key es: "Bearer aSuperSecretKey".

Los métodos a utilizar están en la sección "Secret" de la documentación del Swagger, pero a modo de resumen se indican a continuación:

- Para listar los archivos
$ curl -X GET https://echo-serv.tbxnet.com/v1/secret/files -H 'authorization: Bearer aSuperSecretKey'
{
"files":["file1.csv",....]
}


- Para descargar un archivo
$ curl -X GET https://echo-serv.tbxnet.com/v1/secret/file/file1.csv -H 'authorization: Bearer aSuperSecretKey'


- Formato del archivo
Los archivos siguen el formato CSV estricto con las siguientes columnas:
- file: el nombre del archivo.
- text: un texto de largo variable
- number: un número
- hex: un hexadecimal de 32 dígitos

Ejemplo del contenido de un archivo con información correctamente formateada:

file,text,number,hex
file1.csv,RgTya,64075909,70ad29aacf0b690b0467fe2b2767f765
file1.csv,AtjW,6,d33a8ca5d36d3106219f66f939774cf5
file1.csv,PNzRfORtKtEDOzmIVrQuSh,74088708,3e29651a63a5202a5661e05a060401fb
file1.csv,d,6173,f9e1bcdb9e3784acc448af34f4727252


- Para procesar la información

1) Se deben llamar al listado de archivos /v1/secret/files
2) Descargar cada file usando /v1/secret/file/{file}
3) Formatear la información en los CSV:

Tener en cuenta que:
- Pueden existir archivos vacíos y líneas con error (que no tenga la cantidad de datos suficientes).
- Si una línea tiene error se debe descartar la misma.
- También pueden existir errores al descargar un archivo.


Se debe entonces crear el API para funcionar desde el endpoint 'GET /files/data' usando NodeJs + ExpressJs.
Este endpoint es el encargado de buscar los archivos y formatear la información tal como se indicó en los pasos descriptos previamente.
Toda la información generada por el API deberá ser definida como content-type: application/json.

Ejemplo usando curl (llamada y respuesta):
$ curl -v -X GET "http://apihost/files/data" -H "accept: application/json"

> GET /files/data HTTP/1.1
> Host: apihost
> User-Agent: curl/7.68.0
> accept: application/json
>
< HTTP/1.1 200 OK
< Date: Mon, 19 Oct 2020 15:18:53 GMT
< Content-Type: application/json; charset=utf-8
< Content-Length: 15
< Connection: keep-alive
[
{
"file": "file1.csv",
"lines": [
{
"text" :"RgTya",
"number": 64075909,
"hex": "70ad29aacf0b690b0467fe2b2767f765"
},
. . .
]
}
]


También se deben crear los tests que validan el API usando Mocha + Chai.
Los tests deben poder correrse usando npm test y el API debe poder iniciarse usando npm start.


REQUISITOS TÉCNICOS API

- El código que envíes debe correr usando NodeJS 14 y no depender de librerías que están instaladas de forma global, variables de entorno o configuraciones de algún sistema operativo especifico.

- El código debe ser escrito en JavaScript (ES6+), no utilizar: Babel, TypeScript, Dart, Elm, etc.

- En cuanto a las librerías y frameworks, puedes usar la versión que consideres apropiadas:

ExpressJs https://expressjs.com/

Mocha https://mochajs.org/

Chai https://www.chaijs.com/

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

2) FRONT

Deberás desarrollar una App en React que deberá actuar como cliente del API ya desarrollado y que permita ver la información de /files/data de manera ordenada en pantalla.

LAYOUT
Usando React + React Bootstrap se debe crear una pantalla similar a la que se muestra en este wireframe (ver link): https://cs1.ssltrust.me/s/ECH9VusiMmi3ac1


REQUISITOS TÉCNICOS FRONTEND
- Se deberá usar programación funcional y Hook Effects en React.

- El código que envíes debe correr usando NodeJS 16 y no depender de librerías instaladas de forma global, variables de entorno o configuraciones de algún sistema operativo especifico.

- El código debe ser escrito en JavaScript (ES6+).

- No están permitidas las siguientes herramientas: TypeScript, Dart, Elm, ni similares.

- En cuanto a las librerías y frameworks, puedes usar la versión que consideres apropiadas de:

Webpack https://webpack.js.org/

React https://reactjs.org/

React Bootstrap https://react-bootstrap.github.io/


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

3) PUNTOS OPCIONALES

API
- Un endpoint GET /files/list que dé como respuesta la lista de archivos disponibles tal cual como se la muestra en el API Externa.

- Agregar un filtro por queryparam para poder pedir los datos de un archivo especifico: /files/data?fileName=<Nombre del archivo>.

- Usar StandarJs JavaScript Standard Style.


FRONTEND
- Usar Redux Redux - A predictable state container for JavaScript apps. | https://redux.js.org/.

- Test unitarios usando Jest | https://jestjs.io/.

- Poder filtrar por "fileName" usando el punto opcional del API de listado de archivos y filtro por queryparam.


GLOBAL
- Usar Docker o Docker Compose para correr las apps.