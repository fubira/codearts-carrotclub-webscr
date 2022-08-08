import { DB } from 'tateyama';

export const getRaceID = (jvid: DB.JVID) => {
  return JSON.stringify(jvid);
}

export const HRtoPayoutWin = (result: DB.HR) => {
  return result.PayTansyo.map((pt) => {
    return {
      id: Number(pt.Umaban),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutPlace = (result: DB.HR) => {
  return result.PayFukusyo.map((pt) => {
    return {
      id: Number(pt.Umaban),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutQuinella = (result: DB.HR) => {
  return result.PayUmaren.map((pt) => {
    return {
      ids: pt.Kumi.split(/(??)(??)/).map(v => Number(v)),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutQuinellaPlace = (result: DB.HR) => {
  return result.PayWide.map((pt) => {
    return {
      ids: pt.Kumi.split(/(??)(??)/).map(v => Number(v)),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutExacta = (result: DB.HR) => {
  return result.PayUmatan.map((pt) => {
    return {
      ids: pt.Kumi.split(/(??)(??)/).map(v => Number(v)),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutTrio = (result: DB.HR) => {
  return result.PaySanrenpuku.map((pt) => {
    return {
      ids: pt.Kumi.split(/(??)(??)(??)/).map(v => Number(v)),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}

export const HRtoPayoutTrifecta = (result: DB.HR) => {
  return result.PaySanrentan.map((pt) => {
    return {
      ids: pt.Kumi.split(/(??)(??)(??)/).map(v => Number(v)),
      order: Number(pt.Ninki),
      pay: Number(pt.Pay)
    }
  });
}
