import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import { executeQuery3 } from '@src/graphql/helpers';
import useAsyncState from '@src/hooks/useAsyncState';
import Text from '@src/components/general/Texts/Text/Text';
import constants from '@src/lib/constants';
import state from '@src/state';
import web3 from '@src/web3';
import gql from 'graphql-tag';
import React, { FunctionComponent, useEffect, useState } from 'react';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import lib, {
    isUndefined,
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrNotBigNumber,
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import styles from './MintModal.styles';
import Loader from '@src/components/general/Loader/Loader';
import { EthInt } from '@src/classes/Fraction';

type Props = Record<string, unknown>;

const MintModal: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const [loading, setLoading] = useState(true);

    const latestNugg = useAsyncState(() => {
        if (chainId) {
            return executeQuery3<{ nuggs: { idnum: number }[] }>(
                gql`
            {
                nuggs(
                    where: {
                        idnum_gt: ${constants.PRE_MINT_STARTING_EPOCH}
                        idnum_lt: ${constants.PRE_MINT_ENDING_EPOCH}
                    }
                    first: 1
                    orderDirection: desc
                    orderBy: idnum
                ) {
                    idnum
                }
            }
        `,
                {},
            ).then(({ nuggs }) => {
                let count = constants.PRE_MINT_STARTING_EPOCH + 1;
                if (!isUndefinedOrNullOrArrayEmpty(nuggs)) {
                    count = +nuggs[0].idnum + 1;
                }
                if (count <= constants.PRE_MINT_ENDING_EPOCH) {
                    return count;
                }
                return null;
            });
        }
        return null;
    }, [chainId]);

    const nuggPrice = useAsyncState(() => {
        if (chainId && provider) {
            return new NuggftV1Helper(chainId, provider).contract.msp();
        }
        return null;
    }, [chainId, provider]);

    useEffect(() => {
        if (!isUndefined(nuggPrice) && !isUndefined(latestNugg)) {
            setLoading(false);
        }
    }, [nuggPrice, latestNugg]);

    return (
        <div style={styles.container}>
            <div style={styles.top}>
                {!loading ? (
                    <Text textStyle={styles.text}>
                        {!isUndefinedOrNullOrNotNumber(latestNugg) &&
                        !isUndefinedOrNullOrNotBigNumber(nuggPrice)
                            ? `You can be the proud owner of Nugg ${latestNugg} for ${new EthInt(
                                  nuggPrice,
                              ).decimal
                                  .toNumber()
                                  .toPrecision(5)} ETH`
                            : 'No more nuggs :('}
                    </Text>
                ) : (
                    <Loader color={lib.colors.white} />
                )}
            </div>
            <FeedbackButton
                disabled={isUndefinedOrNullOrNotNumber(latestNugg)}
                feedbackText="Check Wallet..."
                buttonStyle={styles.button}
                label="Mint this Nugg"
                onClick={() =>
                    !isUndefinedOrNullOrStringEmpty(address) &&
                    !isUndefinedOrNullOrObjectEmpty(provider) &&
                    !isUndefinedOrNullOrNotNumber(chainId) &&
                    !isUndefinedOrNullOrNotBigNumber(nuggPrice) &&
                    !isUndefinedOrNullOrNotNumber(latestNugg) &&
                    state.wallet.dispatch.mintNugg({
                        chainId,
                        provider,
                        address,
                        nuggPrice,
                        latestNugg,
                    })
                }
            />
        </div>
    );
};

export default MintModal;
