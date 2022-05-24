import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import { Peer } from '@src/web3/core/interfaces';

import { PeerButton } from './Setup_0';

const Setup_1: NuggBookPage = ({ setPage }) => {
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
                size="larger"
                textStyle={{
                    marginTop: 20,
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
                    label="ONWARD 😤" // maybe "give me something harder"
                    onClick={() => {
                        setPage(Page.Setup_2, true);
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
                    onClick={() => setPage(Page.Setup_0, false)}
                />
            </div>
        </div>
    );
};

export default Setup_1;
