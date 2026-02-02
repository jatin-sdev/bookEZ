import { GraphQLClient } from 'graphql-request';

const BASE = (typeof window === 'undefined' ? process.env.API_URL_INTERNAL : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000';
const ENDPOINT = BASE.replace(/\/graphql\/?$/, '') + '/graphql';
const API_URL = ENDPOINT.endsWith('/graphql') ? ENDPOINT : `${ENDPOINT}/graphql`;

export const graphqlClient = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  requestMiddleware: (request) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return request;
  },
});