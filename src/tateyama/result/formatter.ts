import { AI, Data, Result } from 'tateyama';

function getRefundWin(resultRefund: Data.ResultRefund, horseId: number, bet: number) {
  return resultRefund.win.map((w) => w.horseId === horseId ? w.amount * bet : 0);
}
function getRefundPlace(resultRefund: Data.ResultRefund, horseId: number, bet: number) {
  return resultRefund.place.map((w) => w.horseId === horseId ? w.amount * bet : 0);
}
function getRefundQuinella(resultRefund: Data.ResultRefund, horseId1: number, horseId2: number, bet: number) {
  return resultRefund.quinella.map((w) => (w.horseId.includes(horseId1) &&  w.horseId.includes(horseId2)) ? w.amount * bet : 0);
}
function getRefundQuinellaPlace(resultRefund: Data.ResultRefund, horseId1: number, horseId2: number, bet: number) {
  return resultRefund.quinellaPlace.map((w) => (w.horseId.includes(horseId1) &&  w.horseId.includes(horseId2)) ? w.amount * bet : 0);
}
function getRefundExacta(resultRefund: Data.ResultRefund, horseId1: number, horseId2: number, bet: number) {
  return resultRefund.quinellaPlace.map((w) => (w.horseId[0] === horseId1 && w.horseId[1] === horseId2) ? w.amount * bet : 0);
}
function getRefundTrio(resultRefund: Data.ResultRefund, horseId1: number, horseId2: number, horseId3: number, bet: number) {
  return resultRefund.quinellaPlace.map((w) => (w.horseId.includes(horseId1) && w.horseId.includes(horseId2) && w.horseId.includes(horseId3)) ? w.amount * bet : 0);
}
function getRefundTrioThru(resultRefund: Data.ResultRefund, horseId: number, horseId23: number[], bet: number) {
  return horseId23.flatMap((id2, index) => {
    return horseId23.slice(index).filter((id3) => id3 !== id2).flatMap((id3) => {
      return getRefundTrio(resultRefund, horseId, id2, id3, bet);
    });
  });
}
function getRefundTrifecta(resultRefund: Data.ResultRefund, horseId1: number, horseId2: number, horseId3: number, bet: number) {
  return resultRefund.quinellaPlace.map((w) => (horseId1 === w.horseId[0] && horseId2 === w.horseId[1] && horseId3 === w.horseId[2]) ? w.amount * bet : 0);
}
function getRefundTrifectaFormation(resultRefund: Data.ResultRefund, horseIds1: number[], horseIds2: number[], horseIds3: number[], bet: number) {
  return horseIds1.flatMap((id1) => {
    return horseIds2.flatMap((id2) => {
      return horseIds3.flatMap((id3) => {
        return (id1 !== id2 && id1 !== id2 && id2 !== id3) ? getRefundTrifecta(resultRefund, id1, id2, id3, bet) : 0;
      });
    });
  });
}

function calcWinShowA(raceResult: Data.Result, betA: number) {
  return {
    amount: 1200 + 2400,
    descriptions: [
      `単勝 ${betA} x 1200円`,
      `複勝 ${betA} x 2400円`,
    ],
    refunds: [
      ...getRefundWin(raceResult.refund, betA, 12),
      ...getRefundPlace(raceResult.refund, betA, 24),
    ],
  }
}

function calcShowABC(raceResult: Data.Result, betA: number, betB: number, betC: number) {
  return {
    amount: 1200 + 1200 + 1200,
    descriptions: [
      `複勝 ${betA} x 1200円`,
      `複勝 ${betB} x 1200円`,
      `複勝 ${betC} x 1200円`,
      ],
    refunds: [
      ...getRefundPlace(raceResult.refund, betA, 12),
      ...getRefundPlace(raceResult.refund, betB, 12),
      ...getRefundPlace(raceResult.refund, betC, 12),
    ],
  }
}

function calcQuinellaPlaceAtoBC(raceResult: Data.Result, betA: number, betB: number, betC: number) {
  return {
    amount: 1200 + 1200 + 1200,
    descriptions: [
      `馬連 ${betA}-${betB} x 1200円`,
      `ワイド ${betA}-${betB} x 1200円`,
      `ワイド ${betA}-${betC} x 1200円`,
    ],
    refunds: [
      ...getRefundQuinella(raceResult.refund, betA, betB, 12),
      ...getRefundQuinellaPlace(raceResult.refund, betA, betB, 12),
      ...getRefundQuinellaPlace(raceResult.refund, betA, betC, 12),
    ],
  }
}

