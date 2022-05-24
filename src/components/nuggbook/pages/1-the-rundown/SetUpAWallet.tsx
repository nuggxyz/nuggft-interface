import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';
import { BsApple } from 'react-icons/bs';
import { HiArrowRight } from 'react-icons/hi';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { Peer } from '@src/web3/core/interfaces';

const PeerButton = React.memo<{
    peer: Peer.CoinbaseWallet | Peer.MetaMask;
    text: string;
    color?: string;
}>(
    ({ peer, text, color }) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: 'center',
            }}
        >
            <Button
                className="mobile-pressable-div"
                // @ts-ignore
                buttonStyle={{
                    background: color ?? lib.colors.primaryColor,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.medium,
                    boxShadow: lib.layout.boxShadow.basic,
                    width: 'auto',
                }}
                hoverStyle={{ filter: 'brightness(1)' }}
                disabled={!peer}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(web3.config.peers[peer].deeplink_href);
                }}
                // label="open"
                size="largerish"
                textStyle={{
                    color: lib.colors.white,
                    marginLeft: 10,
                    ...lib.layout.presets.font.main.bold,
                }}
                leftIcon={<NLStaticImage image={`${peer}_icon`} />}
                rightIcon={
                    <div
                        style={{
                            display: 'flex',
                            textAlign: 'left',
                            flexDirection: 'column',
                            // width: '100%',
                            marginLeft: 10,
                            padding: '5px 0px',
                        }}
                    >
                        <Text
                            textStyle={{
                                color: lib.colors.white,
                                fontSize: 20,
                                ...lib.layout.presets.font.main.bold,
                            }}
                        >
                            {text}
                        </Text>
                        <Text
                            textStyle={{
                                color: lib.colors.white,
                                fontSize: 25,
                                ...lib.layout.presets.font.main.bold,
                            }}
                        >
                            {web3.config.peers[peer].name}
                        </Text>
                    </div>
                }
            />
        </div>
    ),
    (prev, curr) => prev.peer === curr.peer && prev.text === curr.text && prev.color === curr.color,
);

