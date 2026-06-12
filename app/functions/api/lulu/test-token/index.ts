import {
  jsonResponse,
  methodNotAllowed,
  testLuluTokenRequest,
  type PagesContext,
} from '../../../_shared/lulu';

export async function onRequestPost({ env }: PagesContext) {
  const success = await testLuluTokenRequest(env);
  return jsonResponse({ success });
}

export function onRequestGet() {
  return methodNotAllowed('POST');
}
