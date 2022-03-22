import React, { FC } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { IoOpenOutline } from 'react-icons/io5';

import { OfferData } from '@src/client/interfaces';
import { ListRenderItemProps } from '@src/components/general/List/List';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import { Route } from '@src/client/router';
import { Chain } from '@src/web3/core/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './RingAbout.styles';

type OfferExtraData = {
    chainId?: Chain;
    provider?: Web3Provider;
    type?: Route.SwapItem | Route.SwapNugg;
};

const OfferRenderItem: FC<ListRenderItemProps<OfferData, OfferExtraData, undefined>> = ({
    item,
    extraData,
}) => {
    const leader = web3.hook.usePriorityAnyENSName(
        extraData.type === Route.SwapItem ? 'nugg' : extraData.provider,
        item?.user || '',
    );
    return (
        <div style={styles.offerAmount}>
            <CurrencyText image="eth" value={item.eth.decimal.toNumber()} />
            {leader ? (
                <Text type="text" size="smaller" textStyle={{ color: lib.colors.textColor }}>
                    {leader}
                </Text>
            ) : null}
            <Button
                buttonStyle={styles.etherscanBtn}
                onClick={() =>
                    extraData.chainId &&
                    web3.config.gotoEtherscan(extraData.chainId, 'tx', item.txhash)
                }
                rightIcon={<IoOpenOutline color={lib.colors.nuggBlueText} size={14} />}
            />
        </div>
    );
};

export default OfferRenderItem;
