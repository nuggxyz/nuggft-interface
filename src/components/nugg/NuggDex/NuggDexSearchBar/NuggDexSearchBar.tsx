import { useSpring } from '@react-spring/core';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { CornerRightDown, CornerRightUp, Search, X } from 'react-feather';

import useDebounce from '../../../../hooks/useDebounce';
import usePrevious from '../../../../hooks/usePrevious';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';
import Colors from '../../../../lib/colors';
import AppDispatches from '../../../../state/app/dispatches';
import AppSelectors from '../../../../state/app/selectors';
import NuggDexDispatches from '../../../../state/nuggdex/dispatches';
import NuggDexSelectors from '../../../../state/nuggdex/selectors';
import Button from '../../../general/Buttons/Button/Button';
import TextInput from '../../../general/TextInputs/TextInput/TextInput';

import styles from './NuggDexSearchBar.styles';

type Props = {};

const NuggDexSearchBar: FunctionComponent<Props> = () => {
    const viewing = NuggDexSelectors.viewing();
    const continueSearch = NuggDexSelectors.continueSearch();
    const view = AppSelectors.view();

    const [searchValue, setSearchValue] = useState('');

    const debouncedValue = useDebounce(searchValue, 100);
    const [sortAsc, setSortAsc] = useState(true);

    const previousSearchValue = usePrevious(debouncedValue);
    const previousSortAsc = usePrevious(sortAsc);

    useEffect(() => {
        if (continueSearch.includes('no')) {
            setSearchValue('');
            NuggDexDispatches.setViewing('home');
        }
    }, [continueSearch]);

    useEffect(() => {
        if (view === 'Search') {
            if (
                viewing === 'home' &&
                !isUndefinedOrNullOrStringEmpty(debouncedValue) &&
                isUndefinedOrNullOrStringEmpty(previousSearchValue)
            ) {
                NuggDexDispatches.setViewing('all nuggs');
            }
            const filters: NL.Redux.NuggDex.Filters = {
                searchValue: debouncedValue,
                sort: {
                    by: 'id',
                    asc: sortAsc,
                },
            };
            NuggDexDispatches.searchTokens({
                filters,
                addToResult:
                    continueSearch.includes('yes') &&
                    debouncedValue === previousSearchValue &&
                    sortAsc === previousSortAsc,
            });
        } else {
            setSearchValue('');
        }
    }, [
        debouncedValue,
        view,
        continueSearch,
        viewing,
        previousSearchValue,
        sortAsc,
        previousSortAsc,
    ]);

    const styleInput = useSpring({
        width: view === 'Search' ? '100%' : '0%',
    });
    const style = useSpring({
        ...styles.searchBar,
        margin: view === 'Search' ? '0% 5% 0% 5%' : '0% 100% 0% 0%',
        borderRadius: view === 'Search' ? '7px' : '20px',
    });

    return (
        <TextInput
            placeholder={`Search ${viewing === 'home' ? 'all nuggs' : viewing}`}
            value={searchValue}
            setValue={setSearchValue}
            className="placeholder-blue"
            style={style}
            styleInputContainer={styleInput}
            leftToggles={[
                <Button
                    buttonStyle={styles.searchBarButton}
                    onClick={() =>
                        AppDispatches.changeView(
                            view === 'Search' ? 'Swap' : 'Search',
                        )
                    }
                    rightIcon={<Search style={styles.searchBarIcon} />}
                />,
            ]}
            rightToggles={
                view === 'Search'
                    ? [
                          !isUndefinedOrNullOrStringEmpty(searchValue) && (
                              <Button
                                  buttonStyle={styles.searchBarButton}
                                  onClick={() => setSearchValue('')}
                                  rightIcon={<X style={styles.searchBarIcon} />}
                              />
                          ),
                          viewing !== 'home' && (
                              <Button
                                  buttonStyle={styles.filterButton}
                                  rightIcon={
                                      sortAsc ? (
                                          <CornerRightUp
                                              size={14}
                                              color={Colors.nuggBlueText}
                                          />
                                      ) : (
                                          <CornerRightDown
                                              size={14}
                                              color={Colors.nuggBlueText}
                                          />
                                      )
                                  }
                                  onClick={() => setSortAsc(!sortAsc)}
                              />
                          ),
                      ]
                    : []
            }
        />
    );
};

export default React.memo(NuggDexSearchBar);
