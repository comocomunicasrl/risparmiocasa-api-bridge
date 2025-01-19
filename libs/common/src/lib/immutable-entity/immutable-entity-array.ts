import { ImmutableEntity } from "./immutable-entity";

export class ImmutableEntityArray<T> extends Array<T> {
    typeDef: (new (objInput?: any, fromApi?: boolean) => any);

    constructor(typeDef?: (new (objInput?: any, fromApi?: boolean) => any), objs?: object[], fromApi?: boolean) {
        if (objs) {
            super(...objs.map<T>(obj => typeDef ? new typeDef(obj, fromApi) : obj));
        } else {
            super();
        }
        this.typeDef = typeDef;
        this.afterInit();
        Object.freeze(this);
    }

    clone(): Array<T> {
        let currentProto = Object.getPrototypeOf(this);
        return new currentProto.constructor(this);
    }

    toObject(toApi?: boolean) {
        if (!toApi || !this.typeDef)
            return JSON.parse(JSON.stringify(this));
        
        return this.map(item => item instanceof ImmutableEntity ? item.toObject(toApi) : item);
    }

    afterInit(): void {}
}