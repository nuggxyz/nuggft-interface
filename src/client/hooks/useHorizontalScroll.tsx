import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import React, { useCallback, useEffect, useState } from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

const useHorizontalScroll = (ref: React.RefObject<HTMLDivElement>, style?: React.CSSProperties) => {
	const [scrollLeft, setScrollLeft] = useState(ref.current?.scrollLeft || 0);

	useEffect(() => {
		if (ref.current) {
			const listener = () => setScrollLeft(ref.current?.scrollLeft || 0);
			ref.current.addEventListener('scroll', listener);

			return () => {
				ref.current?.removeEventListener('scroll', listener);
			};
		}
		return () => null;
	}, [ref.current]);

	const Arrow = useCallback(
		({ direction }: { direction: 'right' | 'left' }) => {
			return (
				<Button
					className="mobile-pressable-div-shallow"
					disabled={
						ref.current
							? direction === 'right'
								? scrollLeft + ref.current.clientWidth >= ref.current.scrollWidth
								: scrollLeft <= 0
							: true
					}
					onClick={() => {
						if (ref.current) {
							ref.current.scrollBy({
								behavior: 'smooth',
								left:
									ref.current.scrollLeft +
									(direction === 'left' ? -2 : 1) * ref.current.clientWidth,
							});
						}
					}}
					buttonStyle={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						margin: 'auto .2rem',
						[direction]: 0,
						zIndex: 100,
						borderRadius: lib.layout.borderRadius.large,
						height: '1.5rem',
						padding: '.3rem',
						boxShadow: lib.layout.boxShadow.dark,
						...style,
					}}
					rightIcon={
						direction === 'right' ? (
							<IoChevronForwardOutline />
						) : (
							<IoChevronBackOutline />
						)
					}
				/>
			);
		},
		[ref.current, style, scrollLeft],
	);

	return [
		ref.current && ref.current.scrollWidth > ref.current.clientWidth ? (
			<>
				<Arrow direction="left" />
				<Arrow direction="right" />
			</>
		) : null,
	];
};

export default useHorizontalScroll;
