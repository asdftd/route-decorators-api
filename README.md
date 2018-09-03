## API for route decorators

This is a fork from [buunguyen/route-decorators](https://github.com/buunguyen/route-decorators)

[ES7 decorators](https://github.com/wycats/javascript-decorators) that simplify route creation. Using these decorators, you can write your controllers like below and have all the routes populated. This is just an API which provides you the needed route objects, which you can use for your own router. Totally framework independent.

  - [Route Decorators](#route-decorators)
  - [Route Parameter Decorators](#route-parameter-decorators)
  - [Custom Route Parameter Decorators](#custom-route-parameter-decorators)
  - [Decorators](#decorators)

# Usage
1. Install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package:

    `npm install reflect-metadata --save`

    and import it somewhere in the global place of your app before any decorator usage or import (for example in `app.ts`):

    `import "reflect-metadata";`

2. You may need to install node typings:

    `npm install @types/node --save`


3. Enabled following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Route Decorators
==============

__Koa__
```js
import {Controller, Get, Post} from 'generic-route-decorators'

@Controller('/users', middleware1)
class UserCtrl {

  @Get('/:id', middleware2, middleware3)
  async get(context, next) {}

  @Post(middleware2)
  async post(context, next) {}
}
```

__Express__
```js
import {Controller, Get, Post} from 'generic-route-decorators'

@Controller('/users', middleware1)
class UserCtrl {

  @Get('/:id', middleware2, middleware3)
  async get(req, res, next) {}

  @Post(middleware2)
  async post(req, res, next) {}
}
```

Once the decorators are applied, every controller instance will receive a `$routes` array, which you can use to define actual Koa/Express routes.

Assume the above `UserCtrl` definition, you can define routes in `UserCtrl`'s constructor (although really you can put the code anywhere) as follows:

__Koa__
```js
import * as Router from "koa-router";

// Inside controller constructor
this.router = new Router()
for (const {method, url, middleware, fnName} of this.$routes) {
  this.router[method](url, ...middleware, this[fnName].bind(this))
}
```

__Express__
```js
import express from 'express'

// Inside controller constructor
this.router = express.Router()
for (const {method, url, middleware, fnName} of this.$routes) {
  this.router[method](url, ...middleware, (req, res, next) => {
    this[fnName](req, res, next).catch(next)
  })
}
```

You can move the above logic to some base controller in your app and reuse it for every controller. For example:

```js
class BaseCtrl {
  constructor() {
    this.router = new Router()
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, this[fnName].bind(this));
    }
  }
}

@Controller(...)
class UserCtrl extends BaseCtrl {
  // decorated methods as above
}
```
Route Parameter Decorators
=============

Example:

```js
    @Get("/getit")
    async getIt(@RequestParam("reqpar") par, @Next() next)  {
      //do something
    }
```
  
to make use of the decorators you have to do 2 things:  
  
 * Register a transformer Function which fits your needs (Framework specific)  
  
__Express__

```js
import {DecoratorType, DecoratorProcessor} from 'generic-route-decorators';
.
.
export function ExpressParamTransformer(param: string, ...validators: Function[]) {

    return function(req, res, next) {
        return req.params[param];
    }
}
DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, ExpressParamTransformer);
```

__Koa__

```js
export function KoaParamTransformer(param: string, ...validators: Function[]) {

    return function(ctx, next) {
        return ctx.request[param];
    }
}
DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, KoaParamTransformer);
```

Transformer functions are returning a function which has the function definition of your route functions  
Every Decorator has a appropriate Decoratortype, see all types: [DecoratorTypes](https://github.com/asdftd/route-decorators-api/blob/master/src/DecoratorType.ts)

 * Apply the decorators

```js
import {DecoratorProcessor} from 'generic-route-decorators';
.
.
.
    constructor() {
        DecoratorProcessor.applyDecorators(this);
    }
```

Recommened use in same base controller for routes
```js
class BaseCtrl {
  constructor() {
    DecoratorProcessor.applyDecorators(this);
    this.router = new Router()
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, this[fnName].bind(this));
    }
  }
}
```
Can also be used without route parameters:

```js
class BaseTest {
  constructor() {
    DecoratorProcessor.applyDecorators(this);
    }
}

function TestParamTransformer(param: string, ...validators: Function[]) {
  return function(req, res, next) {
    console.log(req); //1
    console.log(res); //2
    console.log(next); //3
    console.log(param); //abc
    return "test"+req+res+next+"test"+param;
  }
}

DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM,TestParamTransformer);
class Ctrl extends BaseTest {
  reqParamTest(@RequestParam("abc") a: any): void {
    console.log(a); //test123testabc
  }
}
let testReq = 1;
let testRes = 2;
let testNext = 3;
new Ctrl().reqParamTest(testReq, testRes, testNext);
```

Custom Route Parameter Decorators
=============

```js
import {setDecorator, DecoratorProcessor} from "generic-route-decorators";

// register the decorator with unique string value
const customDecoratorIdentifier="EveryDecoratorHasItsOwnIdentifierString";

//first define your decorator function
export function CustomDecorator(value: any) { // define your own parameters

    // call the static setDecorator function with given values and your identifier
    // the last parameter is an array from your parameter values
    return (target: any, propertyKey: string, index: number) => { 
        setDecorator(target, propertyKey, index, customDecoratorIdentifier, [value]);
    };
}

// define processor function
export function decoratorProcessorFunction(value: any){
    return function(req, res, next) {
        return value+"4";
    }
}

// set function for decorator with unique decorator identifier
DecoratorProcessor.registerProcessorFunction(customDecoratorIdentifier, decoratorProcessorFunction);

// use it
export class SomeClass {

    constructor() {
        DecoratorProcessor.applyDecorators(this);
    }

    async example(@CustomDecorator("some123") abc: any): void {
        console.log(abc); //some1234
    }
}
```
## Recommened usage with Typescript

As the decorators can also be used without a framework (for whatever use case you may have) here are tips for typescript usage.

* Type safety in the processor function:
```js
import {SomeVeryComplicatedObject, ReturnObject} from "./somewhere";
import {setDecorator, DecoratorProcessor} from "generic-route-decorators";

const customDecoratorIdentifier="EveryDecoratorHasItsOwnIdentifierString";

export function CustomDecorator(value: any) {

    return (target: any, propertyKey: string, index: number) => { 
        setDecorator(target, propertyKey, index, customDecoratorIdentifier, [value]);
    };
}

export function decoratorProcessorFunction(value: any){
    return function(param: SomeVeryComplicatedObject) {
        if(param instanceof SomeVeryComplicatedObject === false){
          throw new Error("You need to call the function with the right type");
        }
        // we can be sure now that param is SomeVeryComplicatedObject
        return param.getAntotherObject(); // return ReturnObject type
    }
}

DecoratorProcessor.registerProcessorFunction(customDecoratorIdentifier, decoratorProcessorFunction);
```

* Type safety in the consuming function:  
Define the parameter as union type, so it can be called type safe with the calling parameter object and also be consumed as the type which the processor function returns (in this case the ReturnObject).  
Optionally you can use instanceof to check the type at runtime.

```js
export class SomeClass {

    constructor() {
        DecoratorProcessor.applyDecorators(this);
    }

    example(@CustomDecorator("123") result: SomeVeryComplicatedObject | ReturnObject): void {
        result = result as ReturnObject;
        console.log(result); // work with ReturnObject type
        return result;
    }
}

let myObject: SomeVeryComplicatedObject = new SomeVeryComplicatedObject();

new SomeClass().example(myObject);
```

## Additional Notes
when you use route parameter decorators all other non decorated parameters will be undefined  
```js
    @Get("/getit")
    async getIt(@RequestParam("a") a, b, @RequestParam("c") c) {
        console.log(a);
        console.log(b); // undefined
        console.log(c);
    }
```

__No decorator has built-in error handling, it's all up to you.__
# Decorators
## Class

 * `@Controller(path: optional, ...middleware: optional)`
  
## Method

 * `@Route(method, path: optional, ...middleware: optional)`
 * `@Head`, `@Options`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Del`, `@Delete`, `@All`: wrappers of `@Route` that automatically supply the `method` argument.
  
## Method parameters

 * `@RequestParam(paramName, ...validators: optional)`
 * `@QueryParam(paramName, ...validators: optional)`
 * `@Request()`
 * `@Response()`
 * `@Body()`
 * `@Next()`

##

 * And every Decorator you can think of ;-)
 * .. more coming, feel free to suggest/pr

### Test

```bash
npm install
npm test
```
