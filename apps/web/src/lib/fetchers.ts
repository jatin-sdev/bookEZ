import { request } from 'graphql-request';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { DocumentNode } from 'graphql';

const BASE_URL = (process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/graphql\/?$/, '');
const ENDPOINT = `${BASE_URL}/graphql`;
const API_URL = ENDPOINT.endsWith('/graphql') ? ENDPOINT : `${ENDPOINT}/graphql`;

export async function fetchServer<TResult = any, TVariables = any>(
  document: TypedDocumentNode<TResult, TVariables> | DocumentNode | string,
  variables?: TVariables
): Promise<TResult> {
  return request(
    API_URL,
    document as any, 
    variables as any
  );
}

export async function fetchClient<TResult = any, TVariables = any>(
  document: TypedDocumentNode<TResult, TVariables> | DocumentNode | string,
  variables?: TVariables
): Promise<TResult> {
  const endpoint = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/graphql\/?$/, '') + '/graphql';
  return request(
    endpoint,
    document as any, 
    variables as any
  );
}