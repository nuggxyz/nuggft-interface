// export const b64ToUint6 = (nChr: number) => {
//     return nChr > 64 && nChr < 91
//         ? nChr - 65
//         : nChr > 96 && nChr < 123
//         ? nChr - 71
//         : nChr > 47 && nChr < 58
//         ? nChr + 4
//         : nChr === 43
//         ? 62
//         : nChr === 47
//         ? 63
//         : 0;
// };

// export const base64ToArr = (sBase64: string, nBlocksSize?: number) => {
//     var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ''),
//         nInLen = sB64Enc.length,
//         nOutLen = nBlocksSize
//             ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
//             : (nInLen * 3 + 1) >> 2,
//         taBytes = new Array(nOutLen);

//     for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
//         nMod4 = nInIdx & 3;
//         nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
//         if (nMod4 === 3 || nInLen - nInIdx === 1) {
//             for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
//                 taBytes[nOutIdx] = ((nUint24 >>> ((16 >>> nMod3) & 24)) & 255).toString(16);
//             }
//             nUint24 = 0;
//         }
//     }

//     return taBytes;
// };

// export const uint16ToDec = (uint16: string[]) => {
//     try {
//         return parseInt(`${uint16[0]}${uint16[1]}`, 16);
//     } catch (e) {
//         console.log(e);
//         return NaN;
//     }
// };

// export const swapIdToTokenIdDisplay = (swapId: string) => {
//     const swapArr = !isUndefinedOrNullOrStringEmpty(swapId) ? swapId.split('-') : [];
//     if (!isUndefinedOrNullOrArrayEmpty(swapArr) && swapArr.length > 1) {
//         return swapArr[1];
//     }
//     return swapId;
// };
export default {};
