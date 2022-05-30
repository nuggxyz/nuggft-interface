import React, { FC } from 'react';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import TokenViewer from '@src/components/nugg/TokenViewer';
import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import { useGetNuggSnapshotsQuery, GetNuggSnapshotsQueryResult } from '@src/gql/types.generated';

const NuggSnapshotListMobile: FC<{ tokenId: NuggId }> = ({ tokenId }) => {
    const { data } = useGetNuggSnapshotsQuery({
        variables: {
            tokenId: tokenId?.toRawId() || '',
        },
    });

    return (
        <div
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-evenly',
                overflow: 'visible',
                marginTop: '1rem',
            }}
        >
            {[...(data?.nugg?.snapshots || [])]
                .sort((a, b) => (BigNumber.from(a.block).gt(BigNumber.from(b.block)) ? -1 : 1))
                .map((x, i) => (
                    <NuggSnapshotRenderItem
                        item={x}
                        key={`NuggSnapshotRenderItemListMobile-${tokenId}-${i}`}
                        index={i}
                    />
                ))}
        </div>
    );
};

const NuggSnapshotRenderItem: FC<{
    item: NonNullable<
        NonNullable<GetNuggSnapshotsQueryResult['data']>['nugg']
    >['snapshots'][number];
    index: number;
}> = ({ item, index }) => {
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
                marginBottom: '1.5rem',
                background:
                    index === 0 ? lib.colors.gradientTransparent : lib.colors.transparentWhite,
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
                    text={`Version ${item.snapshotNum}`}
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
                    tokenId={undefined}
                    svgNotFromGraph={item.chunk as Base64EncodedSvg}
                    style={{
                        height: '225px',
                        width: '225px',
                    }}
                />
            </div>
        </div>
    );
};

export default NuggSnapshotListMobile;
