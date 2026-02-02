import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Point this to your running backend or a local schema file
  schema: 'http://localhost:4000/graphql', 
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'graphql',
      }
    }
  }
};

export default config;