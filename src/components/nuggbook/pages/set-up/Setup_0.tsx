import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';
import { t } from '@lingui/macro';

import lib, { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { Peer } from '@src/web3/core/interfaces';
import client from '@src/client';

export const PeerButton = React.memo<{
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

const Setup_0: NuggBookPage = ({ setPage }) => {
    const data = client.modal.useData();
    const openModal = client.modal.useOpenModal();
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
                    1️⃣ 📲{' '}
                    <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}> {t`download`}</span>{' '}
                    {t`an eth wallet`}
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
                    2️⃣ 💸 <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}>{t`send`}</span>{' '}
                    {t`eth to
                    the wallet`}
                </Text>

                <Text
                    size="medium"
                    textStyle={{
                        ...lib.layout.presets.font.main.semibold,
                        textAlign: 'left',
                        padding: '5px 0px',
                    }}
                >
                    3️⃣ 🐣 <span style={{ paddingLeft: 8, fontWeight: 'bolder' }}>{t`connect`}</span>{' '}
                    {t`to nuggft`}
                </Text>
            </Text>
            <div
                style={{
                    marginTop: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Button
                    className="mobile-pressable-div"
                    label={t`put me in, coach 🔥`}
                    onClick={() => {
                        setPage(Page.Setup_1, true);
                    }}
                    size="large"
                    buttonStyle={{
                        color: lib.colors.white,
                        boxShadow: lib.layout.boxShadow.basic,
                        padding: '.7rem 1.3rem',

                        background: lib.colors.primaryColor,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 15,
                    }}
                    textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
                />
                <Button
                    buttonStyle={{
                        backgroundColor: lib.colors.transparentWhite,
                        color: lib.colors.primaryColor,
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: '.4rem',
                        // width: '13rem',
                        alignItems: 'center',
                    }}
                    label="back"
                    leftIcon={
                        <IoIosArrowDropleftCircle
                            color={lib.colors.primaryColor}
                            style={{ marginRight: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => {
                        if (
                            !isUndefinedOrNullOrObjectEmpty(data) &&
                            !isUndefinedOrNullOrObjectEmpty(data.previousModal)
                        ) {
                            openModal(data.previousModal);
                        } else {
                            setPage(Page.TableOfContents, false);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Setup_0;
