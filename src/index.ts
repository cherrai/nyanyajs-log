import monment from 'moment'

interface ConfigOptions {
	style?: {
		color?: {
			error?: keyof typeof NyaNyaLog.color
			warn?: keyof typeof NyaNyaLog.color
			info?: keyof typeof NyaNyaLog.color
			time?: keyof typeof NyaNyaLog.color
		}
	}
	format?: {
		date?: string
		connectionSymbol?: string
		prefixTemplate: string
		function?: {
			fullFunctionChain: boolean
		}
		timer?: {
			unit: 'ms' | 'sec' | 'min' | 'hour' | 'day'
			decimalPlaces?: number
			autocompleteDecimal?: boolean
		}
	}
	name?: string
}
export class NyaNyaLog {
	static fontStyle = {
		bold: '\x1B[1m',
		faint: '\x1B[2m',
		italic: '\x1B[3m',
		underlined: '\x1B[4m',
		inverse: '\x1B[7m',
		strikethrough: '\x1B[9m',
	}
	static color = {
		bright: '\x1B[1m', // 亮色
		grey: '\x1B[2m', // 灰色
		italic: '\x1B[3m', // 斜体
		underline: '\x1B[4m', // 下划线
		reverse: '\x1B[7m', // 反向
		hidden: '\x1B[8m', // 隐藏
		black: '\x1B[30m', // 黑色
		red: '\x1B[31m', // 红色
		green: '\x1B[32m', // 绿色
		yellow: '\x1B[33m', // 黄色
		blue: '\x1B[34m', // 蓝色
		magenta: '\x1B[35m', // 品红
		cyan: '\x1B[36m', // 青色
		white: '\x1B[37m', // 白色
	}
	static colorBg = {
		blackBG: '\x1B[40m', // 背景色为黑色
		redBG: '\x1B[41m', // 背景色为红色
		greenBG: '\x1B[42m', // 背景色为绿色
		yellowBG: '\x1B[43m', // 背景色为黄色
		blueBG: '\x1B[44m', // 背景色为蓝色
		magentaBG: '\x1B[45m', // 背景色为品红
		cyanBG: '\x1B[46m', // 背景色为青色
		whiteBG: '\x1B[47m', // 背景色为白色
	}
	private configOptions: ConfigOptions = {
		style: {
			color: {
				info: 'green',
				time: 'cyan',
				warn: 'yellow',
				error: 'red',
			},
		},
		format: {
			date: 'YYYY-MM-DD H:mm:ss.SSS',
			connectionSymbol: '%',
			function: {
				fullFunctionChain: true,
			},
			prefixTemplate:
				'[{{Timer}}] [{{Date}}] [{{Type}}] [{{File}}] [-->{{Function}}]@{{Name}}',
			timer: {
				unit: 'ms',
				decimalPlaces: 3,
				autocompleteDecimal: true,
			},
		},
		name: '@nyanyajs-log',
	}
	private timerTimestamp = 0
	private timelog = new Map<string, number>()
	constructor(options?: ConfigOptions) {
		options && this.Config(options)
	}
	public Config(options?: ConfigOptions) {
		if (!options) {
			return
		}
		options?.style?.color?.info &&
			(this.configOptions.style.color.info = options?.style?.color?.info)
		options?.style?.color?.warn &&
			(this.configOptions.style.color.warn = options?.style?.color?.warn)
		options?.style?.color?.error &&
			(this.configOptions.style.color.error = options?.style?.color?.error)
		options?.style?.color?.time &&
			(this.configOptions.style.color.time = options?.style?.color?.time)

		options?.format?.date &&
			(this.configOptions.format.date = options?.format?.date)
		options?.format?.function?.hasOwnProperty('fullFunctionChain') &&
			(this.configOptions.format.function.fullFunctionChain =
				options?.format?.function?.fullFunctionChain)

		options?.format?.prefixTemplate &&
			(this.configOptions.format.prefixTemplate =
				options?.format?.prefixTemplate)
		options?.format?.timer?.unit &&
			(this.configOptions.format.timer.unit = options?.format?.timer?.unit)
		options?.format?.timer?.decimalPlaces &&
			(this.configOptions.format.timer.decimalPlaces =
				options?.format?.timer?.decimalPlaces)

		options?.format?.timer?.hasOwnProperty('autocompleteDecimal') &&
			(this.configOptions.format.timer.autocompleteDecimal =
				options?.format?.timer?.autocompleteDecimal)

		options?.format?.connectionSymbol &&
			(this.configOptions.format.connectionSymbol =
				options?.format?.connectionSymbol)

		options?.name && (this.configOptions.name = options?.name)
	}
	static getLogStack() {
		const stackStartIndex = 4
		const stackInfo = new Error().stack.split('\n')
		const fileInfo = stackInfo[stackStartIndex].split('/')
		let funcNameText = ''
		for (let i = stackStartIndex; i < stackInfo.length; i++) {
			stackInfo[i] = stackInfo[i].slice(6, stackInfo[i].length - 1)
			if (stackInfo[i].indexOf('/') === 1) {
				continue
			}
			// console.log(stackInfo[i], stackInfo[i].match(/\s(.)?:/gi))
			const funcName = stackInfo[i].split(' (/')[0].trim()
			// console.log(funcName)
			if (funcName === 'Object.<anonymous>') {
				if (!funcNameText) {
					funcNameText = funcName
				}
				break
			}
			// console.log(stackInfo[i].indexOf(' (/'))
			// if (stackInfo[i].indexOf(' (/') >= 0) {
			funcNameText = funcName + (!funcNameText ? '' : '.') + funcNameText
			// }
		}
		return {
			function: stackInfo[stackStartIndex].split(' (/')[0].trim(),
			functionChain: funcNameText.trim(),
			fileInfo: fileInfo[fileInfo.length - 1]
				.slice(0, fileInfo[fileInfo.length - 1].length - 6)
				.trim(),
		}
	}

