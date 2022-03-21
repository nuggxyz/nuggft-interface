import React, { FC } from 'react';
import { Web3Provider } from '@ethersproject/providers';

import { OfferData } from '@src/client/core';
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
        <Button
            onClick={() => {
                if (extraData.chainId) {
                    web3.config.gotoEtherscan(extraData.chainId, 'tx', item.txhash);
                }
            }}
            buttonStyle={styles.offerAmount}
            rightIcon={
                <>
                    <CurrencyText image="eth" value={item.eth.decimal.toNumber()} stopAnimation />
                    {leader ? (
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{ color: lib.colors.textColor }}
                        >
                            {leader}
                        </Text>
                    ) : null}
                </>
            }
        />
    );
};

export default OfferRenderItem;
