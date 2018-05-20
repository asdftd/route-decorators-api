import {Post, Get, Controller, All, Route, Del} from '../src/RouteDecorators';
import {DecoratorProcessor} from '../src/DecoratorProcessor';
import {DecoratorType} from '../src/DecoratorType';

import {assert} from 'chai';
import {RequestParam, PREFIX} from '../src/Decorators';

describe('Param Decorators', () => {
  describe('@RequestParam', () => {

    it('should add correct metadata to class', () => {
      function ab(){}
      class Ctrl extends BaseTest {
        reqParamTest(@RequestParam("aab", ab) a: any): void {}
      }
      let meta = new Ctrl()[PREFIX];

      assert.isObject(meta.reqParamTest);
      assert.equal(meta.reqParamTest["0"].type, "__requestparam__");
      assert.isArray(meta.reqParamTest["0"].values);

      assert.deepEqual(meta.reqParamTest["0"].values, ["aab", [ab]]);
      // { reqParamTest: { '0': { type: '__requestparam__', values: [Array] } } }
    });

    it('should pass the input parameter from decorator to transformer function', () => {
      function TestParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          assert.equal(param, "aab");
          return param;
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, TestParamTransformer);
      class Ctrl extends BaseTest {
        reqParamTest(@RequestParam("aab") a: any): void {}
      }
      new Ctrl().reqParamTest("123");
    });

    it('should pass the source parameters to the transformer function', () => {
      let testReq = {params: {aa: "aa12", cc: "cc12"}, body: {msg: 1}};
      function TestParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          assert.deepEqual(req, {params: {aa: "aa12", cc: "cc12"}, body: {msg: 1}});
          return param;
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, TestParamTransformer);
      class Ctrl extends BaseTest {
        reqParamTest(@RequestParam("aab") a: any): void {}
      }
      new Ctrl().reqParamTest(testReq);
    });

    it('should execute and return the transformer functions value', () => {
      function TestParamTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          return param+"123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.REQUEST_PARAM, TestParamTransformer);
      class Ctrl extends BaseTest {
        reqParamTest(@RequestParam("aab") a: any): void {
          assert.equal(a, "aab123");
        }
      }
      new Ctrl().reqParamTest("123");
    });

  });
  describe('@Body', () => {

    it('should work', () => {
      function TestBodyTransformer(param: string, ...validators: Function[]) {
        return function(req, res, next) {
          return param+"123";
        }
      }
      DecoratorProcessor.registerProcessorFunction(DecoratorType.BODY, TestBodyTransformer);

    });
  });
});

class BaseTest {
  constructor() {
    DecoratorProcessor.applyDecorators(this);
  }
}