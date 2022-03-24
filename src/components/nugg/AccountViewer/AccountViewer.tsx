import React from 'react';
import { IoOpenOutline, IoPowerOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';

import Jazzicon from '@src/components/nugg/Jazzicon';
import Text from '@src/components/general/Texts/Text/Text';
import AppState from '@src/state/app';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Flyout from '@src/components/general/Flyout/Flyout';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import globalStyles from '@src/lib/globalStyles';

import styles from './AccountViewer.styles';

const AccountViewer = () => {
    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const ens = web3.hook.usePriorityENSName(provider);
    const address = web3.hook.usePriorityAccount();
    const balance = web3.hook.usePriorityBalance(provider);
    const peer = web3.hook.usePriorityPeer();
    const connector = web3.hook.usePriorityConnector();

    return ens && address && chainId && peer ? (
        <Flyout
            style={styles.flyout}
            button={
                <div style={styles.textContainer}>
                    <div
                        style={{
                            marginRight: screenType === 'phone' ? '0rem' : '.5rem',
                            ...styles.header,
                        }}
                    >
                        <div style={globalStyles.centeredSpaceBetween}>
                            <Text type="text" size="medium" textStyle={styles.text}>
                                {ens.toLowerCase()}
                            </Text>
                            <NLStaticImage image={`${peer.peer}_icon_small`} />
                            {screenType === 'phone' && <Jazzicon address={address} size={15} />}
                        </div>
                        <Text size="smaller" type="code" textStyle={styles.balance}>
                            ({web3.config.CHAIN_INFO[chainId].label})
                            {balance ? balance.decimal.toNumber().toPrecision(5) : 0} ETH
                        </Text>
                    </div>
                    {screenType !== 'phone' && <Jazzicon address={address} size={35} />}
                </div>
            }
        >
            <>
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
