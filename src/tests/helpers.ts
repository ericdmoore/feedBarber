// #region interfaces
type TestExecFunc = () => Promise<void>;
interface TestObj {
	name: string;
	ignore?: boolean;
	fn: TestExecFunc;
}
type TestFnArg = unknown;

// #endregion interfaces

// #region helpers
export const skip = (...i: (TestObj | TestFnArg)[]) => {
	if (i.length === 1) {
		return {
			...i[0] as TestObj,
			ignore: true,
		} as TestObj;
	} else {
		return {
			name: i[0] as string,
			ignore: true,
			fn: i[1] as TestExecFunc,
		} as TestObj;
	}
};

// #endregion helpers
