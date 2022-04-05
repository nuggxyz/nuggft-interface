import React, { FunctionComponent } from 'react';
import { IoCashOutline, IoPencil, IoPricetagsOutline, IoTrashBinOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';

type Props = { tokenId: string };

const OwnerButtons: FunctionComponent<Props> = ({ tokenId }) => {
    const navigate = useNavigate();

    return (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Sell`}
                leftIcon={
                    <IoPricetagsOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'SellNuggOrItemModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'SellNugg',
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Loan`}
                leftIcon={
                    <IoCashOutline
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanOrBurnModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'LoanNugg',
                            backgroundStyle: {
                                background: Colors.gradient2,
                            },
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Burn`}
                leftIcon={
                    <IoTrashBinOutline
                        color={Colors.nuggRedText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanOrBurnModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'BurnNugg',
                            backgroundStyle: {
                                background: Colors.gradient3,
                            },
                        },
                    })
                }
            />
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Edit`}
                leftIcon={
                    <IoPencil
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() => navigate(`/edit/${tokenId}`)}
            />
        </div>
    );
};

export default OwnerButtons;
