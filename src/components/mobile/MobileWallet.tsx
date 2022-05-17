import React, { FunctionComponent } from 'react';
import { IoIosArrowDroprightCircle } from 'react-icons/io';
import { plural } from '@lingui/macro';
import { IoLogoUsd } from 'react-icons/io5';
import { SiEthereum } from 'react-icons/si';

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
import ConnectTab from '@src/components/nugg/Wallet/tabs/ConnectTab/ConnectTab';
import DualToggler from '@src/components/general/Buttons/DualToggler/DualToggler';
import { ModalEnum } from '@src/interfaces/modals';

import MyNuggItemListPhone from './MyNuggItemMobile';

type Props = Record<string, never>;

// const TryoutRenderItem: FC<ListRenderItemProps<LiveNuggItem, undefined, undefined>> = ({
//     item,
// }) => {
//     return (
//         <div
//             style={{
//                 borderRadius: lib.layout.borderRadius.medium,
//                 transition: '.2s background ease',
//                 // background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
//                 padding: '10px',
//             }}
//             aria-hidden="true"
//         >
//             <TokenViewer
//                 tokenId={item.tokenId}
//                 style={{ width: '60px', height: '60px' }}
//                 disableOnClick
//             />
//         </div>
//     );
// };

const MobileConnectTab = () => {
    return (
        <div style={{ width: '100%', height: '100%', overflow: 'scroll', padding: 10 }}>
            <div
                style={{
                    // marginTop: '20px',
                    width: '95%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginBottom: -20,
                }}
            >
                <Text
                    size="larger"
                    textStyle={{
                        color: lib.colors.primaryColor,
                        padding: '10px',
                    }}
                >
                    sign in
                </Text>
            </div>
            <ConnectTab />
        </div>
    );
};

const MobileWallet: FunctionComponent<Props> = () => {
    const address = web3.hook.usePriorityAccount();
    const openModal = client.modal.useOpenModal();

    const provider = web3.hook.usePriorityProvider();
    const connector = web3.hook.usePriorityConnector();

    const chainId = web3.hook.usePriorityChainId();
    const peer = web3.hook.usePriorityPeer();

    // const stake__eps = client.live.stake.eps();
    const nuggs = client.live.myNuggs();

    const loans = client.live.myLoans();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    // const [pendingClaimsOpen, setPendingClaimsOpen] = React.useState(false);
    const [loansOpen, setLoansOpen] = React.useState(false);

    const ens = web3.hook.usePriorityENSName(provider);

    // const nuggft = useNuggftV1(provider);

    // const args = useMultiClaimArgs();

    // const { send } = usePrioritySendTransaction();

    const setCurrencyPreference = client.usd.useSetCurrencyPreferrence();
    const currencyPreferrence = client.usd.useCurrencyPreferrence();
    console.log({ nuggs });
    const items = React.useMemo(() => {
        return Object.values(
            nuggs.reduce(
                (p, c) => ({
                    ...p,
                    ...c.items.reduce((p2, c2) => ({ ...p2, [c2.tokenId]: c2 }), {}),
                }),
                {},
            ),
        ) as LiveNuggItem[];
    }, [nuggs]);

    return chainId && provider ? (
        address ? (
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
                        My Account
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
                        padding: '1rem',
                    }}
                >
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
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
                    <Button
                        size="small"
                        textStyle={{ color: lib.colors.primaryColor }}
                        buttonStyle={{ background: 'transparent', padding: 0 }}
                        onClick={() => {
                            void connector.deactivate();
                        }}
                        label="change accounts"
                    />
                </div>
                <DualToggler
                    LeftIcon={SiEthereum}
                    RightIcon={IoLogoUsd}
                    toggleActiveIndex={(input) => {
                        setCurrencyPreference(input === 0 ? 'ETH' : 'USD');
                        return undefined;
                    }}
                    activeIndex={currencyPreferrence === 'ETH' ? 0 : 1}
                    // floaterStyle={{ background: floaterColor }}
                    // containerStyle={floaterWrapperStyle}
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
                                // margin: '1rem',
                                marginRight: '.2rem',
                                boxShadow: lib.layout.boxShadow.dark,
                                // marginRight: 0,
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
                                text="learn about loans"
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
                                // margin: '1rem',
                                marginRight: '.2rem',
                                boxShadow: lib.layout.boxShadow.dark,
                                // marginRight: 0,
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
                                        Pending Claims
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
                                    {/* <IoIosArrowDroprightCircle
                                        color="white"
                                        size={30}
                                        transform={pendingClaimsOpen ? 'rotate(90deg)' : ''}
                                        style={{
                                            WebkitTransform: pendingClaimsOpen
                                                ? 'rotate(90deg)'
                                                : '',
                                        }} /> */}
                                </div>
                            </div>
                            <InfoClicker
                                to={Page.WhatIsAnNFT}
                                text="learn about claims"
                                size={15}
                                buttonStyle={{ paddingTop: 0 }}
                            />

                            {/* {pendingClaimsOpen && (
                                <div
                                    style={{
                                        marginTop: '-20px',
                                        background: lib.colors.gradient2Transparent,
                                        padding: '0rem .2rem',
                                        paddingTop: '1.5rem',

                                        borderRadius: lib.layout.borderRadius.medium,
                                        borderTopRightRadius: 0,
                                        borderTopLeftRadius: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%',
                                        zIndex: 102,
                                        justifyContent: 'start',
                                        alignItems: 'center',
                                    }}
                                >
                                    {unclaimedOffers.length > 0 && (
                                        <Button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                event.preventDefault();
                                                void send(
                                                    nuggft.populateTransaction.claim(...args),
                                                );
                                            }}
                                            buttonStyle={{ zIndex: 103 }}
                                            label="Claim All"
                                        />
                                    )}
                                    {unclaimedOffers.map((x, i) => (
                                        <div
                                            key={`${i}-swaplist`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '.5rem',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Label text={(i + 1).toString()} size="small" />
                                                <Text
                                                    size="small"
                                                    textStyle={{
                                                        color: 'white',
                                                        paddingLeft: '.5rem',
                                                    }}
                                                >
                                                    Nugg {x.nugg}
                                                </Text>
                                            </div>
                                            <CurrencyText
                                                size="small"
                                                image="eth"
                                                value={x.eth.number}
                                                stopAnimation
                                            />
                                        </div>
                                    ))}
                                </div>
                            )} */}
                        </div>
                    </div>
                    <MyNuggItemListPhone />
                </div>
            </div>
        ) : (
            <MobileConnectTab />
        )
    ) : null;
};

export default MobileWallet;
