import {DecoratorType} from "./DecoratorType";
export const PREFIX = "$$__decorators$"; 

export function RequestParam(name: string, ...validators: Function[]) {
    if(!name) throw new Error("A name must be defined for the Request parameter");
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.REQUEST_PARAM, [name, validators]);
    };
}

export function Body() {
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.BODY);
    };
}

export function Next() {
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.NEXT);
    };
}

export function Request() {
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.REQUEST);
    };
}

export function Response() {
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.RESPONSE);
    };
}

export function QueryParam(name: string, ...validators: Function[]) {
    if(!name) throw new Error("A name must be defined for the Query parameter");
    return (target: any, propertyKey: string, index: number) => {
        setDecorator(target, propertyKey, index, DecoratorType.QUERY_PARAM, [name, validators]);
    };
}

export function setDecorator(target: any, propertyKey: string, index: number, type: string, values?: any[]) {
    let decos = {
        [propertyKey]: {
            [index]: {
                type: type,
                values: values
            }
        }
    };
    if(!target[PREFIX]) {
        Object.defineProperty(target, PREFIX, {
            value: decos,
            writable: true
        });
    }
    target[PREFIX][propertyKey] = Object.assign(target[PREFIX][propertyKey], {}, {
        [index]: decos[propertyKey][index]
    });
}