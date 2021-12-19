declare namespace NL.GraphQL.Fragments.General {
    type Id = {
        id: string;
    };

    type IdAddress = {
        id: import('../../classes/Address').Address;
    };
}
