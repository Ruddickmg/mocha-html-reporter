export const uglifyJsConfiguration = {
  compress: {
    passes: 3,
    toplevel: true,
  },
  mangle: {
    toplevel: true,
    reserved: ['window', 'document', 'Object.defineProperty'],
  },
  toplevel: true,
};
export default uglifyJsConfiguration;
