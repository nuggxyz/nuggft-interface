import React, { FunctionComponent } from 'react';

import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';

// const NuggListRenderItemMobileSwap = ({ tokenId }: { tokenId: TokenId }) => {
//     const swap = client.swaps.useSwap(tokenId);
//     return swap ? (
//         <div
//             style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//             }}
//         >
//             <Label
//                 text={tokenId.toPrettyId()}
//                 size="larger"
//                 containerStyles={{ marginBottom: '10px' }}
//             />
//             <CurrencyText
//                 textStyle={{ color: lib.colors.primaryColor }}
//                 image="eth"
//                 value={swap.eth.number}
//                 stopAnimation
//             />
//             {swap.leader && (
//                 <Label
//                     text={swap.isItem() ? swap.leader.toPrettyId() : shortenAddress(swap.leader)}
//                 />
//             )}
//         </div>
//     ) : null;
// };

type PropsBig = InfiniteListRenderItemProps<
    TokenId,
    { cardType: 'swap' | 'all' | 'recent' },
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
    { cardType: 'swap' | 'all' | 'recent' },
    undefined
>;

const NuggListRenderItemMobile: FunctionComponent<Props> = ({
    item,
    // action,
    // extraData: { cardType },
}) => {
    const [tokenId, tokenId2] = item;

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
                transition: `background .7s ${lib.layout.animation}`,
                // cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
            }}
            // onClick={() => action && action(item)}
        >
            {/* <div> */}
            {tokenId && <MobileContainer tokenId={tokenId} />}
            {tokenId2 && <MobileContainer tokenId={tokenId2} />}
            {/* </div> */}

            {/* <TokenViewer
                tokenId={tokenId}
                style={{
                    height: '200px',
                    width: '200px',
                    padding: '1rem',
                }}
                disableOnClick
                // forceCache
                // shouldLoad={isPageLoaded}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {cardType === 'swap' ? (
                    <NuggListRenderItemMobileSwap tokenId={tokenId} />
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Label
                            text={tokenId.toPrettyId()}
                            size="larger"
                            containerStyles={{ marginBottom: '10px' }}
                        />
                    </div>
                )}
            </div> */}
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

            {/* <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '.3rem',
                borderRadius: lib.layout.borderRadius.large,
                position: 'absolute',
                top: '.1rem',
                left: '.1rem',
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
                text={item.activeLoan ? 'loaned' : 'unloaned'}
                leftDotColor={item.activeLoan ? lib.colors.green : lib.colors.red}
            />
        </div> */}
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

            {/* {swap ? (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'end',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        buttonStyle={{
                            marginBottom: '.4rem',
                            borderRadius: lib.layout.borderRadius.large,
                            backgroundColor: lib.colors.white,
                            padding: '.2rem .7rem',
                        }}
                        textStyle={{
                            background: lib.colors.gradient3,
                            color: 'black',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                        label={t`For sale`}
                        rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
                        onClick={() => navigate(`/swap/${tokenId}`)}
                    />
                </div>
            ) : null} */}

            {/* {claims.length > 0 && (
            <div
                style={{
                    position: 'absolute',
                    bottom: 5,
                    left: 2,
                    display: 'flex',
                    flexDirection: 'row',

                    justifyContent: 'center',
                    alignItems: 'end',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        // width: '100%',
                        background: lib.colors.gradient2,
                        borderRadius: lib.layout.borderRadius.large,
                        margin: '1rem',
                        paddingRight: '.2rem',
                        paddingLeft: '.2rem',

                        // width: '150px',
                        // height: '60px',
                    }}
                >
                    <div
                        key={`${'claims'}-swaplist`}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '.5rem',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Label text={claims.length.toString()} size="smaller" />
                            <Text
                                size="smaller"
                                textStyle={{
                                    color: 'white',
                                    paddingLeft: '.5rem',
                                }}
                            >
                                Pending Claim
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        )} */}
            {/* {Number(item.feature) !== constants.FEATURE_BASE &&
            extraData.isOwner &&
            (!swap ? (
                <Button
                    label="Sell"
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.gradient2Transparent,
                        position: 'absolute',
                        right: '1rem',
                    }}
                    leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                    textStyle={{
                        color: lib.colors.white,
                        marginLeft: '.5rem',
                    }}
                    type="text"
                    onClick={() => {
                        openModal({
                            modalType: ModalEnum.Sell,
                            tokenId: item.id,
                            tokenType: 'item',
                            sellingNuggId: extraData.tokenId,
                        });
                    }}
                />
            ) : (
                <Button
                    label="Reclaim"
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.gradient2Transparent,
                        position: 'absolute',
                        right: '1rem',
                    }}
                    leftIcon={<IoSync color={lib.colors.white} />}
                    textStyle={{
                        color: lib.colors.white,
                        marginLeft: '.5rem',
                    }}
                    type="text"
                    onClick={() => {
                        if (item.activeSwap && sender)
                            void send(
                                nuggft.populateTransaction.claim(
                                    [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                    [Address.ZERO.hash],
                                    [sender],
                                    [formatItemSwapIdForSend(item.activeSwap).itemId],
                                ),
                            );
                    }}
                />
            ))} */}
        </div>
    );
};

