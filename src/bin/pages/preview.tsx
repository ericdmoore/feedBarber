/** @jsx h */
import {jsx, h, sift} from '../../mod.ts'
type Handler = sift.Handler

export const preview: Handler = async (req, pathParam) => {
	return jsx(
		<h1>The Preview</h1>,
	);
};

export default preview;
