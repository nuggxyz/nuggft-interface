import React, { FunctionComponent } from 'react';

import lib, { shortenTxnHash } from '@src/lib';
import AnimatedConfirmation from '@src/components/general/AnimatedTimers/AnimatedConfirmation';
import { gotoEtherscan } from '@src/web3/config';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import Label from '@src/components/general/Label/Label';
import web3 from '@src/web3';
import { useTransactionManager2 } from '@src/contracts/useContract';

import OffersList from './RingAbout/OffersList';

type Props = {
    hash: Hash | undefined;
    tokenId?: TokenId;
    onDismiss?: () => void;
    ConfirmationView?: () => JSX.Element;
};

const TransactionVisualConfirmation: FunctionComponent<Props> = ({
    hash,
    tokenId,
    onDismiss,
    ConfirmationView,
}) => {
    const chainId = web3.hook.usePriorityChainId();

    const network = web3.hook.useNetworkProvider();

    const transaction = useTransactionManager2(network, hash);

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <AnimatedConfirmation confirmed={!!transaction?.receipt} />

            {!transaction?.response && (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 20,
                        marginTop: 20,
                    }}
                >
                    <Label
                        text="looking for your transaction..."
                        textStyle={{ color: 'white' }}
                        containerStyles={{ background: lib.colors.nuggGold }}
                    />
                </div>
            )}

            {transaction?.response && !transaction?.receipt && hash && chainId && (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: 20,
                        marginTop: 20,
                        marginBottom: 20,
                    }}
                >
                    <Label
                        text={shortenTxnHash(hash)}
                        textStyle={{ color: 'white' }}
                        containerStyles={{
                            background: lib.colors.etherscanBlue,
                            marginBottom: 20,
                        }}
                    />
                    <Text textStyle={{ marginBottom: 20 }}>it should be included soon</Text>
                    <Button
                        onClick={() => gotoEtherscan(chainId, 'tx', hash)}
                        label="view on etherscan"
                        textStyle={{ color: lib.colors.etherscanBlue }}
                        buttonStyle={{ borderRadius: lib.layout.borderRadius.large }}
                    />
                </div>
            )}

            {transaction?.response && transaction?.receipt && (
                <>
                    {tokenId ? (
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: 20,
                                marginTop: 20,
                                marginBottom: 20,
                            }}
                        >
                            <Label
                                size="large"
                                text="boom, you're in the lead"
                                textStyle={{ color: 'white' }}
                                containerStyles={{ background: lib.colors.green, marginBottom: 20 }}
                            />
                            <OffersList tokenId={tokenId} onlyLeader />
                        </div>
                    ) : ConfirmationView ? (
                        <ConfirmationView />
                    ) : null}
                </>
            )}

            {onDismiss && (
                <Button
                    label="dismiss"
                    onClick={onDismiss}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '20px',
                        width: '100%',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />
            )}
        </div>
    );
};

export default TransactionVisualConfirmation;
