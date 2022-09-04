import type { PromiseOr } from '../../types.ts';
import type { ASTComputable } from '../../types.ts';
import er from '../parsers/helpers/error.ts';
import { superstruct as s } from '../../mod.ts';

const { optional, boolean, object } = s;

export const SetupParams = s.object({
	awsCredLoc: s.string(),
});

/**
 * ## Setup
 * Run this Once at install time
 * provision and configure cloud services & resources that will be needed
 * during ongoing use of the enhancement
 */
export const setup = async (i: s.Infer<typeof SetupParams>): Promise<void> => {
	if (SetupParams.is(i)) {
		return Promise.reject(() => er(i, '', (new Error()).stack));
	}
};

export const TeardownParams = object({});

export const teardown = async (_i: s.Infer<typeof TeardownParams>): Promise<void> => {
};

export const EnhancementParams = object({
	useNeural: optional(boolean()),
});

export const enhancement = async () => async (_ast: PromiseOr<ASTComputable>) => {
};
