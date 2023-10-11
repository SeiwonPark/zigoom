import winston from 'winston'

const configs = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
}

winston.addColors(configs.colors)

export const logger = winston.createLogger({
  levels: configs.levels,
  format: process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
  ],
})
