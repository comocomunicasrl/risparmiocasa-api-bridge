import { ApiErrorMessage } from "../api-error-message";
import { ApiError } from "./api-error";

export class ApiErrorResponse extends Error {
    code?: ApiErrorMessage;

    constructor(apiError: ApiError) {
        super();
        this.code = (Object.values(ApiErrorMessage) as Array<string>).includes(apiError.code ?? '') ? (apiError.code as ApiErrorMessage) : ApiErrorMessage.GENERIC;
    }
}