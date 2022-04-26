import React from 'react';
import { IoOpenOutline, IoPowerOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { FiAtSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import Jazzicon from '@src/components/nugg/Jazzicon';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Flyout from '@src/components/general/Flyout/Flyout';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import globalStyles from '@src/lib/globalStyles';
import { useDarkMode } from '@src/client/hooks/useDarkMode';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const ens = web3.hook.usePriorityENSName(provider);
    const address = web3.hook.usePriorityAccount();
    const balance = web3.hook.usePriorityBalance(provider);
    const peer = web3.hook.usePriorityPeer();
    const connector = web3.hook.usePriorityConnector();

    const navigate = useNavigate();

    const darkmode = useDarkMode();

    return !address ? (
        <div
            style={{
                background: lib.colors.shadowLightGrey,
                height: '35px',
                width: '35px',
                borderRadius: 100,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: lib.layout.boxShadow.basic,
                // border: `3px solid ${lib.colors.transparentDarkGrey2}`,
            }}
        >
            <Button
                buttonStyle={{ background: lib.colors.transparent, padding: '.5rem .3rem' }}
                onClick={() => navigate('/wallet')}
                rightIcon={<FiAtSign style={{ color: lib.colors.darkerGray }} />}
            />
        </div>
    ) : ens && chainId && peer ? (
        <Flyout
            style={styles.flyout}
            button={
                <div style={styles.textContainer}>
                    <div
                        style={{
                            // marginRight: screenType ===|'phone' ? '0rem' : '.5rem',
                            ...styles.header,
                        }}
                    >
                        <div style={globalStyles.centeredSpaceBetween}>
                            <Text type="text" size="medium" textStyle={styles.text}>
                                {ens.toLowerCase()}
                            </Text>
                            <NLStaticImage image={`${peer.peer}_icon_small`} />
                        </div>
                        <Text
                            size="smaller"
                            type="code"
                            textStyle={{
                                ...styles.balance,
                                ...(darkmode ? { color: 'white' } : {}),
                            }}
                        >
                            ({web3.config.CHAIN_INFO[chainId].label})
                            {balance ? balance.decimal.toNumber().toPrecision(5) : 0} ETH
                        </Text>
                    </div>

                    <Jazzicon address={address} size={35} />
                </div>
            }
        >
            <>
                {/* {screenType === 'phone' && (
                    <Button
                        label={t`Wallet`}
                        type="text"
                        buttonStyle={styles.flyoutButton}
                        leftIcon={
                            <IoWallet
                                color={lib.colors.nuggBlueText}
                                size={25}
                                style={{ marginRight: '.75rem' }}
                            />
                        }
                        onClick={() => {
                            navigate('/wallet');
                        }}
                    />
                )} */}
                <Button
                    label={t`Explore`}
                    type="text"
                    buttonStyle={styles.flyoutButton}
                    leftIcon={
                        <IoOpenOutline
                            color={lib.colors.nuggBlueText}
                            size={25}
                            style={{ marginRight: '.75rem' }}
                        />
                    }
                    onClick={() => web3.config.gotoEtherscan(chainId, 'address', address)}
                />
                <Button
                    type="text"
                    label={t`Disconnect`}
                    buttonStyle={styles.flyoutButton}
                    leftIcon={
                        <IoPowerOutline
                            color={lib.colors.nuggBlueText}
                            size={25}
                            style={{ marginRight: '.75rem' }}
                        />
                    }
                    onClick={() => connector.deactivate()}
                />
            </>
        </Flyout>
    ) : null;
};

export default React.memo(AccountViewer);
