import log4js from 'log4js';

const logger = log4js.getLogger();

log4js.configure({
  appenders: {
    out: {
      type: 'stdout'
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'debug'
    }
  }
});

export default logger;
