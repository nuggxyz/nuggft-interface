import gql from 'graphql-tag';
import React, { useMemo, useState } from 'react';
import { Promise } from 'bluebird';
import { t } from '@lingui/macro';

import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import { executeQuery3 } from '@src/gql/helpers';
import useAsyncState from '@src/hooks/useAsyncState';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import Loader from '@src/components/general/Loader/Loader';
import { EthInt } from '@src/classes/Fraction';
import emitter from '@src/emitter';
import lib, {
    isNull,
    isUndefined,
    isUndefinedOrNull,
    isUndefinedOrNullOrStringEmpty,
    range,
} from '@src/lib';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer3 from '@src/components/nugg/TokenViewer3';
import { MintModalData } from '@src/interfaces/modals';
import { useNuggftV1, useTransactionManager } from '@src/contracts/useContract';
import client from '@src/client';

import styles from './MintModal.styles';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MintModal = ({ data }: { data: MintModalData }) => {
    const address = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const nuggft = useNuggftV1(provider);

    const { send } = useTransactionManager();
    const closeModal = client.modal.useCloseModal();

    const [myNuggTransfer, setMyNuggTransfer] = useState<NuggId>();
    const [loading, setLoading] = useState(false);

    const [newNugg, setNewNugg] = useState<NuggId>();

    const nextNugg = useAsyncState(() => {
        if (chainId && provider) {
            if (newNugg && nextNugg === newNugg) {
                return new Promise<string>((resolve) => {
                    resolve(String(Number(newNugg) + 1));
                });
            }
            return executeQuery3<{ nuggs: { idnum: string }[] }>(
                gql`
                    query firstNugg($offset: Int!) {
                        nuggs(
                            where: { idnum_gt: $offset }
                            first: 1
                            orderDirection: desc
                            orderBy: idnum
                        ) {
                            id
                            idnum
                        }
                    }
                `,
                { offset: web3.config.CONTRACTS[chainId].MintOffset },
            ).then(async ({ nuggs }) => {
                let count = web3.config.CONTRACTS[chainId].MintOffset + 1;
                if (nuggs && nuggs.length > 0) {
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
                if (count <= 0xffffff) {
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
            setNewNugg(arg.event.args.tokenId.toNuggId());
        },
    });

    emitter.hook.useOnce({
        type: emitter.events.Transfer,
        callback: (arg) => {
            setMyNuggTransfer(arg.event.args._tokenId.toString().toNuggId());
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
            return t`No more nuggs`;
        }
        if (loading) {
            return t`Deep-frying your nugg...`;
        }
        if (!isUndefinedOrNullOrStringEmpty(nextNugg)) {
            return t`Nugg ${nextNugg}`;
        }
        return t`Mint yourself a nugg`;
    }, [nextNugg, loading]);

    const bodyText = useMemo(() => {
        if (isNull(nextNugg)) {
            return t`There are no more nuggs to mint. If you want a nugg, you must offer on a sale.`;
        }
        if (isUndefined(nextNugg) || isUndefinedOrNull(nuggPrice)) {
            return ``;
        }
        if (loading) {
            return t`Please wait while your nugg is being created`;
        }
        if (!isUndefinedOrNullOrStringEmpty(newNugg)) {
            return t`You are now the proud owner Nugg ${nextNugg}!`;
        }
        return t`You can be the proud owner of Nugg ${nextNugg} for ${new EthInt(nuggPrice).decimal
            .toNumber()
            .toPrecision(5)} ETH`;
    }, [nextNugg, loading, nuggPrice, newNugg]);

    const buttonText = useMemo(() => {
        if (isNull(nextNugg)) {
            return t`Close`;
        }
        if (loading) {
            return t`Deep-frying...`;
        }
        return t`Mint this Nugg`;
    }, [nextNugg, loading]);
    return (
        <div style={styles.container}>
            <Text textStyle={styles.text} type="title">
                {headerText}
            </Text>
            <AnimatedCard>
                {newNugg && (
                    <TokenViewer3
                        validated={!!(newNugg && myNuggTransfer && newNugg === myNuggTransfer)}
                        tokenId={newNugg}
                        showcase
                        disableOnClick={!newNugg}
                        showPending={!newNugg}
                    />
                )}
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
                feedbackText={t`Check wallet...`}
                buttonStyle={styles.button}
                label={buttonText}
                overrideFeedback
                onClick={() => {
                    if (isUndefined(newNugg)) {
                        if (address && provider && chainId && nuggPrice && nextNugg) {
                            void send(
                                nuggft.populateTransaction.mint(nextNugg, {
                                    value: nuggPrice,
                                }),
                            );
                        }
                    } else {
                        closeModal();
                    }
                }}
            />
        </div>
    );
};

export default MintModal;
