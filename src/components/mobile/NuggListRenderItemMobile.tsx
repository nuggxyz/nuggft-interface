import React, { FunctionComponent } from 'react';

import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';

type PropsBig = InfiniteListRenderItemProps<
    TokenId,
    { cardType: 'swap' | 'all' | 'recent' } | undefined,
    undefined
>;

export const NuggListRenderItemMobileBig: FunctionComponent<PropsBig> = ({
    item,
    // action,
    // extraData: { cardType },
}) => {
    return (
        <div
            aria-hidden="true"
            role="button"
            style={{
                width: '100%',
                // height: '200px',
                display: 'flex',
                marginBottom: 10,
                justifyContent: 'space-around',
                alignItems: 'center',
                transition: `background .7s ${lib.layout.animation}`,
                // cursor: 'pointer',
                position: 'relative',
                // overflow: 'hidden',
            }}
            // onClick={() => action && action(item)}
        >
            <MobileContainerBig tokenId={item} />
        </div>
    );
};
type Props = InfiniteListRenderItemProps<
    [TokenId | undefined, TokenId | undefined],
    { cardType: 'swap' | 'all' | 'recent' } | undefined,
    undefined
>;

const NuggListRenderItemMobile: FunctionComponent<Props> = ({
    item,
    // action,
    // extraData: { cardType },
}) => {
    return (
        <div
            aria-hidden="true"
            role="button"
            style={{
                width: '100%',
                // height: '200px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                // padding: '0px 20px',
                transition: `background .7s ${lib.layout.animation}`,
                // cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
            // onClick={() => action && action(item)}
        >
            {/* <div> */}
            {item[0] && <MobileContainer tokenId={item[0]} />}
            {item[1] && <MobileContainer tokenId={item[1]} />}
        </div>
    );
};

export const MobileContainer = ({ tokenId }: { tokenId: TokenId }) => {
    // const swap = client.swaps.useSwap(tokenId);
    // const navigate = useNavigate();
    return (
        <div
            className="mobile-pressable-div"
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',

                width: '150px',
                height: '150px',

                flexDirection: 'column',
                justifyContent: 'center',
                // marginBottom: '1.5rem',
                background: lib.colors.transparentWhite,
                borderRadius: lib.layout.borderRadius.mediumish,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    top: '.1rem',
                    right: '.1rem',
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={tokenId.toPrettyId()}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TokenViewer
                    tokenId={tokenId}
                    style={{
                        height: '75px',
                        width: '75px',
                    }}
                />
            </div>
        </div>
    );
};

export const MobileContainerBig = ({ tokenId }: { tokenId: TokenId }) => {
    return (
        <div
            className="mobile-pressable-div"
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',

                width: '325px',
                height: '325px',

                flexDirection: 'column',
                justifyContent: 'center',
                // marginBottom: '1.5rem',
                background: lib.colors.transparentWhite,
                borderRadius: lib.layout.borderRadius.mediumish,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    top: '.1rem',
                    right: '.1rem',
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        // fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={tokenId.toPrettyId()}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TokenViewer
                    tokenId={tokenId}
                    style={{
                        height: '250px',
                        width: '250px',
                    }}
                />
            </div>
        </div>
    );
};

export default React.memo(
    NuggListRenderItemMobile,
    (prevProps, props) =>
        prevProps.item === props.item &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
) as typeof NuggListRenderItemMobile;
