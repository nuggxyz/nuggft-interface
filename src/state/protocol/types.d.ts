declare namespace NL.Redux.Protocol {
    type State = {
        error: Error;
        success: Success;
        loading: boolean;
        currentBlock: number;
    } & NL.GraphQL.Fragments.Protocol.Index;

    type Success = 'SUCCESS';

    type Error = 'UNKNOWN' | 'NO_ACCOUNT';
}
