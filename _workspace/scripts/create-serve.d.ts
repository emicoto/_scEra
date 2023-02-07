declare module "create-serve" {
	interface IStartOptions {
		port?: number;
		root?: string;
		live?: boolean;
	}
	interface IOptions {
		port: number;
		root: string;
		live: boolean;
	}
	const update: () => void;
	const start: (startOptions: IStartOptions = {}) => void;
	const options: IOptions;
	const log: (message: string) => void;
	const error: (log: string) => void;

	export { error, log, IStartOptions, options };
	export default { start, update };
}
