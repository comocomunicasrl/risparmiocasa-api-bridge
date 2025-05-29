import { BaseSyntheticEvent, useState } from 'react';
import BasicLayout from '../../../../components/BasicLayout';
import { translate } from '../../../../utils/utils';
import { InferGetServerSidePropsType } from 'next';
import InputContainer from '../../../../components/form/Input-container';
import { FieldError, useForm } from 'react-hook-form';

export async function getServerSideProps(context) {
    return { 
        props: { 
            countryCode: context.query.countryCode,
            brand: context.query.brand
        } 
    };
}

export default function LoginPage({
    countryCode, brand
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{ code: string, message: string }|null>(null);
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';
    const passwordDataForm = useForm<{ password: string }>();

    const formErrorMap = new Map<string, string>([
        [ 'required', translate(languageCode, 'common.validity_required') ]
    ]);
    const getErrorText = (error: FieldError, errorMap: Map<string, string>) => {
        if (!error)
            return;

        if (error.message)
            return error.message;

        return errorMap.get(error.type) ?? undefined;
    }
    const dataFormSubmitHandler = passwordDataForm.handleSubmit((values, e) => handleSubmit(e));

    async function handleSubmit(e: BaseSyntheticEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordDataForm.getValues('password'), countryCode: countryCode }),
            });

            if (response.ok) {
                window.location.href = (brand === 'rica') ? `/store/${countryCode}` : `/${brand}/store/${countryCode}`;
            } else if (response.status === 401) {
                setLoading(false);
                setError({ code: 'AUTH_FAILED', message: translate(languageCode, 'login.authenticationFailed') });
            } else {
                setLoading(false);
                setError({ code: 'AUTH_ERROR', message: translate(languageCode, 'login.authenticationError') });
            }
        } catch(e) {
            setLoading(false);
            setError({ code: 'AUTH_ERROR', message: translate(languageCode, 'login.authenticationError') });
        }
    }

    return (
        <>
            <BasicLayout brand={brand} paragraphTitle={translate(languageCode, 'storePage.storeAuthentication')}>
                <div className="border border-t-0 shadow min-h-[220px] grow">
                    <div className="h-full p-4 border-t-4 sm:p-5 border-brand-dark-primary">
                        <div className="flex flex-col w-full items-center justify-center">
                            <div className="flex flex-col items-center justify-center w-72">
                                <InputContainer
                                    inputId="password"
                                    label="Password"
                                    required={true}
                                    errorText={getErrorText(passwordDataForm.formState.errors?.password, formErrorMap) ?? error?.message}
                                >
                                    <input autoComplete="off"
                                        id="password"
                                        type="password"
                                        className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                            (passwordDataForm.getFieldState('password').invalid || error)
                                                ? 'border-red-700 outline-red-800 border-2'
                                                : 'border-brand-neutral outline-blue-600 hover:border-black border'
                                        }`}
                                        onInput={() => setError(null)}
                                        disabled={loading}
                                        {...passwordDataForm.register('password', { required: true })}
                                    />
                                </InputContainer>
                                <button
                                    className={`mt-5 sm:mt-10 bg-brand-primary rounded-3xl py-2 px-10`}
                                    onClick={dataFormSubmitHandler}
                                >
                                    <span className="text-[12px] sm:text-[18px] font-bold text-white">
                                        Login
                                    </span>
                                </button>
                            </div>
                            {loading && (
                                <div className="inline-block w-full mx-auto mt-0 text-center">
                                    <div className="flex items-center justify-center mt-2 sm:mt-0">
                                        <svg
                                            role="status"
                                            className="inline w-4 h-4 m-1 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                            viewBox="0 0 100 101"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                fill="currentFill"
                                            />
                                        </svg>
                                        <p className="sm:mt-0 text-[14px] leading-6 text-center">
                                            {translate(languageCode, 'common.loading')}...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </BasicLayout>
        </>
    );
}
