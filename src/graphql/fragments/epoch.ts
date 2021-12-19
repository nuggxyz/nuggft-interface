import gql from 'graphql-tag';

export const epochFull = gql`
    {
        id
        startblock
        endblock
        status
    }
`;