	private format = (type: 'info' | 'time' | 'error' | 'warn') => {
		const logStack = NyaNyaLog.getLogStack()
		let log = NyaNyaLog.color[this.configOptions.style.color[type]]
		log += this.configOptions.format.prefixTemplate

		// console.log('log', log)

		log = log.replace(
			/{{Date}}/g,
			monment().format(this.configOptions.format.date)
		)
		log = log.replace(
			/{{Type}}/g,
			type === 'info'
				? 'INFO'
				: type === 'error'
				? 'ERROR'
				: type === 'time'
				? 'TIME'
				: 'WARNING'
		)

		log = log.replace(
			/{{Function}}/g,
			this.configOptions.format.function.fullFunctionChain
				? logStack.functionChain
				: logStack.function
		)
		// console.log(this.configOptions.format.function.fullFunctionChain)
		// console.log(logStack.functionChain)
		// console.log(logStack.function)
		log = log.replace(/{{File}}/g, logStack.fileInfo)
		log = log.replace(/{{Name}}/g, this.configOptions.name)
		// log = log.replace(
		// 	/{{Timer}}/g,
		// 	monment(performance.now() - this.timerTimestamp).format(
		// 		this.configOptions.format.timer.unit
		// 	)
		// )

		if (log.indexOf('{{Timer}}') >= 0) {
			let timer = performance.now() - this.timerTimestamp
			const convert = (decimalPlaces: number) => {
				let num = 1
				for (let i = 0; i < decimalPlaces; i++) {
					num *= 10
				}
				return num
			}
			let tempNum = convert(this.configOptions.format.timer.decimalPlaces || 0)
			switch (this.configOptions.format.timer.unit) {
				case 'ms':
					break
				case 'sec':
					timer /= 1000
					break
				case 'min':
					timer /= 1000 * 60
					break
				case 'hour':
					timer /= 1000 * 60 * 60
					break
				case 'day':
					timer /= 1000 * 60 * 60 * 24
					break

				default:
					break
			}
			let result = (Math.round(timer * tempNum) / tempNum).toString()
			if (this.configOptions.format.timer.autocompleteDecimal) {
				for (
					let i = result.split('.')[1].length;
					i < this.configOptions.format.timer.decimalPlaces || 0;
					i++
				) {
					result = result + '0'
				}
			}
			log = log.replace(/{{Timer}}/g, result)
		}

		// console.log(monment(performance.now() - this.timerTimestamp).format('mm'))

		// console.log(performance.now() - this.timerTimestamp)

		log +=
			NyaNyaLog.color[this.configOptions.style.color[type]] +
			' ' +
			NyaNyaLog.color.white +
			this.configOptions.format.connectionSymbol +
			NyaNyaLog.color.white
		return log
	}
	public Info = (...message: any[]) => {
		console.log(this.format('info'), ...message)
	}
	public Error = (...message: any[]) => {
		console.log(this.format('error'), ...message)
	}
	public Warn = (...message: any[]) => {
		console.log(this.format('warn'), ...message)
	}
	public Time = (message: string) => {
		this.timelog.set(message, performance.now())
	}
	public TimeEnd = (message: string) => {
		console.log(
			this.format('time'),
			message + ':',
			Math.round((performance.now() - this.timelog.get(message)) * 1000) /
				1000 +
				'ms'
		)

		this.timelog.delete(message)
	}
	public Timer() {
		this.timerTimestamp = performance.now()
	}
}
const nyanyalog = new NyaNyaLog()

export const config: typeof nyanyalog.Config = nyanyalog.Config.bind(nyanyalog)
export const info: typeof nyanyalog.Info = nyanyalog.Info.bind(nyanyalog)
export const error: typeof nyanyalog.Error = nyanyalog.Error.bind(nyanyalog)
export const warn: typeof nyanyalog.Warn = nyanyalog.Warn.bind(nyanyalog)
export const time: typeof nyanyalog.Time = nyanyalog.Time.bind(nyanyalog)
export const timeEnd: typeof nyanyalog.TimeEnd =
	nyanyalog.TimeEnd.bind(nyanyalog)
export const timer: typeof nyanyalog.Timer = nyanyalog.Timer.bind(nyanyalog)

export default {
	NyaNyaLog,
	config,
	info,
	error,
	warn,
	time,
	timeEnd,
	timer,
}
