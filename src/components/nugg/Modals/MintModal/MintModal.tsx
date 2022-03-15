import gql from 'graphql-tag';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { Promise } from 'bluebird';

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
import lib, {
    isNull,
    isUndefined,
    isUndefinedOrNull,
    isUndefinedOrNullOrStringEmpty,
    range,
} from '@src/lib';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';

import styles from './MintModal.styles';

type Props = Record<string, unknown>;

const MintModal: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const [myNuggTransfer, setMyNuggTransfer] = useState<string>();
    const [loading, setLoading] = useState(false);

    const [newNugg, setNewNugg] = useState<NuggId>();
    // const [newNuggUri, setNewNuggUri] = useState<Base64EncodedSvg>();

    const nextNugg = useAsyncState(() => {
        if (chainId && provider) {
            if (newNugg && nextNugg === newNugg) {
                return new Promise<string>((resolve) => {
                    resolve(String(Number(newNugg) + 1));
                });
            }
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
            ).then(async ({ nuggs }) => {
                let count = constants.PRE_MINT_STARTING_EPOCH + 1;
                if (nuggs) {
                    const vals = await Promise.map(
                        range(Number(nuggs[0].idnum) + 1, Number(nuggs[0].idnum) + 11),
                        async (id) => {
                            return (
                                await new NuggftV1Helper(chainId, provider).contract.agency(id)
                            ).toString();
                        },
                    );

                    count = Number(nuggs[0].idnum) + 1 + vals.indexOf('0');
                }
                if (count <= constants.PRE_MINT_ENDING_EPOCH) {
                    return String(count);
                }
                return null;
            });
        }
        return undefined;
    }, [chainId, newNugg, provider]);

    const nuggPrice = useAsyncState(() => {
        if (chainId && provider) {
            return new NuggftV1Helper(chainId, provider).contract.msp();
        }
        return undefined;
    }, [chainId, provider, newNugg]);

    emitter.hook.useOn({
        type: emitter.events.Mint,
        callback: (arg) => {
            // console.log({ arg, address });
            // if (address === arg.minter.toLowerCase()) {
            setNewNugg(arg.event.args.tokenId.toString());
            // }
        },
    });

    emitter.hook.useOnce({
        type: emitter.events.Transfer,
        callback: (arg) => {
            setMyNuggTransfer(arg.event.args._tokenId.toString());
            setLoading(false);
        },
    });

    emitter.hook.useOnce({
        type: emitter.events.TransactionInitiated,
        callback: () => {
            setLoading(true);
        },
    });

    const headerText = useMemo(() => {
        if (isNull(nextNugg)) {
            return 'No more nuggs';
        }
        if (loading) {
            return 'Deep-frying your nugg...';
        }
        if (!isUndefinedOrNullOrStringEmpty(nextNugg)) {
            return `Nugg ${nextNugg}`;
        }
        return 'Mint yourself a nugg';
    }, [nextNugg, loading]);

    const bodyText = useMemo(() => {
        if (isNull(nextNugg)) {
            return 'There are no more nuggs to mint. If you want a nugg, you must offer on a sale.';
        }
        if (isUndefined(nextNugg) || isUndefinedOrNull(nuggPrice)) {
            return '';
        }
        if (loading) {
            return 'Please wait while your nugg is being created';
        }
        if (!isUndefinedOrNullOrStringEmpty(newNugg)) {
            return `You are now the proud owner Nugg ${nextNugg}!`;
        }
        return `You can be the proud owner of Nugg ${nextNugg} for ${new EthInt(nuggPrice).decimal
            .toNumber()
            .toPrecision(5)} ETH`;
    }, [nextNugg, loading, nuggPrice, newNugg]);

    const buttonText = useMemo(() => {
        if (isNull(nextNugg)) {
            return 'Close';
        }
        if (loading) {
            return 'Deep-frying...';
        }
        return 'Mint this Nugg';
    }, [nextNugg, loading]);
    return (
        <div style={styles.container}>
            <Text textStyle={styles.text} type="title">
                {headerText}
            </Text>
            <AnimatedCard>
                <TokenViewer
                    tokenId={newNugg && myNuggTransfer === newNugg ? newNugg : ''}
                    showcase
                    disableOnClick={!newNugg}
                    showPending={!newNugg}
                />
            </AnimatedCard>

            <div style={styles.top}>
                <Text textStyle={styles.text} type="text">
                    {bodyText}
                </Text>
                {loading ? (
                    <Loader color={lib.colors.white} style={{ marginLeft: '.5rem' }} />
                ) : null}
            </div>
            <FeedbackButton
                disabled={!nextNugg}
                feedbackText="Check Wallet..."
                buttonStyle={styles.button}
                label={buttonText}
                overrideFeedback
                onClick={() => {
                    if (isUndefined(newNugg)) {
                        if (address && provider && chainId && nuggPrice && nextNugg) {
                            state.wallet.dispatch.mintNugg({
                                chainId,
                                provider,
                                address,
                                nuggPrice,
                                nextNugg,
                            });
                        }
                    } else {
                        state.app.dispatch.setModalClosed();
                    }
                }}
            />
        </div>
    );
};

export default MintModal;
