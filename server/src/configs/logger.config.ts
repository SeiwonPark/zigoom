import DayJS from 'dayjs'
import DayJSTimezone from 'dayjs/plugin/timezone'
import DayJSUtc from 'dayjs/plugin/utc'
import winston from 'winston'

DayJS.extend(DayJSUtc)
DayJS.extend(DayJSTimezone)

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

const logger = winston.createLogger({
  levels: configs.levels,
  format: process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({
          format: () => DayJS().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'),
        }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
  ],
})

const stream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}

const format = process.env.NODE_ENV === 'production' ? 'combined' : ':method :url :status - :response-time ms'

export { logger, format, stream }
