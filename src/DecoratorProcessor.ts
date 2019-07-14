import {PREFIX} from "./Decorators";

export class DecoratorProcessor {
    private static processorFunctions = new Map<string, any>();

    public static applyDecorators(target: any) {
        Object.entries(target[PREFIX]).forEach(
            ([funcName, decoParams]) =>
                target[funcName] = this.getFunc(target[funcName], decoParams, target)
        );
    }

    private static getFunc(sourceFunc, decorators, thisValue) {
        //this func will be executed
        return function(...args: any[]) {
            const params: any[] = DecoratorProcessor.getParamsForFunc(args, decorators);
            return sourceFunc.call(thisValue, ...params);
        }.bind(this);
    }

    private static getParamsForFunc(args: any[], decorators) {
        let params = [];
        Object.entries(decorators).forEach(
            ([key, value]) =>
                params[key] = this.processorFunctions.get((value as any).type)(...((value as any).values || []))(...(args || []))
        );
        return params;
    }

    public static registerProcessorFunction(decoratorType: string, procFunc: Function) {
        this.processorFunctions.set(decoratorType, procFunc);
    }

    public static reset(){
        this.processorFunctions = new Map<string, any>();
    }
}