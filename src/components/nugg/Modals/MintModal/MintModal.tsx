import gql from 'graphql-tag';
import React, { FunctionComponent, useEffect, useState } from 'react';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import { executeQuery3 } from '@src/graphql/helpers';
import useAsyncState from '@src/hooks/useAsyncState';
import Text from '@src/components/general/Texts/Text/Text';
import constants from '@src/lib/constants';
import state from '@src/state';
import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import Loader from '@src/components/general/Loader/Loader';
import { EthInt } from '@src/classes/Fraction';
import emitter from '@src/emitter';
import { NuggId } from '@src/client/router';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib from '@src/lib';

import styles from './MintModal.styles';

type Props = Record<string, unknown>;

const MintModal: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const [loading, setLoading] = useState(true);

    const [newNugg, setNewNugg] = useState<NuggId>();
    const [newNuggUri, setNewNuggUri] = useState<Base64EncodedSvg>();

    emitter.hook.useOnce({
        type: emitter.events.Mint,
        callback: (arg) => {
            setNewNugg(arg.tokenId);
        },
    });

    const latestNugg = useAsyncState(() => {
        if (chainId) {
            return executeQuery3<{ nuggs: { idnum: string }[] }>(
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
                if (nuggs) {
                    count = Number(nuggs[0].idnum) + 1;
                }
                if (count <= constants.PRE_MINT_ENDING_EPOCH) {
                    return String(count);
                }
                return undefined;
            });
        }
        return undefined;
    }, [chainId]);

    useEffect(() => {
        if (newNugg && chainId && provider && latestNugg && newNugg === latestNugg)
            void (async () =>
                setNewNuggUri(
                    (await new NuggftV1Helper(chainId, provider).contract.imageURI(newNugg)) as
                        | Base64EncodedSvg
                        | undefined,
                ))();
    }, [newNugg, chainId, provider, latestNugg]);

    const nuggPrice = useAsyncState(() => {
        if (chainId && provider) {
            return new NuggftV1Helper(chainId, provider).contract.msp();
        }
        return undefined;
    }, [chainId, provider]);

    useEffect(() => {
        if (nuggPrice && latestNugg) {
            setLoading(false);
        }
    }, [nuggPrice, latestNugg]);

    return (
        <div style={styles.container}>
            {newNugg && newNuggUri && (
                <TokenViewer tokenId={newNugg} showcase svgNotFromGraph={newNuggUri} />
            )}
            <div style={styles.top}>
                {!loading ? (
                    <Text textStyle={styles.text}>
                        {latestNugg && nuggPrice
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
                disabled={!latestNugg}
                feedbackText="Check Wallet..."
                buttonStyle={styles.button}
                label="Mint this Nugg"
                onClick={() =>
                    address &&
                    provider &&
                    chainId &&
                    nuggPrice &&
                    latestNugg &&
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
