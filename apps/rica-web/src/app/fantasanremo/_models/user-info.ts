import { Field } from "common/immutable-entity/field";
import { ImmutableEntity } from "common/immutable-entity/immutable-entity";

export class UserInfo extends ImmutableEntity<UserInfo> {
    @Field() cardNumber: string;
    @Field() firstname: string;
    @Field() lastname: string;
    @Field({ typeDef: Date }) birthdate: Date;
    @Field() taxId: string;
    @Field() email: string;
    @Field() rulesAcceptance: boolean;
    @Field() privacyPolicyAcceptance: boolean;
}