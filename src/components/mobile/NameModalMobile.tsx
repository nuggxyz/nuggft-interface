/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { plural, t } from '@lingui/macro';
import { animated, config, useTransition } from '@react-spring/web';
import { IoChevronBackCircle } from 'react-icons/io5';
import { BigNumber } from '@ethersproject/bignumber';

import lib from '@src/lib';
import web3 from '@src/web3';
import {
    usePrioritySendTransaction,
    useENSRegistrarController,
    useENSResolver,
    useENSReverseRegistrar,
} from '@src/contracts/useContract';
import useAsyncState from '@src/hooks/useAsyncState';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import { useLocalSecret } from '@src/hooks/useLocaleStorage';
import Text from '@src/components/general/Texts/Text/Text';
import { useUsdPair } from '@src/client/usd';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { useGetEnsRegistrationsQuery } from '@src/gql/types.generated';
import { apolloClientEns } from '@src/web3/config';
import client from '@src/client';
import CurrencyToggler, {
    useCurrencyTogglerState,
} from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import Button from '@src/components/general/Buttons/Button/Button';
import eth from '@src/assets/images/app_logos/eth.png';
import ens_icon from '@src/assets/images/app_logos/ens.png';
import { InlineAnimatedConfirmation } from '@src/components/general/AnimatedTimers/AnimatedConfirmation';
import usePrevious from '@src/hooks/usePrevious';
import Loader from '@src/components/general/Loader/Loader';

import PeerButtonMobile from './PeerButtonMobile';

const commitGas = 46500;
const setNameGas = 54500;
const registerGas = 270000;

const totalGas = commitGas + setNameGas + registerGas;

const duration = 60 * 60 * 24 * 365;

