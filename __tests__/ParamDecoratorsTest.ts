import {DecoratorProcessor} from '../src/DecoratorProcessor';
import {DecoratorType} from '../src/DecoratorType';

import {assert} from 'chai';
import {RequestParam, PREFIX, Body, Request, Response, QueryParam, Next} from '../src/Decorators';

beforeEach(() => {
  DecoratorProcessor.reset();
});

describe('Parameter Decorators', () => {

  it('should return the original function return value', () => {
    function testBodyTransformer() {
      return function(req, res, next) {
        assert.equal(req, "123");
        return "Body123";
      }
    }
    DecoratorProcessor.registerProcessorFunction(DecoratorType.BODY, testBodyTransformer);
    class Ctrl extends BaseTest {
      test(@Body() a: string | any): any {
        assert.equal(a, "Body123");
        return a;
      }
    }
    const returnValue = new Ctrl().test("123");
    assert.equal(returnValue, "Body123");
  });

  describe('@RequestParam', () => {

    it('should add correct metadata to class', () => {
      function ab() {}
      class Ctrl extends BaseTest {
        test(@RequestParam("aab", ab) a: any): void {}
      }
      let meta = new Ctrl()[PREFIX];

      assert.isObject(meta.test);
      assert.equal(meta.test["0"].type, "__requestparam__");
      assert.isArray(meta.test["0"].values);

      assert.deepEqual(meta.test["0"].values, ["aab", [ab]]);
      // { test: { '0': { type: '__requestparam__', values: [Array] } } }
    });

    it('should pass the input parameter from decorator to transformer function', () => {
      function testParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          assert.equal(param, "aab");
          return param;
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, testParamTransformer);
      class Ctrl extends BaseTest {
        test(@RequestParam("aab") a: any): void {}
      }
      new Ctrl().test("123");
    });

    it('should pass the source parameters to the transformer function', () => {
      let testReq = {params: {aa: "aa12", cc: "cc12"}, body: {msg: 1}};
      function testParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          assert.deepEqual(req, {params: {aa: "aa12", cc: "cc12"}, body: {msg: 1}});
          return param;
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, testParamTransformer);
      class Ctrl extends BaseTest {
        test(@RequestParam("aab") a: any): void {}
      }
      new Ctrl().test(testReq);
    });

    it('should execute and return the transformer functions value', () => {
      function testParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          return param + "123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, testParamTransformer);
      class Ctrl extends BaseTest {
        test(@RequestParam("aab") a: any): void {
          assert.equal(a, "aab123");
        }
      }
      new Ctrl().test("123");
    });

  });
  describe('@Body', () => {

    it('should execute and return the transformer functions value', () => {
      function testBodyTransformer() {
        return function(req, res, next) {
          assert.equal(req, "123");
          return "Body123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.BODY, testBodyTransformer);
      class Ctrl extends BaseTest {
        test(@Body() a: string | any): void {
          assert.equal(a, "Body123");
        }
      }
      new Ctrl().test("123");
    });
  });
  describe('@Request', () => {

    it('should execute and return the transformer functions value', () => {
      function requestTransformer() {
        return function(req, res, next) {
          assert.equal(req, "123");
          return "Req123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST, requestTransformer);
      class Ctrl extends BaseTest {
        test(@Request() a: string | any): void {
          assert.equal(a, "Req123");
        }
      }
      new Ctrl().test("123");
    });
  });

  describe('@Response', () => {

    it('should execute and return the transformer functions value', () => {
      function responseTransformer() {
        return function(req, res, next) {
          assert.equal(req, "123");
          return "Response123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.RESPONSE, responseTransformer);
      class Ctrl extends BaseTest {
        test(@Response() a: string | any): void {
          assert.equal(a, "Response123");
        }
      }
      new Ctrl().test("123");
    });
  });

  describe('@QueryParam', () => {

    it('should execute and return the transformer functions value', () => {
      function queryParamTransformer(name: string, ...validators: Function[]) {
        assert.equal(name, "getThisParam");
        return function(req, res, next) {
          assert.equal(req, "123");
          return "QueryParam123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.QUERY_PARAM, queryParamTransformer);
      class Ctrl extends BaseTest {
        
        test(@QueryParam("getThisParam") a: string | any): void {
          assert.equal(a, "QueryParam123");
        }
      }
      new Ctrl().test("123");
    });
  });

  describe('@Next', () => {

    it('should execute and return the transformer functions value', () => {
      function nextTransformer() {
        return function(req, res, next) {
          assert.equal(req, "123");
          return "Next123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.NEXT, nextTransformer);
      class Ctrl extends BaseTest {
        test(@Next() a: any): void {
          assert.equal(a, "Next123");
        }
      }
      new Ctrl().test("123");
    });
  });
});

class BaseTest {
  constructor() {
    DecoratorProcessor.applyDecorators(this);
  }
}