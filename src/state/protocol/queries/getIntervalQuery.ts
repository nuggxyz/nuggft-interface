import gql from 'graphql-tag';

import config from '@src/config';
import { executeQuery } from '@src/graphql/helpers';
import { SupportedChainId } from '@src/web3/config';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") {
        interval
    }
}`;

const getIntervalQuery = async (chainId: SupportedChainId) => {
    return (await executeQuery(chainId, query(), 'protocol')).interval as Promise<string>;
};

export default getIntervalQuery;
