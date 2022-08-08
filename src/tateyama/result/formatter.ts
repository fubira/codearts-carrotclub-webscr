import { AI, DB, Result } from 'tateyama';

function getRefundWin(result: DB.HR, horseId: number, bet: number) {
  const payout = DB.HRtoPayoutWin(result);
  return payout.map((p) => p.id === horseId ? p.pay * bet: 0);
}
function getRefundPlace(result: DB.HR, horseId: number, bet: number) {
  console.log(horseId, bet);
  const payout = DB.HRtoPayoutPlace(result);
  return payout.map((p) => p.id === horseId ? p.pay * bet: 0);
}
function getRefundQuinella(result: DB.HR, horseId1: number, horseId2: number, bet: number) {
  const payout = DB.HRtoPayoutQuinella(result);
  return payout.map((p) => (p.ids.includes(horseId1) && p.ids.includes(horseId2)) ? p.pay * bet: 0);
}
function getRefundQuinellaPlace(result: DB.HR, horseId1: number, horseId2: number, bet: number) {
  const payout = DB.HRtoPayoutQuinellaPlace(result);
  return payout.map((p) => (p.ids.includes(horseId1) && p.ids.includes(horseId2)) ? p.pay * bet: 0);
}
function getRefundExacta(result: DB.HR, horseId1: number, horseId2: number, bet: number) {
  const payout = DB.HRtoPayoutExacta(result);
  return payout.map((p) => (p.ids[0] === horseId1 && p.ids[1] === horseId2) ? p.pay * bet: 0);
}
function getRefundTrio(result: DB.HR, horseId1: number, horseId2: number, horseId3: number, bet: number) {
  const payout = DB.HRtoPayoutTrio(result);
  return payout.map((p) => (p.ids.includes(horseId1) && p.ids.includes(horseId2) && p.ids.includes(horseId3)) ? p.pay * bet: 0);
}
function getRefundTrifecta(result: DB.HR, horseId1: number, horseId2: number, horseId3: number, bet: number) {
  const payout = DB.HRtoPayoutTrifecta(result);
  return payout.map((p) => (horseId1 === p.ids[0] && horseId2 === p.ids[1] && horseId3 === p.ids[2]) ? p.pay * bet: 0);
}

function getRefundTrioThru(result: DB.HR, horseId: number, horseId23: number[], bet: number) {
  return horseId23.flatMap((id2, index) => {
    return horseId23.slice(index).filter((id3) => id3 !== id2).flatMap((id3) => {
      return getRefundTrio(result, horseId, id2, id3, bet);
    });
  });
}
function getRefundTrifectaFormation(result: DB.HR, horseIds1: number[], horseIds2: number[], horseIds3: number[], bet: number) {
  return horseIds1.flatMap((id1) => {
    return horseIds2.flatMap((id2) => {
      return horseIds3.flatMap((id3) => {
        return (id1 !== id2 && id1 !== id2 && id2 !== id3) ? getRefundTrifecta(result, id1, id2, id3, bet) : 0;
      });
    });
  });
}

function calcWinShowA(result: DB.HR, betA: number) {
  return {
    amount: 1200 + 2400,
    descriptions: [
      `単勝 ${betA} x 1200円`,
      `複勝 ${betA} x 2400円`,
    ],
    refunds: [
      ...getRefundWin(result, betA, 12),
      ...getRefundPlace(result, betA, 24),
    ],
  }
}

function calcShowABC(result: DB.HR, betA: number, betB: number, betC: number) {
  return {
    amount: 1200 + 1200 + 1200,
    descriptions: [
      `複勝 ${betA} x 1200円`,
      `複勝 ${betB} x 1200円`,
      `複勝 ${betC} x 1200円`,
      ],
    refunds: [
      ...getRefundPlace(result, betA, 12),
      ...getRefundPlace(result, betB, 12),
      ...getRefundPlace(result, betC, 12),
    ],
  }
}

function calcQuinellaPlaceAtoBC(result: DB.HR, betA: number, betB: number, betC: number) {
  return {
    amount: 1200 + 1200 + 1200,
    descriptions: [
      `馬連 ${betA}-${betB} x 1200円`,
      `ワイド ${betA}-${betB} x 1200円`,
      `ワイド ${betA}-${betC} x 1200円`,
    ],
    refunds: [
      ...getRefundQuinella(result, betA, betB, 12),
      ...getRefundQuinellaPlace(result, betA, betB, 12),
      ...getRefundQuinellaPlace(result, betA, betC, 12),
    ],
  }
}

