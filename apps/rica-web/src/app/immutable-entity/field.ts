import { ImmutableEntity } from "./immutable-entity";
import { IFieldDefinition } from "./field-definition.interface";

export const Field = (def?: IFieldDefinition) => {
    return (target: ImmutableEntity<any>, memberName: string) => {
        if (target.fieldDefs)
            target.fieldDefs[memberName] = def ? { ...def } : { };
    };
}