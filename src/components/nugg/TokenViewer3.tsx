import React, { CSSProperties } from 'react';

import client from '@src/client';
import { TokenId } from '@src/client/router';
import useAsyncState from '@src/hooks/useAsyncState';
import { useNuggftV1 } from '@src/contracts/useContract';
import web3 from '@src/web3';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import Label from '@src/components/general/Label/Label';

import TokenViewer, { TokenViewerProps } from './TokenViewer';

interface Props extends TokenViewerProps {
    tokenId: TokenId;
    onTokenQuery?: (input: Base64EncodedSvg) => void;
    style?: CSSProperties;
    validated: boolean;
}

export default ({ tokenId, style, validated, onTokenQuery, ...props }: Props) => {
    // const screenType = AppState.select.screenType();

    // const [initial, setInitial] = React.useState<null | Base64EncodedSvg>();

    // const [doneWaiting, setDoneWaiting] = React.useState<boolean>(false);

    // const { width } = useMemo(() => {
    //     return { width: window.innerWidth };
    // }, []);

    const blocknum = client.live.blocknum();

    const nuggft = useNuggftV1();

    const network = web3.hook.useNetworkProvider();

    const inject = useDotnuggInjectToCache();

    const svg = useAsyncState(() => {
        if (tokenId && network) {
            return nuggft
                .connect(network)
                .imageURI(tokenId)
                .then((x) => {
                    if (x === undefined) return undefined;

                    inject(tokenId, x as Base64EncodedSvg);
                    if (onTokenQuery) onTokenQuery(x as Base64EncodedSvg);
                    return x;
                })
                .catch(() => {
                    return undefined;
                }) as Promise<Base64EncodedSvg>;
        }

        return undefined;
    }, [tokenId, blocknum, network, onTokenQuery]);

    // React.useEffect(() => {
    //     if (initial !== undefined && svg && svg !== initial) {
    //         inject(tokenId, svg);
    //     }
    // }, [initial, svg, inject, tokenId]);

    // React.useEffect(() => {
    //     if (initial === undefined && (svg !== undefined || tokenId === '')) {
    //         if (!svg) setInitial(null);
    //         else setInitial(svg || null);
    //     }
    // }, [svg, tokenId]);

    // const { background, rotateZ } = useSpring({
    //     from: {
    //         background: '#46e891',
    //         rotateZ: 0,
    //     },
    //     to: {
    //         background: '#277ef4',
    //         rotateZ: 225,
    //     },
    //     config: {
    //         duration: 2000,
    //         easing: easings.easeInOutQuart,
    //     },
    //     loop: { reverse: true },
    // });

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TokenViewer tokenId={tokenId} svgNotFromGraph={svg} showPending {...props} />
            <Label text={`as of ${String(blocknum || 0)}`} />
        </div>
    );
};