export const useRegisterEnsName = () => {
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();
    const [ens, ensValid] = client.ens.useEnsWithValidity(provider, address);

    // const registrar = useENSRegistrar(provider);

    const controller = useENSRegistrarController(provider);
    const resolver = useENSResolver(provider);
    const reverseRegistrar = useENSReverseRegistrar(provider);
    const [commitLoading, setCommitLoading] = React.useState(false);
    const [reverseLoading, setReverseLoading] = React.useState(false);
    const [registerLoading, setRegisterLoading] = React.useState(false);

    // const expiration = useAsyncState(() => {
    //     if (!ens) return undefined;
    //     return controller.ttl(namehash(ens.replace('.eth', '')));
    // }, [ens, registrar]);

    const [text, setText] = React.useState<string>('');

    const [page, setPage] = React.useState<'home' | 'pick' | 'finalize'>('home');

    const { data, refetch } = useGetEnsRegistrationsQuery({
        client: apolloClientEns,
        variables: {
            address: address || '',
        },
    });

    const [currentRegistration, registrations] = React.useMemo(() => {
        if (data?.account?.registrations) {
            const curr = data.account.registrations
                .map((x) => {
                    if (!x?.domain?.name) return null;
                    const date = Math.floor(
                        (Number(x.expiryDate) - new Date().getTime() / 1000) / 84600,
                    );
                    return x?.domain?.name
                        ? {
                              name: x.domain.name,
                              expiresIn: {
                                  raw: date,
                                  days: date % 365,
                                  years: Math.floor(date / 365),
                              },
                          }
                        : null;
                })
                .filter((x): x is NonNullable<typeof x> => x !== null);

            return [curr.find((x) => x.name === ens), curr.filter((x) => x.name !== ens)];
        }
        return [undefined, undefined];
    }, [data, ens]);

    // console.log(expiration, currentRegistration?.expiresIn);

    const gasPrice = useAsyncState(() => {
        if (!provider) return undefined;
        return provider.getGasPrice();
    }, [provider]);

    const gasCost = React.useMemo(() => {
        if (!gasPrice) return undefined;
        return gasPrice.mul(totalGas);
    }, [gasPrice]);

    const secret = useLocalSecret('nugg.xyz-ens-secret', text);

    const alreadyOwned = React.useMemo(() => {
        if (!text || !registrations) return false;
        return registrations.find((x) => x.name === `${text}.eth`) ?? false;
    }, [text, registrations]);

    const nameOk = useAsyncState(() => {
        return alreadyOwned
            ? Promise.resolve(true)
            : text && text.length > 2
            ? controller.available(text)
            : Promise.resolve(null);
    }, [text, controller, alreadyOwned]);

    const price = useAsyncState(() => {
        if (!nameOk || !text || !controller) return undefined;
        if (alreadyOwned) return Promise.resolve(BigNumber.from(0));
        return controller.rentPrice(text, duration);
    }, [text, controller, nameOk]);

    const [send, estimator] = usePrioritySendTransaction(undefined, true);
    const blocknum = client.block.useBlock();
    const [commitDone, setCommitDone] = React.useState(false);

    const commitData = useAsyncState(() => {
        if (
            !nameOk ||
            !text ||
            !address ||
            !resolver ||
            !controller ||
            commitDone ||
            page !== 'finalize'
        )
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
    }, [text, address, resolver, nameOk, blocknum, commitDone, page]);

    const commit = React.useCallback(() => {
        if (commitData && commitData.ok) void send(commitData.tx, () => setCommitLoading(true));
    }, [commitData, send]);

    const registerDone = useAsyncState(() => {
        if (!provider || !address || page !== 'finalize') return Promise.resolve(false);

        const addr = provider.resolveName(`${text}.eth`);

        const waiter = async () => {
            const assumed = await addr;
            if (!assumed) return undefined;
            return assumed.toLowerCase() === address;
        };

        return waiter();
    }, [text, address, blocknum, provider, page]);

    const registerData = useAsyncState(() => {
        if (
            alreadyOwned ||
            page !== 'finalize' ||
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
        blocknum,
        commitData,
        controller,
        price,
        registerDone,
        page,
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
    }, [text, address, blocknum, provider]);

    const reverseData = useAsyncState(() => {
        if (!text || !address || !provider || !commitDone || reverseDone) return undefined;

        const tx = reverseRegistrar.populateTransaction['setName(string)'](`${text}.eth`);

        const ok = estimator.estimate(tx);

        const waiter = async () => {
            const gasLimit = await ok;
            return { tx, gasLimit, ok: !!gasLimit } as const;
        };

        return waiter();
    }, [text, address, resolver, nameOk, blocknum, commitDone, reverseDone]);

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

    const commitFeeUsd = useUsdPair(
        commitData?.gasLimit ? commitData.gasLimit.mul(gasPrice ?? 0) : 0,
    );
    const reverseFeeUsd = useUsdPair(
        reverseData?.gasLimit ? reverseData.gasLimit.mul(gasPrice ?? 0) : 0,
    );
    const registerFeeUsd = useUsdPair(
        registerData?.gasLimit ? registerData.gasLimit.add(price ?? 0) : 0,
    );

    const [stage] = React.useMemo(() => {
        if (!commitDone) return ['commit', commit] as const;
        if (reverseData?.ok && !reverseDone) return ['reverse', reverse] as const;
        if (registerData?.ok && !registerDone) return ['register', register] as const;
        if (!registerDone) return ['waiting', (): void => undefined];
        return ['done', (): void => undefined] as const;
    }, [
        reverseData,
        registerData,
        commitDone,
        registerDone,
        reverseDone,
        commit,
        reverse,
        register,
    ]);

    const Butt = React.useMemo(() => {
        switch (stage) {
            case 'commit':
                if (commitLoading || commitDone) return null;

                return (
                    <PeerButtonMobile
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            commit();
                        }}
                        fee={commitFeeUsd}
                    />
                );

            case 'reverse': {
                if (reverseLoading || reverseDone) return null;
                return (
                    <PeerButtonMobile
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            reverse();
                        }}
                        fee={reverseFeeUsd}
                    />
                );
            }

            case 'register':
                if (registerLoading || registerDone) return null;

                return (
                    <PeerButtonMobile
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            register();
                        }}
                        fee={registerFeeUsd}
                    />
                );
            default:
                return null;
        }
    }, [
        stage,
        commitLoading,
        commitDone,
        commitFeeUsd,
        reverseLoading,
        reverseDone,
        reverseFeeUsd,
        registerLoading,
        registerDone,
        registerFeeUsd,
        commit,

        reverse,
        register,
    ]);

    const estimatedPriceUsd = useUsdPair(price);
    const estimatedGasUsd = useUsdPair(price ? gasCost : 0);
    const estimatedTotal = useUsdPair(price?.add(gasCost ?? 0));

    const Home = React.useMemo(() => {
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
                <img
                    alt="ethereum logo"
                    src={eth}
                    height={50}
                    style={{
                        objectFit: 'cover',
                        marginBottom: 10,
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        padding: 20,
                        marginBottom: 40,
                    }}
                >
                    {ens && ensValid ? (
                        <Text size="larger">{ens}</Text>
                    ) : (
                        <Text
                            size="larger"
                            textStyle={{ color: lib.colors.transparentPrimaryColorSuper }}
                        >
                            [me]<span style={{ color: lib.colors.primaryColor }}>.eth</span>
                        </Text>
                    )}

                    {/* eslint-disable-next-line no-constant-condition */}
                    {currentRegistration ? (
                        <Text
                            size="small"
                            textStyle={{ marginTop: 10, color: lib.colors.transparentPrimaryColor }}
                        >
                            expires in{' '}
                            {`${plural(currentRegistration.expiresIn.years, {
                                1: '# year,',
                                other: `# years,`,
                            })} ${plural(currentRegistration.expiresIn.days, {
                                1: '# day',
                                other: `# days`,
                            })}`}
                            {}
                        </Text>
                    ) : ensValid ? (
                        <Text
                            size="small"
                            textStyle={{ marginTop: 10, color: lib.colors.transparentPrimaryColor }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                expires in <Loader style={{ marginLeft: 5 }} />
                            </div>
                        </Text>
                    ) : null}
                </div>

                <PeerButtonMobile
                    icon={ens_icon}
                    text="powered by ens"
                    header="buy a name"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPage('pick');
                    }}
                />
            </div>
        );
    }, [ens, currentRegistration, ensValid]);

    React.useEffect(() => {
        if (address && page === 'home' && ensValid && !currentRegistration) {
            void refetch({ address });
        }
    }, [currentRegistration, ensValid, page, address, refetch, blocknum]);

    //     <select aria-label="bob">
    //     {registrations.map((x) => (
    //         <option key={x} value={x}>
    //             {x}
    //         </option>
    //     ))}
    // </select>

    const globalCurrencyPref = client.usd.useCurrencyPreferrence();

    const [localCurrencyPref, setLocalCurrencyPref] = useCurrencyTogglerState(globalCurrencyPref);

    const PickAName = React.useMemo(() => {
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
                <Text
                    size="larger"
                    textStyle={{ ...lib.layout.presets.font.main.regular, marginBottom: 20 }}
                >
                    pick a name
                </Text>
                <TextInput
                    setValue={setText}
                    value={text}
                    shouldFocus
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        color: lib.colors.primaryColor,
                        margin: 20,
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
                        // background: lib.colors.transparentPrimaryColorSuper,
                        padding: '.3rem .6rem',
                        border: `6px solid ${
                            text.length < 3 || typeof nameOk !== 'boolean' || ens === `${text}.eth`
                                ? lib.colors.transparentPrimaryColorSuper
                                : nameOk
                                ? lib.colors.green
                                : lib.colors.red
                        }`,
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
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'start',
                        flexDirection: 'column',
                    }}
                >
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`ens price`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="larger"
                        stopAnimation
                        value={estimatedPriceUsd}
                    />{' '}
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`all transaction fees`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="larger"
                        stopAnimation
                        value={estimatedGasUsd}
                    />{' '}
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`total`}
                    </Text>
                    <CurrencyText
                        unitOverride={localCurrencyPref}
                        forceEth
                        size="larger"
                        stopAnimation
                        value={estimatedTotal}
                    />{' '}
                </div>
                <Button
                    disabled={!nameOk}
                    className="mobile-pressable-div"
                    label={t`let's do this`}
                    onClick={() => {
                        setPage('finalize');
                    }}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '30px',
                        padding: '10px 20px',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />
            </div>
        );
    }, [
        text,
        setText,
        estimatedGasUsd,
        nameOk,
        estimatedTotal,
        estimatedPriceUsd,
        localCurrencyPref,
        ens,
    ]);

    const Registration = React.useMemo(
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
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'start',
                        flexDirection: 'column',
                    }}
                >
                    <Text size="large" textStyle={{ marginTop: 10 }}>
                        {t`registering`}
                    </Text>
                    <Text size="larger" textStyle={{}}>
                        {text}.eth
                    </Text>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'center',
                        marginTop: '20px',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'start',
                            width: '100%',
                            alignItems: 'center',
                            marginBottom: '10px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: 30,
                                maxHeight: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: lib.colors.transparentWhite,
                                padding: '10px',
                                borderRadius: '50%',
                            }}
                        >
                            1
                        </div>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                marginLeft: 10,
                            }}
                        >
                            <Text
                                textStyle={{
                                    color: commitDone
                                        ? lib.colors.transparentPrimaryColor
                                        : lib.colors.primaryColor,
                                }}
                            >
                                tell ens i want to purchase
                            </Text>
                            <Text
                                textStyle={{
                                    color: commitDone
                                        ? lib.colors.transparentPrimaryColor
                                        : lib.colors.primaryColor,
                                }}
                                size="smaller"
                            >
                                required for security
                            </Text>
                        </div>
                    </div>

                    {(commitLoading || commitDone) && (
                        <InlineAnimatedConfirmation confirmed={commitDone} />
                    )}
                </div>

                {commitDone && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '20px',
                            flexDirection: 'column',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'start',
                                width: '100%',
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: 30,
                                    maxHeight: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: lib.colors.transparentWhite,
                                    padding: '10px',
                                    borderRadius: '50%',
                                }}
                            >
                                2
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    marginLeft: 10,
                                }}
                            >
                                <Text
                                    textStyle={{
                                        color: reverseDone
                                            ? lib.colors.transparentPrimaryColor
                                            : lib.colors.primaryColor,
                                    }}
                                >
                                    tell others what to call me
                                </Text>
                                <Text
                                    textStyle={{
                                        color: reverseDone
                                            ? lib.colors.transparentPrimaryColor
                                            : lib.colors.primaryColor,
                                    }}
                                    size="smaller"
                                >
                                    required to verify ownership
                                </Text>
                            </div>
                        </div>
                        {(reverseLoading || reverseDone) && (
                            <InlineAnimatedConfirmation confirmed={!!reverseDone} />
                        )}
                    </div>
                )}

                {reverseDone &&
                    (!registerData?.ok ? (
                        <div
                            style={{
                                padding: 20,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '20px',
                            }}
                        >
                            <Loader />{' '}
                            <Text textStyle={{ marginTop: 5 }}>verifying ability to purchase </Text>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: 'center',
                                marginTop: '20px',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'start',
                                    width: '100%',
                                    alignItems: 'center',
                                    marginBottom: '10px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: 30,
                                        maxHeight: 30,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: lib.colors.transparentWhite,
                                        padding: '10px',
                                        borderRadius: '50%',
                                    }}
                                >
                                    3
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        marginLeft: 10,
                                    }}
                                >
                                    <Text
                                        size="large"
                                        textStyle={{
                                            color: registerDone
                                                ? lib.colors.transparentPrimaryColor
                                                : lib.colors.primaryColor,
                                        }}
                                    >
                                        noooow purchase it
                                    </Text>
                                    <Text
                                        size="smaller"
                                        textStyle={{
                                            color: registerDone
                                                ? lib.colors.transparentPrimaryColor
                                                : lib.colors.primaryColor,
                                        }}
                                    >
                                        finally 😅
                                    </Text>
                                </div>
                            </div>

                            {(registerLoading || registerDone) && (
                                <InlineAnimatedConfirmation confirmed={!!registerDone} />
                            )}
                        </div>
                    ))}
                <div style={{ marginTop: 20 }} />
                {Butt}
            </div>
        ),
        [
            text,
            commitDone,
            commitLoading,
            reverseDone,
            reverseLoading,
            registerDone,
            registerLoading,
            registerData?.ok,
            Butt,
        ],
    );

    const inject = client.ens.useInject();

    const complete = React.useMemo(() => {
        return commitDone && reverseDone && registerDone;
    }, [commitDone, reverseDone, registerDone]);

    const prevComplete = usePrevious(complete);
    const prevReverseDone = usePrevious(reverseDone);

    React.useEffect(() => {
        if (!address) return;
        const the_ens = `${text}.eth`;
        if (complete && !prevComplete) {
            setPage('home');
            inject(address, the_ens);

            setTimeout(() => {
                setText('');
            }, 500);
        } else if (reverseDone && !prevReverseDone && !registerDone && the_ens !== ens) {
            inject(address, null);
        }
    }, [
        inject,
        registerDone,
        prevComplete,
        reverseDone,
        prevReverseDone,
        address,
        text,
        ens,
        complete,
    ]);

    React.useEffect(() => {
        setCommitDone(false);
        setCommitLoading(false);
        setRegisterLoading(false);
        setReverseLoading(false);
    }, [text]);

    return [
        text,
        setText,
        nameOk,
        price,
        page,
        setPage,
        Registration,
        PickAName,
        Home,
        localCurrencyPref,
        setLocalCurrencyPref,
    ] as const;
};

