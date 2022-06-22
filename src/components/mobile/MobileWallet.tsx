import React, { FunctionComponent } from 'react';
import { IoIosArrowDroprightCircle } from 'react-icons/io';
import { plural, t } from '@lingui/macro';

import web3 from '@src/web3';
import client from '@src/client';
import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Label from '@src/components/general/Label/Label';
import Button from '@src/components/general/Buttons/Button/Button';
import { Page } from '@src/interfaces/nuggbook';
import InfoClicker from '@src/components/nuggbook/InfoClicker';
import { LiveNuggItem } from '@src/client/interfaces';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { ModalEnum } from '@src/interfaces/modals';
import ens_icon from '@src/assets/images/app_logos/ens.png';

import MyNuggItemListPhone from './MyNuggItemMobile';

type Props = Record<string, never>;

const MobileWallet: FunctionComponent<Props> = () => {
    const openModal = client.modal.useOpenModal();

    const provider = web3.hook.usePriorityProvider();
    const connector = web3.hook.usePriorityConnector();
    const address = web3.hook.usePriorityAccount();

    const peer = web3.hook.usePriorityPeer();

    const nuggs = client.user.useNuggs();

    const loans = client.user.useLoans();
    const unclaimedOffers = client.user.useUnclaimedOffersFilteredByEpoch();

    const [loansOpen, setLoansOpen] = React.useState(false);

    const [ens, ensValid] = client.ens.useEnsWithValidity(provider, address);

    const items = React.useMemo(() => {
        return Object.values(
            [...nuggs].reduce(
                (p, c) => ({
                    ...p,
                    ...c.items.reduce((p2, c2) => ({ ...p2, [c2.tokenId]: c2 }), {}),
                }),
                {},
            ),
        ) as LiveNuggItem[];
    }, [nuggs]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    marginTop: '20px',
                    width: '95%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                }}
            >
                <Text
                    size="larger"
                    textStyle={{
                        color: lib.colors.primaryColor,
                        padding: '10px',
                    }}
                >
                    {t`my account`}
                </Text>
            </div>
            <div
                style={{
                    marginTop: '10px',
                    marginBottom: '20px',

                    // width: '95%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: lib.colors.transparentWhite,
                    borderRadius: lib.layout.borderRadius.medium,
                    boxShadow: lib.layout.boxShadow.basic,

                    padding: '1rem',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        size="larger"
                        textStyle={{
                            color: lib.colors.primaryColor,
                            // textShadow: lib.layout.textShadow.heavy,
                            padding: '10px',
                        }}
                    >
                        {ens}
                    </Text>
                    {peer && <NLStaticImage image={`${peer.peer}_icon`} />}
                </div>
            </div>

            <Button
                className="mobile-pressable-div"
                label={!ensValid ? t`pick username` : t`edit username`}
                onClick={() => {
                    openModal({ modalType: ModalEnum.Name as const });
                }}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.medium,
                    background: !ensValid ? lib.colors.nuggRedText : lib.colors.transparentWhite,
                    padding: '10px 10px',
                    alignItems: 'center',
                    boxShadow: lib.layout.boxShadow.basic,
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                }}
                leftIcon={
                    ensValid ? (
                        <img
                            alt="ens logo"
                            src={ens_icon}
                            height={30}
                            style={{
                                borderRadius: '22.5%',
                                objectFit: 'cover',
                                marginRight: '10px',
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: 20, marginRight: 7 }}>⚠️</span>
                    )
                }
                textStyle={{
                    color: !ensValid ? lib.colors.white : lib.colors.primaryColor,
                    fontSize: 20,
                    ...lib.layout.presets.font.main.thicc,
                }}
            />
            <Button
                className="mobile-pressable-div"
                label={t`peace out`}
                onClick={() => {
                    void connector.deactivate();
                }}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.transparentWhite,
                    marginTop: '15px',
                    padding: '10px 10px',
                    alignItems: 'center',
                    boxShadow: lib.layout.boxShadow.basic,
                    marginBottom: '15px',
                }}
                leftIcon={<span style={{ fontSize: 20, marginRight: 7 }}>✌️</span>}
                textStyle={{
                    color: lib.colors.primaryColor,
                    fontSize: 20,
                    ...lib.layout.presets.font.main.thicc,
                }}
            />

            <div style={{ width: '325px', paddingTop: '20px', paddingBottom: '20px' }}>
                <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            paddingBottom: '20px',
                        }}
                    >
                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Text
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                    fontSize: '28px',
                                }}
                            >{`${plural(items.length, {
                                1: '# Item',
                                other: '# Items',
                            })}`}</Text>

                            <Text
                                textStyle={{
                                    fontSize: '13px',
                                    color: lib.colors.primaryColor,
                                    textShadow: lib.layout.boxShadow.dark,
                                }}
                            >
                                collected
                            </Text>
                        </div>

                        <div
                            style={{
                                alignItems: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Text
                                textStyle={{
                                    color: lib.colors.primaryColor,
                                    fontSize: '28px',
                                }}
                            >{`${plural(nuggs.length, {
                                1: '# Nugg',
                                other: '# Nuggs',
                            })}`}</Text>

                            <Text
                                textStyle={{
                                    fontSize: '13px',
                                    color: lib.colors.primaryColor,
                                }}
                            >
                                staked
                            </Text>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        width: '100%',
                    }}
                >
                    <div
                        className="mobile-pressable-div"
                        style={{
                            width: '100%',
                            background: lib.colors.gradient,
                            borderRadius: lib.layout.borderRadius.medium,
                            marginRight: '.2rem',
                            boxShadow: lib.layout.boxShadow.dark,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                        onClick={() => setLoansOpen(!loansOpen)}
                        aria-hidden="true"
                    >
                        <div
                            key={`${'loans'}-swaplist`}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '.3rem .5rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    size="large"
                                    textStyle={{
                                        color: 'white',
                                        paddingLeft: '.5rem',
                                    }}
                                >
                                    Loans ending soon
                                </Text>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Label
                                    containerStyles={{ marginRight: '10px' }}
                                    text={loans.length.toString()}
                                    // size="small"
                                />
                                <IoIosArrowDroprightCircle
                                    color="white"
                                    size={30}
                                    transform={loansOpen ? 'rotate(90deg)' : ''}
                                    style={{
                                        WebkitTransform: loansOpen ? 'rotate(90deg)' : '',
                                    }}
                                />
                            </div>
                        </div>
                        <InfoClicker
                            to={Page.WhatIsAnNFT}
                            text={t`learn about loans`}
                            size={15}
                            buttonStyle={{ paddingTop: 0 }}
                        />
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column-reverse',
                        width: '100%',
                        marginTop: '1rem',
                    }}
                >
                    <div
                        className="mobile-pressable-div"
                        style={{
                            width: '100%',
                            background: lib.colors.gradient2,
                            borderRadius: lib.layout.borderRadius.medium,
                            marginRight: '.2rem',
                            boxShadow: lib.layout.boxShadow.dark,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                        onClick={() => openModal({ modalType: ModalEnum.Claim })}
                        aria-hidden="true"
                    >
                        <div
                            key={`${'claims'}-swaplist`}
                            style={{
                                zIndex: 101,
                                background: lib.colors.gradient2,
                                borderRadius: lib.layout.borderRadius.large,
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '.3rem .5rem',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    size="large"
                                    textStyle={{
                                        color: 'white',
                                        paddingLeft: '.5rem',
                                    }}
                                >
                                    {t`pending claims`}
                                </Text>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Label
                                    containerStyles={{ marginRight: '10px' }}
                                    text={unclaimedOffers.length.toString()}
                                    size="small"
                                />
                            </div>
                        </div>
                        <InfoClicker
                            to={Page.WhatIsAnNFT}
                            text={t`learn about claims`}
                            size={15}
                            buttonStyle={{ paddingTop: 0 }}
                        />
                    </div>
                </div>
                <MyNuggItemListPhone />
            </div>
        </div>
    );
};

export default MobileWallet;
