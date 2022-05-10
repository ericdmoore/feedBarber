// #region interfaces
type TestExecFunc = (t: Deno.TestContext) => void | Promise<void>;

interface TestObj {
	name: string;
	ignore?: boolean;
	fn: TestExecFunc;
}

// #endregion interfaces

// #region helpers
export const skip = (name: string, fn: TestExecFunc) => {
	return { name, fn, ignore: true } as Deno.TestDefinition;
};

export default skip;
// #endregion helpers