export const MobileContainerBig = ({ tokenId }: { tokenId: TokenId }) => {
    // const swap = client.swaps.useSwap(tokenId);
    // const navigate = useNavigate();
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

            {/* <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '.3rem',
                borderRadius: lib.layout.borderRadius.large,
                position: 'absolute',
                top: '.1rem',
                left: '.1rem',
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
                text={item.activeLoan ? 'loaned' : 'unloaned'}
                leftDotColor={item.activeLoan ? lib.colors.green : lib.colors.red}
            />
        </div> */}
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

            {/* {swap ? (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        right: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'end',
                        textAlign: 'center',
                    }}
                >
                    <Button
                        buttonStyle={{
                            marginBottom: '.4rem',
                            borderRadius: lib.layout.borderRadius.large,
                            backgroundColor: lib.colors.white,
                            padding: '.2rem .7rem',
                        }}
                        textStyle={{
                            background: lib.colors.gradient3,
                            color: 'black',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                        label={t`For sale`}
                        rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
                        onClick={() => navigate(`/swap/${tokenId}`)}
                    />
                </div>
            ) : null} */}

            {/* {claims.length > 0 && (
            <div
                style={{
                    position: 'absolute',
                    bottom: 5,
                    left: 2,
                    display: 'flex',
                    flexDirection: 'row',

                    justifyContent: 'center',
                    alignItems: 'end',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        // width: '100%',
                        background: lib.colors.gradient2,
                        borderRadius: lib.layout.borderRadius.large,
                        margin: '1rem',
                        paddingRight: '.2rem',
                        paddingLeft: '.2rem',

                        // width: '150px',
                        // height: '60px',
                    }}
                >
                    <div
                        key={`${'claims'}-swaplist`}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '.5rem',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Label text={claims.length.toString()} size="smaller" />
                            <Text
                                size="smaller"
                                textStyle={{
                                    color: 'white',
                                    paddingLeft: '.5rem',
                                }}
                            >
                                Pending Claim
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        )} */}
            {/* {Number(item.feature) !== constants.FEATURE_BASE &&
            extraData.isOwner &&
            (!swap ? (
                <Button
                    label="Sell"
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.gradient2Transparent,
                        position: 'absolute',
                        right: '1rem',
                    }}
                    leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                    textStyle={{
                        color: lib.colors.white,
                        marginLeft: '.5rem',
                    }}
                    type="text"
                    onClick={() => {
                        openModal({
                            modalType: ModalEnum.Sell,
                            tokenId: item.id,
                            tokenType: 'item',
                            sellingNuggId: extraData.tokenId,
                        });
                    }}
                />
            ) : (
                <Button
                    label="Reclaim"
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.gradient2Transparent,
                        position: 'absolute',
                        right: '1rem',
                    }}
                    leftIcon={<IoSync color={lib.colors.white} />}
                    textStyle={{
                        color: lib.colors.white,
                        marginLeft: '.5rem',
                    }}
                    type="text"
                    onClick={() => {
                        if (item.activeSwap && sender)
                            void send(
                                nuggft.populateTransaction.claim(
                                    [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                    [Address.ZERO.hash],
                                    [sender],
                                    [formatItemSwapIdForSend(item.activeSwap).itemId],
                                ),
                            );
                    }}
                />
            ))} */}
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
