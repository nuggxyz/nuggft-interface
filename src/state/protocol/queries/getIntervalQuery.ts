import gql from 'graphql-tag';

import config from '@src/config';
import { executeQuery } from '@src/graphql/helpers';
import { Chain } from '@src/web3/core/interfaces';

const query = () => gql`
{
    protocol(id: "${config.NUGG_PROTOCOL}") {
        interval
    }
}`;

const getIntervalQuery = async (chainId: Chain) => {
    return (await executeQuery(chainId, query(), 'protocol')).interval as Promise<string>;
};

export default getIntervalQuery;
