/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import web3 from '@src/web3';
import {
    usePrioritySendTransaction,
    useENSRegistrarController,
    useENSResolver,
    useENSReverseRegistrar,
} from '@src/contracts/useContract';
import useAsyncState from '@src/hooks/useAsyncState';
import { NameModalDataBase } from '@src/interfaces/modals';
import { useForceUpdateWithVar } from '@src/hooks/useForceUpdate';
import useInterval from '@src/hooks/useInterval';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import { useLocalSecret } from '@src/hooks/useLocaleStorage';
import Text from '@src/components/general/Texts/Text/Text';
import { useUsdPair } from '@src/client/usd';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import PeerButtonMobile from './PeerButtonMobile';

const duration = 60 * 60 * 24 * 365;

const useRegisterEnsName = () => {
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

    const controller = useENSRegistrarController(provider);
    const resolver = useENSResolver(provider);
    const reverseRegistrar = useENSReverseRegistrar(provider);
    const [commitLoading, setCommitLoading] = React.useState(false);
    const [reverseLoading, setReverseLoading] = React.useState(false);
    const [registerLoading, setRegisterLoading] = React.useState(false);

    const [text, setText] = React.useState<string>('');

    const secret = useLocalSecret('nugg.xyz-ens-secret');

    const nameOk = useAsyncState(() => {
        return text ? controller.available(text) : Promise.resolve(false);
    }, [text]);

    const price = useAsyncState(() => {
        if (!nameOk || !text || !controller) return undefined;
        return controller.rentPrice(text, duration);
    }, [text, controller, nameOk]);

    const [send, estimator] = usePrioritySendTransaction(undefined, true);
    const [updateOnForce, force] = useForceUpdateWithVar();

    const [commitDone, setCommitDone] = React.useState(false);

    const commitData = useAsyncState(() => {
        if (!nameOk || !text || !address || !resolver || !controller || commitDone)
            return undefined;
        const chash = controller.makeCommitmentWithConfig(
            text,
            address,
            secret,
            resolver.address,
            address,
        );
        const tx = controller.populateTransaction['commit(bytes32)'](chash);

        const ok = estimator.estimate(tx);

        const waiter = async () => {
            const gasLimit = await ok;
            return { tx, gasLimit, ok: !!gasLimit } as const;
        };

        return waiter();
    }, [text, address, resolver, nameOk, updateOnForce, commitDone]);

    const commit = React.useCallback(() => {
        if (commitData && commitData.ok) void send(commitData.tx, () => setCommitLoading(true));
    }, [commitData, send]);

    useInterval(force, 20000);

    const registerDone = useAsyncState(() => {
        if (!provider || !address) return Promise.resolve(false);

        const addr = provider.resolveName(`${text}.eth`);

        const waiter = async () => {
            const assumed = await addr;
            if (!assumed) return undefined;
            return assumed.toLowerCase() === address;
        };

        return waiter();
    }, [text, address, updateOnForce, provider]);

    const registerData = useAsyncState(() => {
        if (
            registerDone ||
            !nameOk ||
            (commitData && commitData.ok) ||
            !text ||
            !address ||
            !resolver ||
            !controller ||
            !price
        )
            return undefined;

        const tx = controller.populateTransaction[
            'registerWithConfig(string,address,uint256,bytes32,address,address)'
        ](text, address, duration, secret, resolver.address, address, {
            value: price,
        });

        const ok = estimator.estimate(tx);

        const waiter = async () => {
            const gasLimit = await ok;
            return { tx, gasLimit, ok: !!gasLimit } as const;
        };

        return waiter();
    }, [
        text,
        address,
        resolver,
        nameOk,
        updateOnForce,
        commitData,
        controller,
        price,
        registerDone,
    ]);

    const register = React.useCallback(() => {
        if (registerData && registerData.ok)
            void send(registerData.tx, () => setRegisterLoading(true));
    }, [registerData, send]);

    const reverseDone = useAsyncState(() => {
        if (!provider || !address) return Promise.resolve(false);

        const node = reverseRegistrar.node(address);
        const reverseResolver = reverseRegistrar.defaultResolver();

        const waiter = async () => {
            const name = await resolver.attach(await reverseResolver).name(node);

            return name === `${text}.eth`;
        };

        return waiter();
    }, [text, address, updateOnForce, provider]);

    const reverseData = useAsyncState(() => {
        if (!text || !address || !provider || !commitDone || reverseDone) return undefined;

        const tx = reverseRegistrar.populateTransaction['setName(string)'](`${text}.eth`);

        const ok = estimator.estimate(tx);

        const waiter = async () => {
            const gasLimit = await ok;
            return { tx, gasLimit, ok: !!gasLimit } as const;
        };

        return waiter();
    }, [text, address, resolver, nameOk, updateOnForce, commitDone, reverseDone]);

    const reverse = React.useCallback(() => {
        if (reverseData && reverseData.ok)
            void send(reverseData.tx, () => {
                setReverseLoading(true);
            });
    }, [reverseData, send]);

    React.useEffect(() => {
        if (
            !commitDone &&
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            ((commitData && !!commitData.tx && !commitData.ok) || registerData?.ok || registerDone)
        ) {
            setCommitDone(true);
        }
    }, [commitData, registerData, commitDone, registerDone]);

    // const [stage, caller] = React.useMemo(() => {
    //     if (!commitDone) return ['commit', commit] as const;
    //     if (reverseData?.ok && !reverseDone) return ['reverse', reverse] as const;
    //     if (registerData?.ok && !registerDone) return ['register', register] as const;
    //     if (!registerDone) return ['waiting', (): void => undefined];
    //     return ['done', (): void => undefined] as const;
    // }, [
    //     reverseData,
    //     registerData,
    //     commitDone,
    //     registerDone,
    //     reverseDone,
    //     commit,
    //     reverse,
    //     register,
    // ]);

    const estimatedGasUsd = useUsdPair(price);
    const commitFeeUsd = useUsdPair(commitData?.gasLimit);

    const CommitMem = React.useMemo(() => {
        return (
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: 20,
                }}
            >
                <TextInput
                    setValue={setText}
                    value={text}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        color: lib.colors.primaryColor,
                    }}
                    styleInput={{
                        fontSize: 32,
                        color: lib.colors.primaryColor,
                        textAlign: 'right',
                        padding: '.3rem .5rem',
                    }}
                    styleInputContainer={{
                        textAlign: 'left',
                        width: '100%',
                        background: lib.colors.transparentPrimaryColorSuper,
                        padding: '.3rem .6rem',
                        border: `4px solid ${nameOk ? lib.colors.green : lib.colors.red}`,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        boxShadow: lib.layout.boxShadow.basic,
                    }}
                    rightToggles={[
                        <Text
                            textStyle={{
                                marginLeft: -10,
                            }}
                            size="larger"
                        >
                            .eth
                        </Text>,
                    ]}
                />

                <Text size="large" textStyle={{ marginTop: 10 }}>
                    {t`price`}
                </Text>
                <CurrencyText
                    // unitOverride={}
                    forceEth
                    size="large"
                    stopAnimation
                    value={estimatedGasUsd}
                />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '20px',
                    }}
                >
                    <PeerButtonMobile
                        ok={!!nameOk}
                        loading={commitLoading}
                        done={!!commitDone}
                        text="send tx 1/3 on"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            commit();
                        }}
                        fee={commitFeeUsd}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '20px',
                    }}
                >
                    <PeerButtonMobile
                        ok={!!reverseData?.ok}
                        loading={reverseLoading}
                        done={!!reverseDone}
                        text="send tx 2/3 on"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            reverse();
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '20px',
                    }}
                >
                    <PeerButtonMobile
                        ok={!!registerData?.ok}
                        loading={registerLoading}
                        done={!!registerDone}
                        text="finalize on"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            register();
                        }}
                    />
                </div>
            </div>
        );
    }, [
        text,
        setText,
        nameOk,
        commitLoading,
        commitDone,
        registerData?.ok,
        registerDone,
        registerLoading,
        reverseData?.ok,
        reverseDone,
        reverseLoading,
        commit,
        reverse,
        register,
        estimatedGasUsd,
        commitFeeUsd,
    ]);

    const Mem = React.useMemo(
        () => (
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: 10,
                }}
            >
                <Text
                    size="larger"
                    textStyle={{ ...lib.layout.presets.font.main.regular, marginBottom: 20 }}
                >
                    pick a name
                </Text>

                {CommitMem}
            </div>
        ),
        [CommitMem],
    );

    return [text, setText, nameOk, price, Mem] as const;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NameModalMobile = ({ data }: { data: NameModalDataBase }) => {
    // const isOpen = client.modal.useOpen();
    // const unclaimedOffers = client.user.useUnclaimedOffersFilteredByEpoch();

    // const closeModal = client.modal.useCloseModal();
    // const [page, setPage] = client.modal.usePhase();

    const [, , , , Mem] = useRegisterEnsName();

    // const [tabFadeTransition] = useTransition(
    //     stage,
    //     {
    //         from: () => ({
    //             opacity: 0,
    //         }),
    //         expires: 500,
    //         enter: { opacity: 1 },
    //         leave: () => {
    //             return {
    //                 opacity: 0,
    //             };
    //         },
    //         keys: (item) => `tabFadeTransition${item}5`,
    //         config: config.stiff,
    //     },
    //     [stage, isOpen],
    // );

    // const containerStyle = useSpring({
    //     to: {
    //         transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
    //     },
    //     config: config.default,
    // });

    // const globalCurrencyPref = client.usd.useCurrencyPreferrence();

    // const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);

    // const estimatedGasUsd = useUsdPair(price);

    // const Page1 = React.useMemo(
    //     () =>
    //         isOpen && stage === 'commit' ? (
    //             <>
    //                 <Text
    //                     size="larger"
    //                     textStyle={{ ...lib.layout.presets.font.main.regular, marginBottom: 20 }}
    //                 >
    //                     pick a name
    //                 </Text>

    //                 <TextInput
    //                     setValue={setText}
    //                     value={text}
    //                     style={{
    //                         display: 'flex',
    //                         flexDirection: 'column',
    //                         justifyContent: 'space-between',
    //                         alignItems: 'center',
    //                         width: '100%',
    //                         color: lib.colors.primaryColor,
    //                     }}
    //                     styleInput={{
    //                         fontSize: 32,
    //                         color: lib.colors.primaryColor,
    //                         textAlign: 'right',
    //                         padding: '.3rem .5rem',
    //                     }}
    //                     styleInputContainer={{
    //                         textAlign: 'left',
    //                         width: '100%',
    //                         background: lib.colors.transparentPrimaryColorSuper,
    //                         padding: '.3rem .6rem',
    //                         border: `4px solid ${nameOk ? lib.colors.green : lib.colors.red}`,
    //                         borderRadius: lib.layout.borderRadius.mediumish,
    //                         boxShadow: lib.layout.boxShadow.basic,
    //                     }}
    //                     rightToggles={[
    //                         <Text
    //                             textStyle={{
    //                                 marginLeft: -10,
    //                             }}
    //                             size="larger"
    //                         >
    //                             .eth
    //                         </Text>,
    //                     ]}
    //                 />

    //                 {nameOk && (
    //                     <div
    //                         style={{
    //                             display: 'flex',
    //                             alignItems: 'center',
    //                             width: '100%',
    //                             justifyContent: 'center',
    //                             marginTop: '20px',
    //                         }}
    //                     >
    //                         <PeerButtonMobile
    //                             text="tap to finalize on"
    //                             onClick={(event) => {
    //                                 event.preventDefault();
    //                                 event.stopPropagation();
    //                                 caller();
    //                             }}
    //                         />
    //                     </div>
    //                 )}
    //             </>
    //         ) : null,
    //     [isOpen, stage, text, setText, nameOk, caller],
    // );

    // const Page3 = React.useMemo(
    //     () =>
    //         isOpen && stage === 'reverse' ? (
    //             <>
    //                 <div>reverse it up</div>
    //                 <div
    //                     style={{
    //                         display: 'flex',
    //                         alignItems: 'center',
    //                         width: '100%',
    //                         justifyContent: 'center',
    //                         marginTop: '20px',
    //                     }}
    //                 >
    //                     <PeerButtonMobile
    //                         text="tap to submit on"
    //                         onClick={(event) => {
    //                             event.preventDefault();
    //                             event.stopPropagation();
    //                             caller();
    //                         }}
    //                     />
    //                 </div>
    //             </>
    //         ) : null,
    //     [isOpen, stage, caller],
    // );

    // const Page2 = React.useMemo(
    //     () =>
    //         isOpen && stage === 'register' ? (
    //             <>
    //                 <div>registrate it up</div>
    //                 <div
    //                     style={{
    //                         display: 'flex',
    //                         alignItems: 'center',
    //                         width: '100%',
    //                         justifyContent: 'center',
    //                         marginTop: '20px',
    //                     }}
    //                 >
    //                     <PeerButtonMobile
    //                         text="tap to submit on"
    //                         onClick={(event) => {
    //                             event.preventDefault();
    //                             event.stopPropagation();
    //                             caller();
    //                         }}
    //                     />
    //                 </div>
    //             </>
    //         ) : null,
    //     [isOpen, stage, caller],
    // );

    // const Page4 = React.useMemo(
    //     () =>
    //         isOpen && stage === 'done' ? (
    //             <>
    //                 <div>done</div>
    //             </>
    //         ) : null,
    //     [isOpen, stage],
    // );

    return (
        <>
            {Mem}
            {/* {tabFadeTransition((sty, pager) => {
                return (
                    <animated.div
                        style={{
                            // position: 'relative',
                            position: 'absolute',
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            margin: 20,
                        }}
                    >
                        <animated.div
                            style={{
                                width: '93%',
                                padding: '25px',
                                position: 'relative',
                                // pointerEvents: 'none',
                                // ...sty,
                                background: lib.colors.transparentWhite,
                                transition: `.2s all ${lib.layout.animation}`,

                                borderRadius: lib.layout.borderRadius.largish,
                                boxShadow: lib.layout.boxShadow.basic,
                                margin: '0rem',
                                justifyContent: 'flex-start',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                ...containerStyle,
                                ...sty,
                            }}
                        >
                            <>
                                {pager === 'commit'
                                    ? Page1
                                    : pager === 'register'
                                    ? Page2
                                    : pager === 'reverse'
                                    ? Page3
                                    : Page4}
                            </>{' '}
                            {/* {(pager === 1 || pager === 0) && (
                                <>
                                    <Button
                                        className="mobile-pressable-div"
                                        size="small"
                                        buttonStyle={{
                                            position: 'absolute',
                                            left: 3,
                                            bottom: -50,
                                            borderRadius: lib.layout.borderRadius.mediumish,
                                            background: lib.colors.transparentWhite,
                                            WebkitBackdropFilter: 'blur(30px)',
                                            backdropFilter: 'blur(30px)',
                                            boxShadow: lib.layout.boxShadow.basic,
                                        }}
                                        leftIcon={
                                            <IoChevronBackCircle
                                                size={24}
                                                color={lib.colors.primaryColor}
                                                style={{
                                                    marginRight: 5,
                                                    marginLeft: -5,
                                                }}
                                            />
                                        }
                                        textStyle={{
                                            color: lib.colors.primaryColor,
                                            fontSize: 18,
                                        }}
                                        label="go back"
                                        onClick={() => (pager === 0 ? closeModal() : setPage(0))}
                                    />{' '}
                                    <CurrencyToggler
                                        pref={localCurrencyPref}
                                        setPref={setLocalCurrencyPref}
                                        containerStyle={{
                                            position: 'absolute',
                                            right: 3,
                                            bottom: -45,
                                        }}
                                        floaterStyle={{
                                            background: lib.colors.transparentWhite,
                                            boxShadow: lib.layout.boxShadow.basic,
                                        }}
                                    />
                                </>
                            )} */}
            {/* </animated.div>
                    </animated.div>
                ); */}
            {/* })}  */}
        </>
    );
};

export default NameModalMobile;