const NameModalMobile = () => {
    const closeModal = client.modal.useCloseModal();

    const [
        ,
        ,
        ,
        ,
        stage,
        setStage,
        TrippleFinalize,
        PickAName,
        Home,
        localCurrencyPref,
        setLocalCurrencyPref,
    ] = useRegisterEnsName();

    const Mem = React.useCallback(
        (_stage: typeof stage) => {
            return _stage === 'finalize' ? TrippleFinalize : _stage === 'pick' ? PickAName : Home;
        },
        [Home, PickAName, TrippleFinalize],
    );

    const [tabFadeTransition] = useTransition(
        stage,
        {
            from: () => ({
                opacity: 0,
            }),
            expires: 500,
            enter: { opacity: 1 },
            leave: () => {
                return {
                    opacity: 0,
                };
            },
            keys: (item) => `tabFadeTransition${item}5`,
            config: config.stiff,
        },
        [stage],
    );

    return tabFadeTransition((sty, pager) => {
        return (
            <animated.div
                style={{
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
                        background: lib.colors.transparentWhite,
                        transition: `.2s all ${lib.layout.animation}`,
                        borderRadius: lib.layout.borderRadius.largish,
                        boxShadow: lib.layout.boxShadow.basic,
                        margin: '0rem',
                        justifyContent: 'flex-start',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        ...sty,
                    }}
                >
                    {Mem(pager)}

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
                        label={t`go back`}
                        onClick={() =>
                            pager === 'home'
                                ? closeModal()
                                : pager === 'finalize'
                                ? setStage('pick')
                                : setStage('home')
                        }
                    />
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
                </animated.div>
            </animated.div>
        );
    });
};

export default NameModalMobile;
