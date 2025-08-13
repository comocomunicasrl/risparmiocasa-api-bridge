export const enDictionary = {
    common: {
        proceed: 'NEXT',
        requiredFields: 'mandatory fields',
        loadingInProgress: 'Loading in progress',
        validity_pattern: 'Value format is not valid',
        validity_required: 'Mandatory field',
        validity_format: 'Value format is not valid',
        validity_equality: 'The fields are not equals',
        validity_dateValidity: 'Date is not completed',
        validity_minLength: 'Minimum length {0} chars',
        next_step: 'Next',
        cancel: 'Cancel',
        use_camera: 'Get by cam',
        serverComError: 'Server error!',
        notValidData: 'Data are not valid',
        enterToContinue: 'Insert the code',
        loading: 'Loading'
    },
    login: {
        authenticationError: 'Error during authentication',
        authenticationFailed: 'Wrong password'
    },
    newCard: {
        heading: 'New loyalty card request form',
        navigationStepHeader: {
            one: '1 - Personal data',
            two: '2 - Confirm email',
            three: '3 - Card issuing',
        },
    },
    updateCard: {
        verification: {
            heading_rica: 'Through this page you can update the details of your Risparmio Casa loyalty card.',
            heading_uniprice: 'Through this page you can update the details of your Uniprice loyalty card.',
            alreadyUpdated:  'ATTENTION: your data will be updated on our systems within 24 hours.',
            cardNumber: {
                cardNumberLabel: 'To get started, enter your card number:',
                cardNumberHint: 'including the initial 0',
                proceed: 'NEXT',
                error: 'Error! The card code is invalid or you have already made a request',
                requiredFields: 'mandatory fields'
            },
            phoneNumber: {
                error: "Error! Error sending code, check your phone number and try again later",
            },
            otp: {
                heading: 'Enter the code we sent you via SMS',
                label: 'OTP code sent via SMS',
                sendAgain: "Haven't received the code? Click here to try again",
                error: 'Error! Error while verifying code, please check the code and try again later',
            }
        },
        personalDetails: {
            consentToDataProcessingOne: 'Consent to the',
            consentToDataProcessingTwo: 'Regulation and data processing',
            consentToMarketingOne: 'Consent to the data processing for',
            consentToMarketingTwo: 'direct marketing purposes',
            consentToMarketingTwoAnd: 'and ',
            consentToMarketingTwo2024: 'direct marketing purposes (ver. 2024)',
            consentToMarketingTwo2025: '(ver. 2025)',
            consentToMarketingThree: 'consent necessary to receive discount coupons and dedicated promotions via SMS, email and push notifications',
            consentDiscountOne: 'By activating this consent you will receive discount coupons and exclusive promotions reserved for you, for example,',
            consentDiscountTwo: '15% discount for your birthday',
        },
        confirmation: {
            thanks: 'Thank you!',
            confirmationTextOne: 'We have received your request to update your loyalty card data.',
            confirmationTextTwo: 'You will receive a confirmation email with the data you entered. If you don\'t receive it, also check your junk folder.',
            confirmationTextThree: 'We remind you that you will be able to access our APP by entering your loyalty number and associated email in 10 minutes.',
        }
    },
    personalDetails: {
        name: 'Name',
        surname: 'Surname',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        unspecified: 'Not specified',
        phoneNumber: 'Phone number',
        secondaryPhoneNumber: 'Telephone number',
        countryOfResidence: 'Country of residence',
        cityOfResidence: 'City of residence',
        postalCode: 'Postal code',
        address: 'Residence address',
        street: 'Street number',
        preferredStore: 'Preferred store',
        dateOfBirth: 'Date of birth',
        dateOfBirthDay: "DD",
        dateOfBirthMonth: "MM",
        dateOfBirthYear: "YYYY",
        discountCode: 'Discount code',
        consentToDataProcessingOne: 'Consent to the',
        consentToDataProcessingTwo: 'Regulation and data processing',
        consentToMarketingOne: 'Consent to the data processing for',
        consentToMarketingTwo: 'direct marketing purposes',
        consentToMarketingTwoAnd: 'and ',
        consentToMarketingTwo2024: 'direct marketing purposes (ver. 2024)',
        consentToMarketingTwo2025: '(ver. 2025)',
        consentToMarketingThree: '(telephone, sms, mms, email, post)',
        consentToStatisticsOne: 'Consent to the processing of data for',
        consentToStatisticsTwo: 'profiling purposes',
        consentToStatisticsTwoAnd: 'and ',
        consentToStatisticsTwo2024: 'profiling purposes (ver. 2024)',
        consentToStatisticsTwo2025: '(ver. 2025)',
        consentToStatisticsThree:
            '(evaluation of preferences, consumption habits, marketing surveys and statistics)',
        proceed: 'NEXT',
        loading: 'Loading',
        requiredFields: 'mandatory fields',
        friendFidelityCard: 'Friend fidelity card'
    },
    emailConfirmation: {
        enterEmail: 'Enter your email address to continue:',
        email: 'E-mail address',
        emailRepeat: 'Repeat email address',
        confirmEmailOne: 'Kindly Customer,',
        confirmEmailTwo: 'we have sent you the secret code to the email you entered',
        confirmEmailThree: 'to complete the registration.',
        insertCode: 'Insert the code',
        proceed: 'NEXT',
        loading: 'Loading',
        codeNotReceived: "Haven't received the code? Check your SPAM box.",
        resend: 'Click here to resend the code',
        invalidCodeError: 'Error! Code is not valid. Try again',
        alreadyRegisteredError:
            'Error! Your email is already associated with another card. Please enter another email',
    },
    cardConfirmation: {
        confirmCardOne: 'Kindly Customer,',
        confirmCardTwo: "Here's your new loyalty card",
        download: 'Download on your smartphone',
    },
    phoneNumberInput: {
        label: 'Insert your phone number',
        insertPhone: 'Insert phone number'
    },
    cardNumber: {
        insertIdCard: 'Insert the fidelity card code',
        idCard: 'ID CARD',
        repeatIdCard: 'Repeat ID CARD'
    },
    OTPAuth: {
        emailAuth: 'Email authentication',
        smsAuth: 'SMS Authentication',
        chooseMode: 'Select the authentication method',
        mailSent: 'We have sent the secret code to the customer\'s email<br/>to complete the registration.',
        smsSent: 'We have sent the secret code to the customer\'s phone<br/>to complete the registration.'
    },
    storePage: {
        storeAuthentication: 'Store authentication',
        fidelityCardSubscription: 'Fidelity card subscription',
        cardAssociationEnd: 'Association completed',
        cardCreated: 'The fidelity card has been created. A confirmation email has been sent to the address entered.',
        notReceivedCard: 'If the customer does not receive it, ask them to also check their spam folder.',
        addNewCard: 'Add new',
        OTPAuth: 'OTP Authentication',
        personalData: 'Personal data',
        cardAssociation: 'Card association',
        cardIssuing: 'Card issuing'
    }
};
