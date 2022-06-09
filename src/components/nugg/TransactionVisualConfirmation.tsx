import React, { FunctionComponent, NamedExoticComponent } from 'react';

import lib, { shortenTxnHash } from '@src/lib';
import AnimatedConfirmation from '@src/components/general/AnimatedTimers/AnimatedConfirmation';
import { gotoEtherscan } from '@src/web3/config';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import Label from '@src/components/general/Label/Label';
import web3 from '@src/web3';
import { useTransactionManager2 } from '@src/contracts/useContract';
import { CustomError } from '@src/lib/errors';

import OffersList from './RingAbout/OffersList';

type Props = {
    hash: ResponseHash | undefined;
    tokenId?: TokenId;
    onDismiss?: () => void;
    ConfirmationView?: (() => JSX.Element) | NamedExoticComponent<unknown>;
    error?: Error | CustomError | undefined;
};

const TransactionVisualConfirmation: FunctionComponent<Props> = ({
    hash,
    tokenId,
    error,
    onDismiss,
    ConfirmationView,
}) => {
    const chainId = web3.hook.usePriorityChainId();
    const address = web3.hook.usePriorityAccount();

    const network = web3.hook.useNetworkProvider();

    const transaction = useTransactionManager2(network, hash);

    React.useEffect(() => {
        if (hash && !hash.isHash()) {
            setManualResponse(true);
        }
    }, [hash]);

    const [manualResponse, setManualResponse] = React.useState<boolean>(false);

    // const Con = confetti.useMe({});
    // const tigger = confetti.useTrigger();

    // const [triggered, setTriggered] = React.useState(false);

    // React.useEffect(() => {
    //     if (!triggered && transaction?.response && transaction?.receipt) {
    //         tigger();
    //         setTriggered(true);
    //     }
    // }, [triggered, transaction, tigger]);

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
            {/* {Con} */}
            {/* <Confetti
                wind={0.02}
                tweenDuration={500}
                numberOfPieces={100}
                run={transaction?.response && transaction?.receipt}
                style={{
                    marginTop: -20,
                    marginLeft: -10,
                    transition: `opacity .5s ${lib.layout.animation}`,
                    opacity: transaction?.response && transaction?.receipt ? 1 : 0,
                }}
            /> */}
            {!transaction?.response && !manualResponse && (
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
                    <Text
                        size="large"
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontWeight: lib.layout.fontWeight.thicc,
                        }}
                    >
                        👀 looking...
                    </Text>

                    <Button
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                            marginTop: '20px',
                        }}
                        textStyle={{
                            color: lib.colors.white,
                        }}
                        size="large"
                        onClick={() => {
                            setManualResponse(true);
                        }}
                        label="ok, i confirmed it"
                    />
                </div>
            )}

            {!transaction?.response && error && (
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
                    <Text textStyle={{ color: lib.colors.primaryColor }}>
                        Error: {error.message}
                    </Text>
                </div>
            )}

            {(transaction?.response || manualResponse) &&
                !transaction?.receipt &&
                chainId &&
                address && (
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
                        <Text
                            size="large"
                            textStyle={{
                                color: lib.colors.etherscanBlue,
                                fontWeight: lib.layout.fontWeight.thicc,
                                marginBottom: 20,
                            }}
                        >
                            {hash && hash.isHash() ? shortenTxnHash(hash) : 'submitted'}
                        </Text>
                        <Button
                            className="mobile-pressable-div"
                            onClick={() =>
                                hash && hash.isHash()
                                    ? gotoEtherscan(chainId, 'tx', hash)
                                    : gotoEtherscan(chainId, 'address', address)
                            }
                            label="view on etherscan"
                            textStyle={{
                                color: lib.colors.etherscanBlue,
                                fontWeight: lib.layout.fontWeight.thicc,
                            }}
                            size="large"
                            buttonStyle={{
                                borderRadius: lib.layout.borderRadius.large,
                            }}
                        />
                        <Text textStyle={{ marginTop: 20 }}>it should be included soon</Text>
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Button
                        className="mobile-pressable-div"
                        label="dismiss"
                        onClick={onDismiss}
                        size="smaller"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                            marginTop: '20px',
                        }}
                        textStyle={{
                            fontWeight: lib.layout.fontWeight.thicc,

                            color: lib.colors.white,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default TransactionVisualConfirmation;