const SetUpAWallet: NuggBookPage = ({ setPage }) => {
    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
            }}
        >
            <Text
                size="largest"
                textStyle={{ padding: '20px', fontWeight: lib.layout.fontWeight.semibold }}
            >
                set up
            </Text>

            <Text
                size="medium"
                textStyle={{
                    padding: '10px',
                    ...lib.layout.presets.font.main.bold,
                    textAlign: 'left',
                }}
            >
                <Text
                    size="medium"
                    textStyle={{
                        ...lib.layout.presets.font.main.semibold,
                        textAlign: 'left',
                        padding: '5px 0px',
                        fontSize: '20px',
                    }}
                >
                    1️⃣ 📲 <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}> download</span> an
                    eth wallet
                </Text>

                <Text
                    size="medium"
                    textStyle={{
                        ...lib.layout.presets.font.main.semibold,
                        textAlign: 'left',
                        padding: '5px 0px',
                        fontSize: '20px',
                    }}
                >
                    2️⃣ 💸 <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}>send</span> eth to
                    the wallet
                </Text>
                {/* <Text
                    size="small"
                    textStyle={{
                        color: lib.colors.orange,
                        ...lib.layout.presets.font.main.semibold,
                        textAlign: 'left',
                        fontSize: '20px',
                    }}
                >
                    🤑 <span style={{ paddingLeft: 8 }}>[testers]</span> ask for some test eth
                </Text> */}
                <Text
                    size="medium"
                    textStyle={{
                        ...lib.layout.presets.font.main.semibold,
                        textAlign: 'left',
                        padding: '5px 0px',
                    }}
                >
                    3️⃣ 🐣 <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}>connect</span> to
                    nuggft
                </Text>
            </Text>
            {/* <Text size="largest" textStyle={{ textAlign: 'center', marginTop: 15, padding: 10 }}>
                📲
            </Text> */}
            <Text
                size="larger"
                textStyle={{
                    marginTop: 30,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                1️⃣ 📲 <span style={{ paddingLeft: 5 }}>download</span>
            </Text>

            <div style={{ padding: '10px 0px' }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.green,
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>easy for </span>
                        <span style={{ fontWeight: 'bolder', marginLeft: 4 }}>coinbase users</span>
                    </span>{' '}
                </Text>
                <PeerButton peer={Peer.CoinbaseWallet} text="tap to download" />
            </div>
            {/* <div style={{ marginTop: 5 }} /> */}
            <div style={{ padding: 5 }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.green,
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>easy for </span>
                        <span style={{ fontWeight: 'bolder', marginLeft: 4 }}>everyone</span>
                    </span>{' '}
                </Text>
                <PeerButton peer={Peer.MetaMask} text="tap to download" />
            </div>
            {/* <Text size="largest" textStyle={{ textAlign: 'center', marginTop: 30, padding: 10 }}>
                💸
            </Text> */}

            <Text
                size="larger"
                textStyle={{
                    marginTop: 50,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                2️⃣ 💸 <span style={{ paddingLeft: 5 }}>buy some eth</span>
            </Text>
            <div style={{ padding: '10px 0px' }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.orange,
                            color: 'white',
                            fontSize: '16px',

                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>helping us test?</span>
                    </span>
                </Text>
                <div
                    style={{
                        // marginTop: 10,
                        padding: 20,
                        borderRadius: lib.layout.borderRadius.medium,
                        // border: `${lib.colors.primaryColor} solid 3px`,
                        boxShadow: lib.layout.boxShadow.basic,
                        background: lib.colors.transparentWhite,
                    }}
                >
                    <Text
                        size="large"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            // margin: '15px 0px',
                            fontWeight: lib.layout.fontWeight.semibold,
                            // marginBottom: 10,
                        }}
                    >
                        ask us for some testnet ethereum
                    </Text>
                    <Text
                        size="large"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            padding: 10,
                            fontWeight: lib.layout.fontWeight.semibold,
                            // marginBottom: 10,
                        }}
                    >
                        you must switch to the{' '}
                        <b style={{ fontWeight: lib.layout.fontWeight.relative.bolder }}>rinkeby</b>{' '}
                        blockchain
                    </Text>
                    <Text
                        size="small"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            // marginTop: '10px',
                            fontWeight: lib.layout.fontWeight.thicc,
                            // marginBottom: 10,
                        }}
                    >
                        ps: you rock 💙
                    </Text>
                </div>
            </div>
            <div style={{ padding: '10px 0px', marginTop: 10 }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.green,
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>easy for </span>
                        <span style={{ fontWeight: 'bolder', marginLeft: 4 }}>coinbase users</span>
                    </span>
                </Text>
                <div
                    style={{
                        // marginTop: 10,
                        padding: 10,
                        borderRadius: lib.layout.borderRadius.medium,
                        // border: `${lib.colors.primaryColor} solid 3px`,
                        boxShadow: lib.layout.boxShadow.basic,
                        background: lib.colors.transparentWhite,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            textAlign: 'center',
                            alignItems: 'center',
                            padding: 10,
                        }}
                    >
                        <NLStaticImage image={Peer.Coinbase} />{' '}
                        <HiArrowRight size={23} style={{ marginRight: 3, margin: '0px 30px' }} />
                        <NLStaticImage image="coinbasewallet_icon" />
                    </div>

                    <Text
                        size="large"
                        textStyle={{
                            marginBottom: 10,
                            ...lib.layout.presets.font.main.regular,
                            fontWeight: lib.layout.fontWeight.thicc,
                        }}
                    >
                        transfer from exchange
                    </Text>
                </div>
            </div>
            <div style={{ padding: '10px 0px' }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
                >
                    <span
                        style={{
                            alignItems: 'center',
                            padding: '.3rem .5rem',
                            display: 'inline-flex',
                            justifyContent: 'flex-start',
                            background: lib.colors.green,
                            color: 'white',
                            fontSize: '16px',
                            borderRadius: lib.layout.borderRadius.large,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        <span>easy for </span>
                        <span style={{ fontWeight: 'bolder', marginLeft: 4 }}>everyone</span>
                    </span>
                </Text>
                <div
                    style={{
                        // marginTop: 10,
                        padding: 10,
                        borderRadius: lib.layout.borderRadius.medium,
                        // border: `${lib.colors.primaryColor} solid 3px`,
                        boxShadow: lib.layout.boxShadow.basic,
                        background: lib.colors.transparentWhite,
                    }}
                >
                    <div
                        style={{
                            fontSize: 30,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            textAlign: 'center',
                            alignItems: 'center',
                            padding: 10,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: lib.layout.fontFamily.sansserif,
                                display: 'flex',
                                justifyContent: 'center',

                                alignItems: 'center',
                            }}
                        >
                            <BsApple size={23} style={{ marginRight: 3 }} />
                            <span style={{ fontSize: 30 }}>Pay</span>
                        </div>
                        <Text textStyle={{ padding: 10, fontSize: 30 }}>🏛</Text>
                        <Text textStyle={{ fontSize: 30 }}>💳 </Text>
                        <HiArrowRight size={23} style={{ marginRight: 3, margin: '0px 30px' }} />
                        <NLStaticImage image="metamask_icon" />
                    </div>

                    <Text
                        size="large"
                        textStyle={{
                            ...lib.layout.presets.font.main.regular,
                            // margin: '15px 0px',
                            fontWeight: lib.layout.fontWeight.thicc,
                            marginBottom: 10,
                        }}
                    >
                        buy in wallet
                    </Text>
                </div>
            </div>

            <Text
                size="larger"
                textStyle={{
                    marginTop: 40,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                3️⃣ 🐣 <span style={{ paddingLeft: 5 }}>leggo</span>
            </Text>
            <div style={{ padding: '20px 0px', marginTop: 15 }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.bold, padding: 10 }}
                >
                    <PeerButton
                        peer={Peer.CoinbaseWallet}
                        text="connect to nuggft"
                        color={lib.colors.gradient}
                    />
                </Text>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.bold, padding: 10, marginTop: 10 }}
                >
                    <PeerButton
                        peer={Peer.MetaMask}
                        text="connect to nuggft"
                        color={lib.colors.gradient}
                    />
                </Text>
            </div>
            {/* <Text
                size="medium"
                textStyle={{ padding: '15px', ...lib.layout.presets.font.main.bold }}
            >
                FAQ
            </Text>
            <Text
                size="medium"
                textStyle={{ padding: '15px', ...lib.layout.presets.font.main.bold }}
            >
                what other wallets can i use?
            </Text> */}

            <div style={{ marginTop: 20 }}>
                {/* <Button
                    label="next"
                    buttonStyle={{
                        background: lib.colors.gradient,
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: '.8rem',
                        backgroundColor: lib.colors.white,
                        alignItems: 'center',
                    }}
                    rightIcon={
                        <IoIosArrowDroprightCircle
                            color="white"
                            style={{ marginLeft: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => setPage(Page.TableOfContents)}
                /> */}

                <Button
                    buttonStyle={{
                        background: lib.colors.gradient2,
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: '.4rem',
                        backgroundColor: lib.colors.white,
                        // width: '13rem',
                        alignItems: 'center',
                    }}
                    label="back"
                    leftIcon={
                        <IoIosArrowDropleftCircle
                            color="white"
                            style={{ marginRight: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => setPage(Page.TableOfContents)}
                />
            </div>
        </div>
    );
};

export default SetUpAWallet;
