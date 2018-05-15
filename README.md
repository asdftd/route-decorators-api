## route-decorators for node
Work in Progress!!<br />
This is a fork from [buunguyen/route-decorators](https://github.com/buunguyen/route-decorators)

[ES7 decorators](https://github.com/wycats/javascript-decorators) that simplify route creation. Using these decorators, you can write your controllers like below and have all the routes populated. This is just an API which provides you the needed route objects, which you can use for your own router. Totally framework independent.

  - [Route Decorators](#route-decorators)
  - [Route Parameter Decorators](#route-parameter-decorators)
  - [Custom Route Parameter Decorators](#custom-route-parameter-decorators)
  - [Decorators](#decorators)

# Usage
1. Install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package:

    `npm install reflect-metadata --save`

    and import it somewhere in the global place of your app before any service declaration or import (for example in `app.ts`):

    `import "reflect-metadata";`

2. You may need to install node typings:

    `npm install @types/node --save`


3. Enabled following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Route Decorators
=============

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
    getIt(@RequestParam("reqpar") par, @Next() next)  {
      //do something
    }
```

for this to work you have to do 2 things:

1. Register a transformer Function which fits your needs (Framework specific)

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

Transformer functions are returning a function which has the function definition of your route functions<br />
Every Decorator has a appropriate Decoratortype, see all types: [DecoratorTypes](https://github.com/asdftd/route-decorators-api/blob/master/src/DecoratorType.ts)<br />

2. Apply the decorators

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

## !Be careful!
when you use route parameter decorators all other non decorated parameters will be undefined<br />
```js
    @Get("/getit")
    getIt(@RequestParam("a") a, b, @RequestParam("c") c) {
        console.log(a);
        console.log(b); // undefined
        console.log(c);
    }
```

Custom Route Parameter Decorators
=============

Readme coming soon ..

### Decorators
 * `@Controller(path: optional, ...middleware: optional)`
 * `@Route(method, path: optional, ...middleware: optional)`
 * `@Head`, `@Options`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Del`, `@Delete`, `@All`: wrappers of `@Route` that automatically supply the `method` argument.
 * `@RequestParam(paramName, ...validators: optional)`
 * `@Request()`
 * `@Response()`
 * `@Body()`
 * `@Next()`
 * .. more coming, feel free to suggest/pr

### Test

```bash
npm install
npm test
```
