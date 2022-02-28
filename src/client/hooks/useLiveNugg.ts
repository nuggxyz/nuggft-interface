import { gql } from '@apollo/client';
import React, { ReactSVG, useEffect } from 'react';

import client from '..';

type Nugg = {
    activeSwap: {
        id: string;
        epoch: {
            startBlock: number;
            endBlock: number;
            id: number;
            status: 'OVER' | 'ACTIVE' | 'PENDING';
        };
    };
    svg: ReactSVG;
};

export const useLiveNugg = (tokenId: string) => {
    const [nugg, setNugg] = React.useState<Nugg>(undefined);

    const apollo = client.useApollo();

    useEffect(() => {
        if (tokenId) {
            const instance = apollo
                .subscribe<{
                    nugg: {
                        id: string;
                        dotnuggRawCache: string;
                        activeSwap: {
                            id: string;
                            epoch: {
                                id: string;
                                startblock: string;
                                endblock: string;
                                status: 'OVER' | 'ACTIVE' | 'PENDING';
                            };
                        };
                    };
                }>({
                    query: gql`
                        subscription useLiveNugg($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                id
                                dotnuggRawCache
                                activeSwap {
                                    id
                                    epoch {
                                        id
                                        startblock
                                        endblock
                                        status
                                    }
                                }
                            }
                        }
                    `,
                    variables: { tokenId },
                })
                .subscribe((x) => {
                    if (x.data.nugg) {
                        setNugg({
                            activeSwap: {
                                id: x.data.nugg.activeSwap.id,
                                epoch: {
                                    id: +x.data.nugg.activeSwap.epoch.id,
                                    startBlock: +x.data.nugg.activeSwap.epoch.startblock,
                                    endBlock: +x.data.nugg.activeSwap.epoch.endblock,
                                    status: x.data.nugg.activeSwap.epoch.status,
                                },
                            },
                            svg: x.data.nugg.dotnuggRawCache as any,
                        });
                    }
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo, tokenId]);

    return nugg;
};
