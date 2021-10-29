import {DecoratorProcessor, DecoratorType, Next, RequestParam, Body, QueryParam, Response, Request, Get, Controller} from "../src";
import {assert} from "chai";

beforeEach(() => {
    DecoratorProcessor.reset();
});

describe('Parameter Decorators', () => {
    it('should work in conjunction', () => {

        registerTransformer("val1", DecoratorType.NEXT);
        registerTransformer("val2", DecoratorType.REQUEST_PARAM);
        registerTransformer("val3", DecoratorType.BODY);
        registerTransformer("val4", DecoratorType.QUERY_PARAM);
        registerTransformer("val5", DecoratorType.RESPONSE);
        registerTransformer("val6", DecoratorType.REQUEST);

        class Ctrl extends BaseTest {
            test(@Next() next, @RequestParam("reqparam") reqParam, @Body() body, @QueryParam("queryparam") queryParam, @Response() resp, @Request() req): any {
                assert.equal(next, "val1");
                assert.equal(reqParam, "val2");
                assert.equal(body, "val3");
                assert.equal(queryParam, "val4");
                assert.equal(resp, "val5");
                assert.equal(req, "val6");
                return "returnvalue";
            }
        }
        const returnValue = new Ctrl().test("notused", "notused", "notused", "notused", "notused", "notused");
        assert.equal("returnvalue", returnValue, "Returned value from function stays the same");
    });
});



describe('Parameter and Route Decorators', () => {
    it('should work in conjunction', () => {
        registerTransformer("val1", DecoratorType.NEXT);
        registerTransformer("val2", DecoratorType.REQUEST_PARAM);
        registerTransformer("val3", DecoratorType.BODY);
        registerTransformer("val4", DecoratorType.QUERY_PARAM);
        registerTransformer("val5", DecoratorType.RESPONSE);
        registerTransformer("val6", DecoratorType.REQUEST);

        @Controller()
        class Ctrl extends BaseTest {
            @Get()
            testFunc(@Next() next, @RequestParam("reqparam") reqParam, @Body() body, @QueryParam("queryparam") queryParam, @Response() resp, @Request() req): any {
                assert.equal(next, "val1");
                assert.equal(reqParam, "val2");
                assert.equal(body, "val3");
                assert.equal(queryParam, "val4");
                assert.equal(resp, "val5");
                assert.equal(req, "val6");
                return "returnvalue";
            }
        }
        const ctrl = new Ctrl();
        assert.equal((<any>ctrl).$routes[0].fnName, "testFunc");
        const returnValue = ctrl.testFunc("notused", "notused", "notused", "notused", "notused", "notused");
        assert.equal("returnvalue", returnValue, "Returned value from function stays the same");
        
    });
});

function registerTransformer(returnValue: any, decoratorType: string){

    function transformer() {
        return function() {
            return returnValue;
        }
    }
    DecoratorProcessor.registerProcessorFunction(decoratorType, transformer);
}

class BaseTest {
    constructor() {
        DecoratorProcessor.applyDecorators(this);
    }
}