export function debugMethods<T extends Record<string | symbol, any>>(
	obj: T,
	excludes: Array<keyof T>
): T {
	return new Proxy(obj, {
		get: function (target, name: keyof T, receiver) {
			if (
				typeof target[name] === 'function' &&
				!excludes.includes(name as keyof T)
			) {
				return function (...args: any[]) {
					const methodName = name;
					console.group(methodName);
					console.log(...args);
					console.groupEnd();
					return target[name](...args);
				};
			} else if (
				target[name] !== null &&
				typeof target[name] === 'object'
			) {
				return debugMethods(target[name], excludes);
			} else {
				return Reflect.get(target, name, receiver);
			}
		}
	});
}
