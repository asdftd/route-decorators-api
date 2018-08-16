import {DecoratorProcessor} from "./DecoratorProcessor";

const PREFIX = '$$route_'

function destruct(args) {
  const hasPath = typeof args[0] === 'string';
  const path = hasPath ? args[0] : '';
  const middleware = hasPath ? args.slice(1) : args;

  if(middleware.some(m => typeof m !== 'function')) {
    throw new Error('Middleware must be function');
  }

  return [path, middleware];
}

// @route(method, path: optional, ...middleware: optional)
export function Route(method, ...args) {
  if(typeof method !== 'string') {
    throw new Error('The first argument must be an HTTP method')
  }

  const [path, middleware] = destruct(args);

  return function(target, name, propertyDescriptor) {
    if (!isObjectOrFunction(target) || typeof name !== "string"  || typeof propertyDescriptor !== "object" || arguments.length !== 3) {
      throw new Error("@Route or @<HttpMethod> must be declared on a class function");
    }
    target[`${PREFIX}${name}`] = {method, path, middleware}
  }
}

export type RouteMethodSignature = (path?: string, ...middleware: any[]) => (target: any, name: any) => void

// @[method](...args) === @route(method, ...args)
// const methods = ['head', 'options', 'get', 'post', 'put', 'patch', 'del', 'delete', 'all']

export const Head: RouteMethodSignature = Route.bind(null, "head");
export const Options: RouteMethodSignature = Route.bind(null, "options");
export const Get: RouteMethodSignature = Route.bind(null, "get");
export const Post: RouteMethodSignature = Route.bind(null, "post");
export const Put: RouteMethodSignature = Route.bind(null, "put");
export const Patch: RouteMethodSignature = Route.bind(null, "patch");
export const Del: RouteMethodSignature = Route.bind(null, "del");
const deleteRoute: RouteMethodSignature = Route.bind(null, "delete");
export {deleteRoute as Delete };
export const All: RouteMethodSignature = Route.bind(null, "all");


// @Controller(path: optional, ...middleware: optional)
export function Controller(path?: string, ...middleware: any[]) {

  const args = !path ? [...middleware] : [path, ...middleware];
  const [ctrlPath, ctrlMiddleware] = destruct(args);

  return function(target) {
    if (!isObjectOrFunction(target) || arguments.length !== 1) {
      throw new Error("@Controller must be declared on a class");
    }
    const proto = target.prototype;
    proto.$routes = Object.getOwnPropertyNames(proto)
      .filter(prop => prop.indexOf(PREFIX) === 0)
      .map(prop => {
        const {method, path, middleware: actionMiddleware} = proto[prop]
        const url = `${ctrlPath}${path}`
        const middleware = ctrlMiddleware.concat(actionMiddleware)
        const fnName = prop.substring(PREFIX.length)
        return {method: method === 'del' ? 'delete' : method, url, middleware, fnName}
      });
  }
}

function isObjectOrFunction(target: any){
  return typeof target === 'object' || typeof target === 'function';
}
