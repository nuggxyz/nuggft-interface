declare namespace NL.GraphQL.Fragments.Loan {
    type Full = Omit<NL.GraphQL.Loan<NL.GraphQL.GraphScalars>, '__typename'>;

    type Bare = Pick<
        Full,
        | 'id'
        | 'nugg'
        | 'endingEpoch'
        | 'eth'
        | 'ethUsd'
        | 'feeEth'
        | 'feeUsd'
        | 'liquidated'
        | 'liquidatedForEth'
        | 'liquidatedForUsd'
    > & {
        nugg: NL.GraphQL.Fragments.General.Id;
    };
}
