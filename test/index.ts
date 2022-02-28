import * as nyalog from '../src/index'
nyalog.timer()

nyalog.config({
	style: {
		color: {
			error: 'red',
			warn: 'yellow',
			info: 'cyan',
			time: 'cyan',
		},
	},
	format: {
		date: 'YYYY-MM-DD H:mm:ss.SSS',
		// function: {
		// 	fullFunctionChain: false,
		// },
		connectionSymbol: '%',
		prefixTemplate:
			'[{{Timer}}] [{{Type}}] [{{File}}] [-->{{Function}}]@{{Name}}',
		timer: {
			unit: 'ms',
			decimalPlaces: 3,
			autocompleteDecimal: true,
		},
	},
	name: 'nyanyajs-log',
})

nyalog.info('21111111')
const b = () => {
	const a = () => {
		nyalog.info('21')
	}
	a()
}

b()