function calcQuinellaExactaAtoBC(raceResult: Data.Result, betA: number, betB: number, betC: number) {
  return {
    amount: 2000 + 800 + 800,
    descriptions: [
      `馬連 ${betA}-${betB} x 2000円`,
      `馬単 ${betA}-${betB} x 800円`,
      `馬単 ${betA}-${betC} x 800円`,
    ],
    refunds: [
      ...getRefundQuinella(raceResult.refund, betA, betB, 20),
      ...getRefundExacta(raceResult.refund, betA, betB, 8),
      ...getRefundExacta(raceResult.refund, betA, betC, 8),
    ],
  }
}

function calcExactaAtoAll(raceResult: Data.Result, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 1200 + 1200 + 600 + 600,
    descriptions: [
      `馬単 ${betA}-${betB} x 800円`,
      `馬単 ${betA}-${betC} x 800円`,
      `馬単 ${betA}-${betD} x 800円`,
      `馬単 ${betA}-${betX} x 800円`,
    ],
    refunds: [
      ...getRefundExacta(raceResult.refund, betA, betB, 8),
      ...getRefundExacta(raceResult.refund, betA, betC, 8),
      ...getRefundExacta(raceResult.refund, betA, betD, 8),
      ...getRefundExacta(raceResult.refund, betA, betX, 8),
    ],
  }
}

function calcTrioAtoAll(raceResult: Data.Result, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 600 + 600 + 600 + 600 + 600 + 600,
    descriptions: [
      `三連複 流し ${betA}-${betB},${betC},${betD},${betX} x 600円`,
    ],
    refunds: [
      ...getRefundTrioThru(raceResult.refund, betA, [betB, betC, betD, betX], 6),
    ],
  }
}

function calcTrioABtoAll(raceResult: Data.Result, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: (300 + 300 + 300 + 300 + 300 + 300) * 2,
    descriptions: [
      `三連複 流し ${betA}-${betB},${betC},${betD},${betX} x 300円`,
      `三連複 流し ${betB}-${betA},${betC},${betD},${betX} x 300円`,
    ],
    refunds: [
      ...getRefundTrioThru(raceResult.refund, betA, [betB, betC, betD, betX], 3),
      ...getRefundTrioThru(raceResult.refund, betB, [betB, betC, betD, betX], 3),
    ],
  }
}

function calcTrifectaAB(raceResult: Data.Result, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 200 * 6 + 200 * 12,
    descriptions: [
      `三連単 ${betA},${betB}-${betA},${betB},${betC},${betX}-${betA},${betB},${betC},${betD},${betX} x 200円`,
    ],
    refunds: [
      ...getRefundTrifectaFormation(
        raceResult.refund,
        [betA, betB],
        [betA, betB, betC, betX],
        [betA, betB, betC, betD, betX],
        6
      ),
    ],
  }
}

function calcTrifectaABX(raceResult: Data.Result, betA: number, betB: number, betC: number, betD: number, betX: number) {
  return {
    amount: 200 * 18,
    descriptions: [
      `三連単 ${betA},${betB},${betX}-${betA},${betB},${betX}-${betA},${betB},${betC},${betD},${betX} x 200円`,
    ],
    refunds: [
      ...getRefundTrifectaFormation(
        raceResult.refund,
        [betA, betB, betX],
        [betA, betB, betX],
        [betA, betB, betC, betD, betX],
        6
      ),
    ],
  }
}

export function makeBetResult(forecast: AI.ForecastResult[], raceResult: Data.Result, betStyle: Result.BetStyle): Result.BetResult {
  const betA = forecast[0].horseId;
  const betB = forecast[1].horseId;
  const betC = forecast[2].horseId;
  const betD = forecast[3].horseId;
  const betX = forecast[4].horseId;

  let func: (raceResult: Data.Result, ...bet : number[]) => { 
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

  const {
    amount,
    descriptions,
    refunds
  } = func(raceResult, betA, betB, betC, betD, betX);

  const result = refunds.reduce((p, c) => p + c);

  return {
    betStyle,
    descriptions,
    amount,
    result
  };
}
