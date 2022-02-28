import { useSpring } from '@react-spring/core';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { CornerRightDown, CornerRightUp, Search, X } from 'react-feather';

import useDebounce from '@src/hooks/useDebounce';
import usePrevious from '@src/hooks/usePrevious';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import Colors from '@src/lib/colors';
import AppState from '@src/state/app';
import NuggDexState from '@src/state/nuggdex';
import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';

import styles from './NuggDexSearchBar.styles';

type Props = {};

const NuggDexSearchBar: FunctionComponent<Props> = () => {
    const viewing = NuggDexState.select.viewing();
    const view = AppState.select.view();
    const filters = NuggDexState.select.searchFilters();
    const prevFilters = usePrevious(filters);

    const [searchValue, setSearchValue] = useState('');

    const debouncedValue = useDebounce(searchValue, 100);
    const [sortAsc, setSortAsc] = useState(filters.sort.asc);

    // const previousSearchValue = usePrevious(debouncedValue);
    // const previousSortAsc = usePrevious(sortAsc);

    useEffect(() => {
        if (view === 'Search') {
            NuggDexState.dispatch.setSearchFilters({
                searchValue: debouncedValue,
                sort: {
                    by: 'id',
                    asc: sortAsc,
                },
            });
        } else {
            setSearchValue('');
        }
    }, [debouncedValue, view, sortAsc]);

    useEffect(() => {
        if (
            filters.searchValue === '' &&
            prevFilters &&
            prevFilters.searchValue !== filters.searchValue
        ) {
            setSearchValue('');
        }
    }, [filters]);

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
                        AppState.dispatch.changeView(view === 'Search' ? 'Swap' : 'Search')
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
                                          <CornerRightUp size={14} color={Colors.nuggBlueText} />
                                      ) : (
                                          <CornerRightDown size={14} color={Colors.nuggBlueText} />
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
