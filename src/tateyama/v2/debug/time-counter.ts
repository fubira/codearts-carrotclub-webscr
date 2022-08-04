import logger from 'logger';

const countValue: { name?: string, start?: number } = {};
const countLog: { [key: string]: number } = {}

export function startTimeCount(name: string) {
  countValue.name = name;
  countValue.start = new Date().getTime();
}

export function finishTimeCount() {
  const { start, name } = countValue;
  const end = new Date().getTime();
  countLog[name] = (countLog[name] || 0) + (end - start);
}

export function dumpTimeCountLog() {
  logger.debug(countLog);
}
