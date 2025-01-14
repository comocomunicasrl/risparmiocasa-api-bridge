import { Field } from "../../immutable-entity/field";
import { ImmutableEntity } from "../../immutable-entity/immutable-entity";
import { ApiUserInfo } from "common/_models/api-user-info";

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