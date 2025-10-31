// .eslintrc.cjs
module.exports = {
  // keep your existing config here if you have one
  overrides: [
    {
      files: ['api/**/*.js'],
      env: { node: true, browser: false },
      globals: {
        Buffer: 'readonly',
        process: 'readonly',
      },
    },
  ],
};