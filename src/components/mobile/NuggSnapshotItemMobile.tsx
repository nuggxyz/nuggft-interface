import React, { FC } from 'react';

import TokenViewer from '@src/components/nugg/TokenViewer';
import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import { GetNuggSnapshotsQueryResult } from '@src/gql/types.generated';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';

export const NuggSnapshotRenderItem: FC<
    GodListRenderItemProps<
        NonNullable<NonNullable<GetNuggSnapshotsQueryResult['data']>['nugg']>['snapshots'][number],
        unknown,
        unknown
    >
> = ({ item }) => {
    return (
        <div
            aria-hidden="true"
            role="button"
            style={{
                width: '100%',
                display: 'flex',
                marginBottom: 10,
                justifyContent: 'space-around',
                alignItems: 'center',
                transition: `background .7s ${lib.layout.animation}`,
                position: 'relative',
            }}
        >
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
                    background: lib.colors.transparentWhite,
                    borderRadius: lib.layout.borderRadius.mediumish,
                    boxShadow: lib.layout.boxShadow.basic,
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
                        text={`v${item?.snapshotNum || '0'}`}
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
                        svgNotFromGraph={item?.chunk as Base64EncodedSvg}
                        style={{
                            height: '275px',
                            width: '275px',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
