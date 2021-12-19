import gql from 'graphql-tag';

export const _blockFull = gql`
    {
        number
        hash
    }
`;

export const _blockBare = gql`
    {
        number
    }
`;

export const _metaFull = gql`
    {
        block ${_blockFull}
        deployment
        hasIndexingErrors
    }
`;

export const _metaBare = gql`
    {
        block ${_blockBare}
    }
`;
