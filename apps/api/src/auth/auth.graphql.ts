import { buildSchema } from 'graphql';
import { registerUser, loginUser, refreshUserToken } from './auth.service';

// 1. Define Schema
export const authTypeDefs = `
  type User {
    id: ID!
    email: String!
    fullName: String!
    role: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
  }

  extend type Mutation {
    register(fullName: String!, email: String!, password: String!): String
    login(email: String!, password: String!): AuthPayload
    refreshToken(token: String!): AuthPayload
  }
`;

// 2. Define Resolvers
export const authResolvers = {
  register: async ({ fullName, email, password }: any) => {
    await registerUser(fullName, email, password);
    return "User registered successfully";
  },
  
  login: async ({ email, password }: any) => {
    // Reusing your existing service logic
    return await loginUser(email, password);
  },

  refreshToken: async ({ token }: any) => {
    return await refreshUserToken(token);
  }
};