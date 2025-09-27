import { MarkEdit } from 'markedit-api';
import type { JSONObject, JSONValue, LanguageModelGenerationOptions } from 'markedit-api';
import type { Writer } from './writers';

const toObject = (value: JSONValue, fallback = {}) => (value ?? fallback) as JSONObject;
const userSettings = toObject(MarkEdit.userSettings);
const rootValue = toObject(userSettings['extension.markeditAIWriter']);

export const keyboardShortcut = (rootValue['keyboardShortcut'] as string | undefined) ?? 'Mod-Alt-/';
export const showsTooltip = (rootValue['showsTooltip'] as boolean | undefined) ?? true;
export const streaming = (rootValue['streaming'] as boolean | undefined) ?? false;
export const instructions = (rootValue['instructions'] as string | undefined) ?? 'You are a writing assistant specialized in rewriting text. Always return only the rewritten or improved version of the input while strictly preserving any Markdown formatting (including headings, lists, links, and inline styles). Do not add explanations, instructions, or commentary—output only the content itself.';
export const generationOptions = (rootValue['generationOptions'] as LanguageModelGenerationOptions | undefined) ?? {};
export const customWriters = (rootValue['customWriters'] as Writer[] | undefined) ?? [];
