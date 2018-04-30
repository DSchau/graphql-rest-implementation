import { makeExecutableSchema } from "graphql-tools";
import axios from "axios";
import config from "config";
import qs from "query-string";

const BASE_URL = config.get("restURL");

const schema = `
  type User {
    id: ID!
    name: Name!
    email: String!
  }

  type Name {
    first: String!
    last: String!
    fullName: String!
  }

  type Comment {
    author: String!
    body: String!
    parent: String!
    id: ID!
  }

  type Post {
    title: String!
    author: String!
    id: ID!
    published: String!
    body: String!
    comments(start: Int, limit: Int): [Comment]
  }

  type Query {
    comments(id: ID!, start: Int, limit: Int): [Comment]!
    comment(id: ID!, commentId: String!): Comment
    posts(start: Int, limit: Int): [Post]!
    post(id: ID!): Post
    users(start: Int, limit: Int): [User]!
    user(id: ID!): User
  }

  type Mutation {
    addPost(title: String!, author: String!, published: String!, body: String): Post!
    updatePost(id: ID!, title: String, author: String, published: String, body: String): Post
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;

const resolvers = {
  Query: {
    comments(root, { id, ...rest }) {
      const params = qs.stringify(rest);
      return axios
        .get(`${BASE_URL}/posts/${id}/comments/?${params}`)
        .then(response => response.data.comments);
    },
    comment(root, { id, commentId }) {
      return axios
        .get(`${BASE_URL}/posts/${id}/comments/${commentId}`)
        .then(response => response.data);
    },
    posts(root, args) {
      const params = qs.stringify(args);
      return axios
        .get(`${BASE_URL}/posts?${params}`)
        .then(response => response.data.posts);
    },
    post(root, { id }) {
      const url = `${BASE_URL}/posts/${id}`;
      return axios.get(url).then(response => response.data);
    },
    users(root, args) {
      const params = qs.stringify(args);
      return axios
        .get(`${BASE_URL}/users?${params}`)
        .then(response => response.data.users);
    },
    user(root, { id }) {
      return axios
        .get(`${BASE_URL}/users/${id}`)
        .then(response => response.data);
    }
  },
  Mutation: {
    addPost(root, args) {
      return axios
        .post(`${BASE_URL}/posts`, args)
        .then(response => response.data);
    },
    updatePost(root, { id, ...body }) {
      return axios
        .put(`${BASE_URL}/posts/${id}`, body)
        .then(response => response.data);
    }
  },
  Name: {
    fullName(name) {
      return `${name.first} ${name.last}`;
    }
  },
  Post: {
    comments(post, args) {
      const params = qs.stringify(args);
      return axios
        .get(`${BASE_URL}/posts/${post.id}/comments?${params}`)
        .then(response => response.data.comments);
    }
  }
};

export const SCHEMA = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});
