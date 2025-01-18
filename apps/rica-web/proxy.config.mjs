export default [
    {
      context: [
        '/api'
      ],
      target: 'http://localhost:3000',
      secure: false
    },
    {
        context: [
          '/XA44OBLG'
        ],
        target: 'http://localhost:4200',
        pathRewrite: { '^/XA44OBLG': '' },
        secure: false
      }
];