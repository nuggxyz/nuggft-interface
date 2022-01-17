declare namespace NL.Redux.Protocol {
    type State = NL.GraphQL.Fragments.Protocol.Index & {
        error: Error;
        success: Success;
        loading: boolean;
        currentBlock: number;
        epochIsOver: boolean;
    };

    type Success = 'SUCCESS';

    type Error = 'UNKNOWN' | 'NO_ACCOUNT';
}
