import bunyan from 'bunyan';
import config from 'config';
import path from 'path';

const { name } = require(path.join(__dirname, '../../package.json')); // gross

export const log = bunyan.createLogger({
  name,
  level: config.get('level')
});
