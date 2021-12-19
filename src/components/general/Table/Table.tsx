import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useState,
} from 'react';

import { isUndefinedOrNullOrArrayEmpty, unCamelize } from '../../../lib';
import List from '../List/List';
import Text from '../Texts/Text/Text';

import styles from './Table.styles';

type Props<T> = {
    data: T[];
};

type ColumnType<T> = { label: string; sortName: keyof T };

const Table = <T extends object>({ data }: PropsWithChildren<Props<T>>) => {
    const [columns, setColumns] = useState<ColumnType<T>[]>([]);
    const [sortAsc, setSortAsc] = useState(true);
    const [sortName, setSortName] = useState<keyof T>();

    useEffect(() => {
        if (!isUndefinedOrNullOrArrayEmpty(data)) {
            const keys = Object.keys(data[0]).map((key) => {
                return {
                    sortName: key,
                    label: unCamelize(key),
                } as ColumnType<T>;
            });

            setColumns(keys);
        }
    }, [data]);

    const toggleSort = useCallback(
        (key: keyof T) => {
            if (sortName === key) {
                setSortAsc(!sortAsc);
            } else {
                setSortAsc(true);
                setSortName(key);
            }
        },
        [sortName, sortAsc],
    );

    const RenderItem = useCallback(
        ({ item }: { item: T }) => {
            const style = {
                ...styles.rowItem,
                width: `${100 / columns.length}%`,
            };
            return (
                <div style={styles.rowContainer}>
                    {item &&
                        Object.keys(item).map((key) => (
                            <div
                                key={Math.random()}
                                style={{
                                    ...style,
                                    ...(typeof item[key] === 'number' &&
                                        styles.numberRowItem),
                                }}>
                                {item[key]}
                            </div>
                        ))}
                </div>
            );
        },
        [columns],
    );

    return (
        <div style={styles.container}>
            <div style={styles.rowContainer}>
                {columns.map((column) => (
                    <ColumnItem
                        fraction={columns.length}
                        key={column.label}
                        label={column.label}
                        action={() => toggleSort(column.sortName)}
                        isSelected={sortName === column.sortName}
                        sortAsc={sortAsc}
                    />
                ))}
            </div>
            {data && <List data={data} RenderItem={RenderItem} />}
        </div>
    );
};

const ColumnItem = ({
    label,
    action,
    isSelected,
    sortAsc,
    fraction,
}: {
    label: string;
    action: () => void;
    isSelected: boolean;
    sortAsc: boolean;
    fraction: number;
}) => {
    const style = { ...styles.headerItem, width: `${100 / fraction}%` };
    return (
        <div onClick={action} style={style}>
            <Text weight="bold">{label}</Text>
        </div>
    );
};

export default Table;
