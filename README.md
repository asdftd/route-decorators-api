## route-decorators for node
WIP!!
This is a fork from [buunguyen/route-decorators](https://github.com/buunguyen/route-decorators)

[ES7 decorators](https://github.com/wycats/javascript-decorators) that simplify route creation. Using these decorators, you can write your controllers like below and have all the routes populated. This is just an API which provides you the needed route objects, which you can use for your own router. Totally framework independent.

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
      this.router[method](url, ...middleware, this[fnName].bind(this))
    }
  }
}

@Controller(...)
class UserCtrl extends BaseCtrl {
  // decorated methods as above
}
```

### Decorators
 * `@Controller(path: optional, ...middleware: optional)`
 * `@Route(method, path: optional, ...middleware: optional)`
 * `@Head`, `@Options`, `@Get`, `@Post`, `@Put`, `@Patch`, `@Del`, `@Delete`, `@All`: wrappers of `@Route` that automatically supply the `method` argument.

### Test

```bash
npm install
npm test
```
