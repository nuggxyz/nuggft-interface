declare namespace NL.Redux.Protocol {
    type State = NL.GraphQL.Fragments.Protocol.State & {
        error: Error;
        success: Success;
        loading: boolean;
        epochIsOver: boolean;
    };

    type Success = 'SUCCESS';

    type Error = 'UNKNOWN' | 'NO_ACCOUNT';
}
