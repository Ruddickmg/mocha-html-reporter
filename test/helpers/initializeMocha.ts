require('@babel/polyfill');
require('@babel/register')({
  extensions: ['.ts'],
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript',
  ],
});
