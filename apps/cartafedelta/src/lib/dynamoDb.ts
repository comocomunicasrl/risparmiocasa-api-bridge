import AWS from 'aws-sdk';

const client = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_RISPARMIOCASA_ACCOUNT_KEY,
    secretAccessKey: process.env.AWS_RISPARMIOCASA_SECRET_KEY,
    region: process.env.AWS_RISPARMIOCASA_REGION,
});

export default {
    tableName: {
        rica: process.env.AWS_RISPARMIOCASA_TABLE,
        uniprice: process.env.AWS_UNIPRICE_TABLE
    },
    get: (params) => client.get(params).promise(),
    put: (params) => client.put(params).promise(),
    batchWrite: (params) => client.batchWrite(params).promise(),
    query: (params) => client.query(params).promise(),
    update: (params) => client.update(params).promise(),
    delete: (params) => client.delete(params).promise(),
};
