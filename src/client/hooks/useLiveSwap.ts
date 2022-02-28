// import client from '..';

// enum Status {
//     NONE = 0,
//     PRE = 1,
//     DURING = 2,
//     POST = 3,
// }

// export const useLiveActiveSwap = (tokenId: string) => {
//     // you want to watch the epoch for the status,

//     /// status = epoch =
//     const [status, setStatus] = React.useState<Status>(Status.NONE);

//     // watch the nugg for the svg
//     const [svg, setSvg] = React.useState<ReactSVG>();

//     const apollo = client.useApollo();

//     const { epoch } = client.useL();

//     const getdata = React.useCallback(async () => {
//         console.log({ tokenId });
//         if (apollo) {
//             const instance = apollo
//                 .subscribe<{
//                     protocol: {
//                         nuggftStakedEth: string;
//                         nuggftStakedShares: string;
//                     };
//                 }>({ query: query, variables: {} })
//                 .subscribe((x) => {
//                     const shares = BigNumber.from(x.data.protocol.nuggftStakedShares);

//                     const staked = BigNumber.from(x.data.protocol.nuggftStakedEth);

//                     setStake({
//                         staked,
//                         shares,
//                         eps: EthInt.fromFraction(new Fraction(staked, shares)),
//                     });
//                 });
//             return () => {
//                 instance.unsubscribe();
//             };
//         }
//     }, [apollo, tokenId]);

//     useEffect(() => {

//         // if nugg doesnt exist, we wait for it to
//         // if activeSwap doesnt exist, we wait for it to
//         // both those in same subscription to nugg
//         // if active swap does exist, we watch for that
//         if (apollo && status === Status.NONE) {
//             getdata();
//         }
//     }, [apollo, tokenId, getdata, status]);

//     return { status, svg };
// };

export default {};
