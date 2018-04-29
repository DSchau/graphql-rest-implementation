import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import axios from 'axios';
import config from 'config';
import qs from 'query-string';

const BASE_URL = config.get('restURL');

const schema = `
  type User {
    id: ID!
    name: Name
    email: String!
  }

  type Name {
    first: String!
    last: String!
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
    comments: [Comment]
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
      return axios.get(`${BASE_URL}/posts/${id}/comments/?${params}`)
        .then(response => response.data.comments);
    },
    comment(root, { id, commentId }) {
      return axios.get(`${BASE_URL}/posts/${id}/comments/${commentId}`)
        .then(response => response.data);
    },
    posts(root, args) {
      const params = qs.stringify(args);
      return axios.get(`${BASE_URL}/posts?${params}`)
        .then(response => response.data.posts)
        .then(posts => {
          const allComments = Promise.all(
            posts.map(({ id }) => {
              return axios.get(`${BASE_URL}/posts/${id}/comments`)
                .then(res => [id, res.data.comments]);
            })
          );

          return allComments
            .then(comments => [posts, comments]);
        })
        .then(([posts, comments]) => {
          let lookup = comments.reduce((merged, [id, comments]) => {
            merged[id] = comments;
            return merged;
          }, {});

          return posts.map(post => Object.assign(post, {
            comments: lookup[post.id] || []
          }));
        });
    },
    post(root, { id }) {
      const url = `${BASE_URL}/posts/${id}`;
      return axios.get(url)
        .then(response => {
          const post = response.data;
          return axios.get(`${url}/comments`)
            .then(response => response.data.comments)
            .then(comments => Object.assign(post, { comments }));
        });
    },
    users(root, args) {
      const params = qs.stringify(args);
      return axios.get(`${BASE_URL}/users?${params}`)
        .then(response => response.data.users);
    },
    user(root, { id }) {
      return axios.get(`${BASE_URL}/users/${id}`)
        .then(response => response.data);
    }
  },
  Mutation: {
    addPost(root, args) {
      return axios.post(`${BASE_URL}/posts`, args)
        .then(response => response.data);
    },
    updatePost(root, { id, ...body }) {
      return axios.put(`${BASE_URL}/posts/${id}`, body)
        .then(response => response.data);
    }
  }
}

export const SCHEMA = makeExecutableSchema({
  typeDefs: schema,
  resolvers
});
