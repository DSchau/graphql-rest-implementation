import { makeExecutableSchema } from "graphql-tools";
import axios from "axios";
import config from "config";
import qs from "query-string";

const BASE_URL = config.get("restURL");

const schema = ``; // TODO

// TODO
const resolvers = {};

export const SCHEMA = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});
