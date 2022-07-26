import React from 'react';

const ModalWrapperMobile = React.lazy(() => import('@src/components/mobile/ModalWrapperMobile'));
const ModalWrapper = React.lazy(() => import('./ModalWrapper'));

export default React.memo(
	({ isPhone }: { isPhone: boolean }) => {
		return isPhone ? <ModalWrapperMobile /> : <ModalWrapper />;
	},
	(prev, curr) => prev.isPhone === curr.isPhone,
);
