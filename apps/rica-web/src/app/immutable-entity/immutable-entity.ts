import { IFieldDefinition } from "./field-definition.interface";

type AnyFn = (() => unknown)|((...args: unknown[]) => unknown);
type ClassProperties<C> = {
    [K in keyof C as C[K] extends AnyFn ? never : K]: C[K] extends ImmutableEntity<C[K]> ? ClassProperties<C[K]> : C[K] extends (infer ElementType)[] ? ClassProperties<ElementType>[] : C[K]
};
export type TypeSafeObject<T> = Partial<Pick<ClassProperties<T>, keyof ClassProperties<T>>>;

export class ImmutableEntity<T> {
    private _fieldDefs: { [key: string]: IFieldDefinition };
    get fieldDefs() {
        if (!this._fieldDefs)
            this._fieldDefs = {};
        return this._fieldDefs;
    }

    constructor(obj?: Partial<T> | unknown, fromApi?: boolean, fieldDefs?: { [key: string]: IFieldDefinition }) {
        if (fieldDefs) {
            this._fieldDefs = {
                ...(this._fieldDefs ?? {}),
                ...fieldDefs
            };
        }
        this.parseFromObject(obj, fromApi);
    }

    clone(): T {
        const currentProto = Object.getPrototypeOf(this);
        return new currentProto.constructor(this);
    }

    patch(obj: Partial<T> | unknown): T {
        const currentProto = Object.getPrototypeOf(this);
        return new currentProto.constructor({ ...this, ...(obj as object) });

        
    }
   
    toObject(toApi?: boolean): TypeSafeObject<T> {
        if (!toApi || !this._fieldDefs)
            return JSON.parse(JSON.stringify(this));

        const destObj = {} as { [key: string]: unknown };
        
        Object.keys(this._fieldDefs).forEach(m => {
            if (typeof((this as any)[m]) != 'undefined') {
                const fieldTo = this._fieldDefs[m].apiName ?? m;

                if (Array.isArray((this as any)[m])) {
                    destObj[fieldTo] = [
                        ...((this as any)[m] as Array<any>).map(v => {
                            if (v?.toApi)
                                return v.toApi();
                            
                            if (v && this._fieldDefs[m].toObject)
                                return (this as any)._fieldDefs[m].toObject(v, toApi);

                            return v?.toObject ? v.toObject(toApi) : v;
                        })
                    ];
                } else {
                    if ((this as any)[m]?.toApi) {
                        destObj[fieldTo] = (this as any)[m].toApi();
                    } else if ((this as any)[m] && this._fieldDefs[m].toObject) {
                        destObj[fieldTo] = (this as any)._fieldDefs[m].toObject((this as any)[m], toApi);
                    } else {
                        destObj[fieldTo] = (this as any)[m]?.toObject ? (this as any)[m].toObject(toApi) : (this as any)[m];
                    }
                }
            }
        }); 
        
        return destObj as TypeSafeObject<T>;
    }

    protected afterInit(): void { return; }

    protected getDefaultObj() {
        return Object.keys(this._fieldDefs).reduce((acc, curr) => {
            if (typeof(this._fieldDefs[curr].defaultValue) != 'undefined') {
                acc[curr] = this._fieldDefs[curr].defaultValue;
            }
            return acc;
        }, {} as { [key: string]: unknown });
    }

    private parseFromObject(valueIn: any, fromApi?: boolean) {
        if (this._fieldDefs) {
            Object.keys(this._fieldDefs).forEach(m => {
                const fieldFrom = (fromApi && (typeof this._fieldDefs[m].apiName != 'undefined')) ? this._fieldDefs[m].apiName as string : m;

                if ((!valueIn || typeof(valueIn[fieldFrom]) === 'undefined') && typeof(this._fieldDefs[m].defaultValue) != 'undefined') {
                    (this as any)[m] = this._fieldDefs[m].defaultValue;
                } else if (valueIn && Object.prototype.hasOwnProperty.call(valueIn, fieldFrom) && (typeof(valueIn[fieldFrom]) != 'undefined')) {
                    if (Array.isArray(valueIn[fieldFrom])) {
                        const newValue: any[] = [
                            ...(valueIn[fieldFrom] as Array<any>).map(v => {
                                if (v != null && this._fieldDefs[m].objFactory) {
                                    v = this._fieldDefs[m].objFactory?.(v, fromApi);
                                } else if (v != null && this._fieldDefs[m].typeDef) {
                                    const objType = this._fieldDefs[m].typeDef!;
                                    v = (objType.prototype instanceof ImmutableEntity) ? new (objType as ImmutableEntityConstructor<any>)(v, fromApi) : new objType(v);
                                }
                                return v;
                            })
                        ];
                        Object.freeze(newValue);
                        (this as any)[m] = newValue;
                    } else {
                        let newValue: any;
                        const validity = this._fieldDefs[m].validator?.(valueIn[fieldFrom]) ?? true;
                        if (validity) {
                            if (valueIn[fieldFrom] != null && this._fieldDefs[m].objFactory) {
                                newValue = this._fieldDefs[m].objFactory?.(valueIn[fieldFrom], fromApi);
                            } else if (valueIn[fieldFrom] != null && this._fieldDefs[m].typeDef) {
                                const objType = this._fieldDefs[m].typeDef!;
                                newValue = (objType.prototype instanceof ImmutableEntity) ? new (objType as ImmutableEntityConstructor<any>)(valueIn[fieldFrom], fromApi) : new objType(valueIn[fieldFrom]);
                            } else {
                                newValue = valueIn[fieldFrom]
                            }
                        }
                        (this as any)[m] = newValue;
                    }

                    (this as any)[`afterInit_${m}`]?.();
                }
            });

            this.afterInit();
            Object.freeze(this);
        }
    }
}

export type ImmutableEntityConstructor<T> = new (obj?: Partial<T> | unknown, fromApi?: boolean, fieldDefs?: { [key: string]: IFieldDefinition }) => ImmutableEntity<T>;