function calcQuinellaExactaAtoBC(result: DB.HR, betA: number, betB: number, betC: number) {
  return {
    amount: 2000 + 800 + 800,
    descriptions: [
      `馬連 ${betA}-${betB} x 2000円`,
      `馬単 ${betA}-${betB} x 800円`,
      `馬単 ${betA}-${betC} x 800円`,
    ],
    refunds: [
      ...getRefundQuinella(result, betA, betB, 20),
      ...getRefundExacta(result, betA, betB, 8),
      ...getRefundExacta(result, betA, betC, 8),
    ],
  }
}

function calcExactaAtoAll(result: DB.HR, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 1200 + 1200 + 600 + 600,
    descriptions: [
      `馬単 ${betA}-${betB} x 800円`,
      `馬単 ${betA}-${betC} x 800円`,
      `馬単 ${betA}-${betD} x 800円`,
      `馬単 ${betA}-${betX} x 800円`,
    ],
    refunds: [
      ...getRefundExacta(result, betA, betB, 8),
      ...getRefundExacta(result, betA, betC, 8),
      ...getRefundExacta(result, betA, betD, 8),
      ...getRefundExacta(result, betA, betX, 8),
    ],
  }
}

function calcTrioAtoAll(result: DB.HR, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 600 + 600 + 600 + 600 + 600 + 600,
    descriptions: [
      `三連複 流し ${betA}-${betB},${betC},${betD},${betX} x 600円`,
    ],
    refunds: [
      ...getRefundTrioThru(result, betA, [betB, betC, betD, betX], 6),
    ],
  }
}

function calcTrioABtoAll(result: DB.HR, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: (300 + 300 + 300 + 300 + 300 + 300) * 2,
    descriptions: [
      `三連複 流し ${betA}-${betB},${betC},${betD},${betX} x 300円`,
      `三連複 流し ${betB}-${betA},${betC},${betD},${betX} x 300円`,
    ],
    refunds: [
      ...getRefundTrioThru(result, betA, [betB, betC, betD, betX], 3),
      ...getRefundTrioThru(result, betB, [betB, betC, betD, betX], 3),
    ],
  }
}

function calcTrifectaAB(result: DB.HR, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 200 * 6 + 200 * 12,
    descriptions: [
      `三連単 ${betA},${betB}-${betA},${betB},${betC},${betX}-${betA},${betB},${betC},${betD},${betX} x 200円`,
    ],
    refunds: [
      ...getRefundTrifectaFormation(
        result,
        [betA, betB],
        [betA, betB, betC, betX],
        [betA, betB, betC, betD, betX],
        6
      ),
    ],
  }
}

function calcTrifectaABX(result: DB.HR, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 200 * 18,
    descriptions: [
      `三連単 ${betA},${betB},${betX}-${betA},${betB},${betX}-${betA},${betB},${betC},${betD},${betX} x 200円`,
    ],
    refunds: [
      ...getRefundTrifectaFormation(
        result,
        [betA, betB, betX],
        [betA, betB, betX],
        [betA, betB, betC, betD, betX],
        6
      ),
    ],
  }
}

export function makeBetResult(forecast: AI.ForecastResult[], raceResult: DB.HR, betStyle: Result.BetStyle): Result.BetResult {
  const betA = forecast[0].horseId;
  const betB = forecast[1].horseId;
  const betC = forecast[2].horseId;
  const betD = forecast[3].horseId;
  const betX = forecast[4].horseId;

  let func: (result: DB.HR, ...bet : number[]) => { 
    amount: number,
    descriptions: string[],
    refunds: number[]
  };

  switch(betStyle) {
    case Result.BetStyle.WinShowA: func = calcWinShowA; break;
    case Result.BetStyle.ShowABC: func = calcShowABC; break;
    case Result.BetStyle.ShowABX: func = calcShowABC; break;
    case Result.BetStyle.QuinellaPlaceABC: func = calcQuinellaPlaceAtoBC; break;
    case Result.BetStyle.QuinellaPlaceABX: func = calcQuinellaPlaceAtoBC; break;
    case Result.BetStyle.QuinellaExactaABC: func = calcQuinellaExactaAtoBC; break;
    case Result.BetStyle.ExactaAtoAll: func = calcExactaAtoAll; break;
    case Result.BetStyle.TrioAtoAll: func = calcTrioAtoAll; break;
    case Result.BetStyle.TrioABtoAll: func = calcTrioABtoAll; break;
    case Result.BetStyle.TrifectaAB: func = calcTrifectaAB; break;
    case Result.BetStyle.TrifectaABX: func = calcTrifectaABX; break;
  }

  const { amount, descriptions, refunds } = func(raceResult, betA, betB, betC, betD, betX);

  const result = refunds.reduce((p, c) => p + c);

  return {
    betStyle,
    descriptions,
    amount,
    result
  };
}
