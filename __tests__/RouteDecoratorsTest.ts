import {Post, Get, Controller, All, Route, Del} from '../src/RouteDecorators';

import {assert} from 'chai';

function m1() {}
function m2() {}
function m3() {}
function m4() {}

describe('Controller and Routes', () => {

  it('should add $routes', () => {
    @Controller()
    class Ctrl {}

    assert.deepEqual((<any>new Ctrl()).$routes, [])
  })

  it('should throw if @controller is given non-function middleware', () => {
    assert.throws(() => {
      @Controller("/1", 1234)
      class Ctrl {}
    }, Error, 'Middleware must be function')
  })

  it('should throw if @route is given non-function middleware', () => {
    assert.throws(() => {
      @Controller()
      class Ctrl {
        @Route('get', 1) _get() {}
      }
    }, Error, 'Middleware must be function')
  })

  it('should define correct $routes', () => {
    @Controller()
    class Ctrl {
      @All() _all() {}
    }

    assert.deepEqual((<any>new Ctrl()).$routes, [
      {url: '', middleware: [], method: 'all', fnName: '_all'}
    ])
  })

  it('should define correct $routes when paths are specified', () => {
    @Controller('/prefix')
    class Ctrl {
      @All('/all') _all() {}
    }

    assert.deepEqual((<any>new Ctrl()).$routes, [
      {url: '/prefix/all', middleware: [], method: 'all', fnName: '_all'}
    ])
  })

  it('should normalize `del` to `delete`', () => {
    @Controller()
    class Ctrl {
      @Route('del', '/delete1') _delete1() {}
      @Del('/delete2') _delete2() {}
    }

    assert.deepEqual((<any>new Ctrl()).$routes, [
      {url: '/delete1', middleware: [], method: 'delete', fnName: '_delete1'},
      {url: '/delete2', middleware: [], method: 'delete', fnName: '_delete2'}
    ])
  })

  it('should define correct $routes when paths and middleware are specified', () => {
    @Controller('/users', m1, m2)
    class Ctrl {
      @All() _all() {}
      @Get('/get') _get() {}
      @Post('/post', m3) _post() {}
      @Route('delete', '/delete', m3, m4) _delete() {}
    }

    assert.deepEqual((<any>new Ctrl()).$routes, [
      {url: '/users', middleware: [m1, m2], method: 'all', fnName: '_all'},
      {url: '/users/get', middleware: [m1, m2], method: 'get', fnName: '_get'},
      {url: '/users/post', middleware: [m1, m2, m3], method: 'post', fnName: '_post'},
      {url: '/users/delete', middleware: [m1, m2, m3, m4], method: 'delete', fnName: '_delete'}
    ])
  })
})
