import * as tsNode from 'ts-node';

tsNode.register({
  files: true,
  transpileOnly: true,
  project: './tests/tsconfig.json'
});