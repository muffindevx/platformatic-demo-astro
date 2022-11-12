import { createClient, gql } from '@urql/core';

const graphqlClient = createClient({
  url: import.meta.env.PUBLIC_GRAPHQL_API_ENDPOINT,
  requestPolicy: 'network-only',
});

async function graphqlClientWrapper(method, gqlQuery, queryVariables = {}) {
  const queryResult = await graphqlClient[method](
    gqlQuery,
    queryVariables,
  ).toPromise();

  if (queryResult.error) {
    console.error('GraphQL Error:', queryResult.error);
  }

  return {
    data: queryResult.data,
    error: queryResult.error,
  };
}

async function query(gqlQuery, queryVariables = {}) {
  return await graphqlClientWrapper('query', gqlQuery, queryVariables);
}

async function mutation(gqlQuery, queryVariables = {}) {
  return await graphqlClientWrapper('mutation', gqlQuery, queryVariables);
}

async function fetchMovieById(movieName) {
  movieName = movieName.trim();

  const response = await query(
    gql`
      query ($movieName: String!) {
        movies(where: { name: { eq: $movieName } }) {
          id
        }
      }
    `,
    { movieName },
  );

  if (response.error) {
    return null;
  }

  const isMovieExists = response.data?.movies.length === 1;
  if (isMovieExists) {
    return response.data?.movies[0].id;
  } else {
    const saveMovieResponse = await mutation(
      gql`
        mutation ($movieName: String!) {
          saveMovie(input: { name: $movieName }) {
            id
          }
        }
      `,
      { movieName },
    );

    if (saveMovieResponse.error) {
      return null;
    }
    return saveMovieResponse.data?.saveMovie.id;
  }
}

export const API = {
  query,
  mutation,
  fetchMovieById,
};

export { gql };
