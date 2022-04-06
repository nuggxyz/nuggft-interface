import React, { FunctionComponent, useMemo } from 'react';

import lib, { isUndefinedOrNullOrObjectEmpty, parseTokenId } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';
import { ListData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import styles from './NuggDexComponents.styles';

type Props = InfiniteListRenderItemProps<ListData, undefined, ListData>;

const NuggListRenderItem: FunctionComponent<Props> = ({ item, action }) => {
    // const lastView__tokenId = client.live.lastView.tokenId();

    const style = useMemo(() => {
        return {
            ...(!isUndefinedOrNullOrObjectEmpty(item) ? styles.nuggListRenderItemContainer : {}),
            // ...(lastView__tokenId === item?.id ? styles.selected : {}),
        };
    }, [item]);

    return (
        <div aria-hidden="true" role="button" style={style} onClick={() => action && action(item)}>
            <TokenViewer
                tokenId={item?.id || ''}
                style={{
                    height: '200px',
                    width: '200px',
                }}
                disableOnClick
                // forceCache
                // shouldLoad={pageLoaded}
            />
            <div>
                <Label
                    text={parseTokenId(item?.id, true)}
                    size="larger"
                    containerStyles={{ marginBottom: '10px' }}
                />
                {item.listDataType === 'swap' && (
                    <>
                        <CurrencyText
                            textStyle={{ color: lib.colors.primaryColor }}
                            image="eth"
                            value={item.eth.number}
                            stopAnimation
                        />
                        {item.over && item.leader && <Label text={item.leader} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(
    NuggListRenderItem,
    (prevProps, props) =>
        JSON.stringify(prevProps.item) === JSON.stringify(props.item) &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
) as typeof NuggListRenderItem;
