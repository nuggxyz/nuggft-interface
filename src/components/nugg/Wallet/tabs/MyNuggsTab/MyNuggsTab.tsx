import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../../lib';
import ProtocolState from '../../../../../state/protocol';
import WalletState from '../../../../../state/wallet';
import unclaimedOffersQuery from '../../../../../state/wallet/queries/unclaimedOffersQuery';
import Web3State from '../../../../../state/web3';
import Button from '../../../../general/Buttons/Button/Button';
import Text from '../../../../general/Texts/Text/Text';
import List, { ListRenderItemProps } from '../../../../general/List/List';
import styles from '../HistoryTab/HistoryTab.styles';
import Colors from '../../../../../lib/colors';
import myNuggsQuery from '../../../../../state/wallet/queries/myNuggsQuery';
import constants from '../../../../../lib/constants';
import NuggListRenderItem from '../../../NuggDex/NuggDexSearchList/components/NuggListRenderItem';

type Props = { isActive?: boolean };

const MyNuggsTab: FunctionComponent<Props> = ({ isActive }) => {
    const address = Web3State.select.web3address();
    const epoch = ProtocolState.select.epoch();
    const [myNuggs, setMyNuggs] = useState([]);
    const [loadingNuggs, setLoadingNuggs] = useState(false);

    const getMyNuggs = useCallback(async () => {
        setLoadingNuggs(true);
        if (!isUndefinedOrNullOrStringEmpty(address)) {
            const nuggResult = await myNuggsQuery(
                address,
                'desc',
                '',
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                myNuggs.length,
            );

            if (!isUndefinedOrNullOrArrayEmpty(nuggResult)) {
                const ids = nuggResult.map((my) => my.id);
                setMyNuggs((res) => [...res, ...ids]);
            }
        } else {
            setMyNuggs([]);
        }
        setLoadingNuggs(false);
    }, [address, epoch, myNuggs]);

    useEffect(() => {
        if (isActive) {
            setLoadingNuggs(true);
            setTimeout(() => {
                getMyNuggs();
            }, 500);
        }
    }, [address]);

    return (
        <div>
            <List
                data={myNuggs}
                RenderItem={React.memo(
                    NuggListRenderItem,
                    (prev, props) =>
                        JSON.stringify(prev.item) ===
                        JSON.stringify(props.item),
                )}
                label="My Nuggs"
                loading={loadingNuggs}
                style={styles.list}
                extraData={[address]}
                listEmptyText="No nuggs yet!"
                action={() => console.log('Open Nugg Modal')}
            />
        </div>
    );
};

export default React.memo(MyNuggsTab);
