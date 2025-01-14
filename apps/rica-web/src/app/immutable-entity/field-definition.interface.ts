import { ImmutableEntityConstructor } from "./immutable-entity";

export interface IFieldDefinition {
    typeDef?: ImmutableEntityConstructor<any>|(new (obj: any) => any);
    objFactory?: (objInput?: any, fromApi?: boolean, fieldDefs?: { [key: string]: IFieldDefinition }) => any;
    apiName?: string;
    converter?: any; //IApiPropertyConverter;
    defaultValue?: any;
    validator?: (value: unknown) => boolean;
    toObject?: (value: unknown, toApi?: boolean) => unknown
}