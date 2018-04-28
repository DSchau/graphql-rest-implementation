import express from 'express';
import graphqlHTTP from 'express-graphql';
import config from 'config';

import { SCHEMA } from './schema';
import { log } from './util';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: SCHEMA,
  graphiql: true
}));

const port = config.get('port');

app.listen(port, () => {
  log.info(`Listening on port ${port}`);
});
