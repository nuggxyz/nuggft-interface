import React from 'react';
import { BsCircle, BsCheckCircleFill } from 'react-icons/bs';
import { IoIosArrowForward } from 'react-icons/io';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page, NuggBookPageProps } from '@src/interfaces/nuggbook';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';

const ListItem = ({
    text,
    onClick,
    visited,
}: {
    text: string;
    onClick: () => void;
    visited: boolean;
}) => {
    return (
        <Button
            aria-hidden="true"
            buttonStyle={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '1rem',
            }}
            onClick={onClick}
            rightIcon={
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                marginRight: '.5rem',
                            }}
                        >
                            {visited ? (
                                <BsCheckCircleFill color={lib.colors.green} />
                            ) : (
                                <BsCircle color={lib.colors.grey} />
                            )}
                        </div>

                        <Text>{text}</Text>
                    </div>
                    <IoIosArrowForward color={lib.colors.darkerGray} />
                </>
            }
        />
    );
};

const ListItemGroup = ({
    header,
    items,
    setPage,
    visits,
}: {
    header: string;
    items: ListItemDescription[];
    visits: NuggBookPageProps['visits'];
    setPage: NuggBookPageProps['setPage'];
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                width: '100%',
            }}
        >
            <Text size="large">{header}</Text>
            {items.map((x) => (
                <ListItem
                    text={x.header}
                    onClick={() => setPage(x.page)}
                    visited={visits[x.page]}
                />
            ))}
        </div>
    );
};
type ListItemDescription = {
    header: string;
    page: Page;
};

const TableOfContents: NuggBookPage = ({ setPage, visits, clear }) => {
    const defi: ListItemDescription[] = [
        {
            header: 'what is defi',
            page: Page.WhatIsDefi,
        },
        {
            header: 'what is a wallet',
            page: Page.WhatIsAWallet,
        },
    ];

    const nft: ListItemDescription[] = [
        {
            header: 'what is an nft',
            page: Page.WhatIsAnNFT,
        },
    ];

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Text size="larger" textStyle={{ padding: '10px' }}>
                Welcome to Nuggft V1
            </Text>

            <ListItemGroup header="New to DeFi" items={defi} setPage={setPage} visits={visits} />

            <ListItemGroup header="New to NFTs" items={nft} setPage={setPage} visits={visits} />

            {__DEV__ && (
                <Button
                    label="[DEV] clear local storage"
                    buttonStyle={{
                        background: lib.colors.red,
                        color: lib.colors.white,
                    }}
                    onClick={() => {
                        clear();
                    }}
                />
            )}

            {/* <Button
                buttonStyle={{
                    background: lib.colors.gradient2,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    marginBottom: '.4rem',
                    backgroundColor: lib.colors.white,
                    width: '13rem',
                }}
                label="give me the rundown"
                onClick={() => setPage(Page.Welcome)}
            /> */}
        </div>
    );
};

export default TableOfContents;
