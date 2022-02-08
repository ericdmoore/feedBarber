import { superstruct } from '../../../mod.ts';
const { partial, type, optional, object, string, union, literal, define, is } = superstruct;

export type TextOrHTMLUnion =
	| 'text'
	| 'text/html'
	| 'html';

export const TextOrHTML = define<TextOrHTMLUnion>(
	'TextOrHTML',
	(s: unknown) =>
		is(
			(s as string).toLowerCase(),
			union([
				literal('text'),
				literal('text/html'),
				literal('html'),
			]),
		),
);

export const InnerText = object({ _text: optional(string()) });
export const OptInnerText = object({ _text: optional(string()) });

export const GUID = partial(object({
	_text: string(),
	_attributes: object({
		isPermaLink: optional(string()),
	}),
}));

export const Enclosure = object({
	_attributes: object({
		url: string(),
		type: optional(string()),
		length: optional(string()),
	}),
});

export const Link = object({
	_attributes: object({
		href: string(),
		rel: optional(string()),
		type: optional(string()),
	}),
});

export const TypedInnerText = partial(
	object({
		_attributes: optional(type({
			type: optional(TextOrHTML),
		})),
		_text: string(),
		_cdata: string(),
	}),
);

export const CDataInnerText = partial(
	object({
		_text: string(),
		_cdata: string(),
	}),
);

export const LinkedVersionedTextOrCData = partial(object({
	_attributes: partial(
		type({
			uri: string(),
			version: string(),
		})
	),
	_text: string(),
	_cdata: string(),
}));

export interface ITextWithCData {
	_text?: string;
	_cdata?: string;
}

export const pickText: IPickerFn = (data?: ITextWithCData) => {
	return data?._text;
};
export const pickCData: IPickerFn = (data?: ITextWithCData) => {
	return data?._cdata;
};

type IPickerFn = (data?: ITextWithCData) => string | undefined;
type PickerReducerFnPriorType = string | ITextWithCData | undefined;
export const pickFromObject = (defaul: string, ...pickers: IPickerFn[]) =>
	(data?: ITextWithCData) => {
		const picked = pickers.reduce(
			(prior: PickerReducerFnPriorType, picker: IPickerFn) => {
				return typeof prior === 'string' ? prior : picker(prior);
			},
			data as PickerReducerFnPriorType,
		) as string | undefined;
		return picked ?? defaul;
	};

export const txtorCData = (d: string, data?: ITextWithCData) =>
	pickFromObject(d, pickText, pickCData)(data);

export const Generator = LinkedVersionedTextOrCData;
