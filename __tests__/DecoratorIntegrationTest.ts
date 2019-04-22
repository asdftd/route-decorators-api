import {DecoratorProcessor, DecoratorType, Next, RequestParam, Body, QueryParam, Response, Request, Get, Controller} from "../src";
import {assert} from "chai";

beforeEach(() => {
    DecoratorProcessor.reset();
});

describe('Parameter Decorators', () => {
    it('should work in conjunction', () => {

        registerTransformer("val1", DecoratorType.NEXT, "1");
        registerTransformer("val2", DecoratorType.REQUEST_PARAM, "2");
        registerTransformer("val3", DecoratorType.BODY, "3");
        registerTransformer("val4", DecoratorType.QUERY_PARAM, "4");
        registerTransformer("val5", DecoratorType.RESPONSE, "5");
        registerTransformer("val6", DecoratorType.REQUEST, "6");

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
        const returnValue = new Ctrl().test("1", "2", "3", "4", "5", "6");
        assert.equal("returnvalue", returnValue, "Returned value from function stays the same");
    });
});



describe('Parameter and Route Decorators', () => {
    it('should work in conjunction', () => {
        registerTransformer("val1", DecoratorType.NEXT, "1");
        registerTransformer("val2", DecoratorType.REQUEST_PARAM, "2");
        registerTransformer("val3", DecoratorType.BODY, "3");
        registerTransformer("val4", DecoratorType.QUERY_PARAM, "4");
        registerTransformer("val5", DecoratorType.RESPONSE, "5");
        registerTransformer("val6", DecoratorType.REQUEST, "6");

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
        const ctrl = (<any>new Ctrl());
        assert.equal(ctrl.$routes[0].fnName, "testFunc");
        const returnValue = ctrl["testFunc"].bind(this)("1", "2", "3", "4", "5", "6");
        assert.equal("returnvalue", returnValue, "Returned value from function stays the same");
        
    });
});

function registerTransformer(returnValue: any, decoratorType: string, assertInputValue: any){

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