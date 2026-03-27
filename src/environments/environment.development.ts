export const environment = {
    production: false,
    apiUri: 'http://localhost:3000/api/v1',
    deployedAccountApiUri: 'https://4b0lg5si25.execute-api.eu-west-1.amazonaws.com/dev/api/v1/account',
    authApiUris: [
        'http://localhost:3000/api/v1',
        'https://4b0lg5si25.execute-api.eu-west-1.amazonaws.com/dev/api/v1'
    ],
    accountEndpoints: {
        me: 'https://4b0lg5si25.execute-api.eu-west-1.amazonaws.com/dev/api/v1/account/me',
        appliedJobs: 'https://4b0lg5si25.execute-api.eu-west-1.amazonaws.com/dev/api/v1/account/me/applied-jobs',
        applicants: 'https://4b0lg5si25.execute-api.eu-west-1.amazonaws.com/dev/api/v1/account/me/applicants'
    },
    emailjs: {
        serviceId: 'service_jobsearch',
        templateId: 'template_198435h',
        publicKey: '2tsHwamVZ7QF-N6Wy'
    }
 };
