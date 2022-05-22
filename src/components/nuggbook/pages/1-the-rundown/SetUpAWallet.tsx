import React from 'react';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { Peer } from '@src/web3/core/interfaces';

const PeerButton = React.memo<{
    peer: Peer.Coinbase | Peer.MetaMask;
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
                textStyle={{ color: lib.colors.white, marginLeft: 10 }}
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
                            }}
                        >
                            {text}
                        </Text>
                        <Text
                            textStyle={{
                                color: lib.colors.white,
                                fontSize: 25,
                            }}
                        >
                            {web3.config.peers[peer].name}
                        </Text>
                    </div>
                }
            />
        </div>
    ),
    (a, b) => a.peer === b.peer && a.text === b.text && a.color === b.color,
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
            <Text size="larger" textStyle={{ padding: '10px' }}>
                set up a wallet
            </Text>
            {/* <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                this will help you get set up so you can play with nuggft
            </Text> */}

            {/* <Text size="medium" textStyle={{}}>
                steps
            </Text> */}

            <Text
                size="medium"
                textStyle={{
                    padding: '15px',
                    fontFamily: lib.layout.font.sf.regular,
                    textAlign: 'left',
                }}
            >
                <Text
                    size="medium"
                    textStyle={{
                        fontFamily: lib.layout.font.sf.regular,
                        textAlign: 'left',
                    }}
                >
                    1️⃣ <b style={{ paddingLeft: 5 }}> download</b> an ethereum wallet
                </Text>

                <Text
                    size="medium"
                    textStyle={{
                        fontFamily: lib.layout.font.sf.regular,
                        textAlign: 'left',
                    }}
                >
                    2️⃣ <b style={{ paddingLeft: 5 }}> send</b> ethereum to the wallet
                </Text>
                {/* <Text
                    size="small"
                    textStyle={{
                        color: lib.colors.orange,
                        fontFamily: lib.layout.font.sf.regular,
                        textAlign: 'left',
                    }}
                >
                    🤑 [testers] <b style={{ paddingLeft: 5 }}> ask us for some test ethereum</b>
                </Text> */}
                <Text
                    size="medium"
                    textStyle={{
                        fontFamily: lib.layout.font.sf.regular,
                        textAlign: 'left',
                    }}
                >
                    3️⃣ <b style={{ paddingLeft: 5 }}> connect</b> to nuggft
                </Text>
            </Text>

            <Text size="larger" textStyle={{ textAlign: 'center', marginTop: 15 }}>
                1️⃣ <span style={{ paddingLeft: 5 }}>download a wallet</span>
            </Text>

            {/* <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                nuggft works best with either <b>coinbase wallet</b> or <b>metamask</b>
            </Text> */}
            <Text textStyle={{ padding: 5 }}>
                <Text
                    size="large"
                    textStyle={{ fontFamily: lib.layout.font.sf.regular, padding: 10 }}
                >
                    nice for <b>coinbase users</b>
                </Text>
                <PeerButton peer={Peer.Coinbase} text="tap to download" />
            </Text>
            <div style={{ marginTop: 5 }} />
            <Text textStyle={{ padding: 5 }}>
                <Text
                    size="large"
                    textStyle={{ fontFamily: lib.layout.font.sf.regular, padding: 10 }}
                >
                    good for <b>everyone</b>
                </Text>
                <PeerButton peer={Peer.MetaMask} text="tap to download" />
            </Text>

            <Text size="larger" textStyle={{ textAlign: 'center', marginTop: 30 }}>
                2️⃣ <span style={{ paddingLeft: 5 }}>get some ethereum</span>
            </Text>

            <Text textStyle={{ padding: 5 }}>
                <Text
                    size="large"
                    textStyle={{ fontFamily: lib.layout.font.sf.regular, padding: 10 }}
                >
                    something about apple pay and bank with coinbase
                </Text>
            </Text>

            <Text
                size="larger"
                textStyle={{ textAlign: 'center', marginTop: 30, marginBottom: 10 }}
            >
                3️⃣ <span style={{ paddingLeft: 5 }}>leggo</span>
            </Text>
            <Text size="large" textStyle={{ fontFamily: lib.layout.font.sf.regular, padding: 10 }}>
                <PeerButton
                    peer={Peer.Coinbase}
                    text="connect to nuggft"
                    color={lib.colors.gradient}
                />
            </Text>
            <Text size="large" textStyle={{ fontFamily: lib.layout.font.sf.regular, padding: 10 }}>
                <PeerButton
                    peer={Peer.MetaMask}
                    text="connect to nuggft"
                    color={lib.colors.gradient}
                />{' '}
            </Text>

            <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                FAQ
            </Text>
            <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                what other wallets can i use?
            </Text>
            <Text
                size="medium"
                textStyle={{ padding: '15px', fontFamily: lib.layout.font.sf.regular }}
            >
                where do i get eth from?
            </Text>
            <div>
                <Button
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
                />

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
