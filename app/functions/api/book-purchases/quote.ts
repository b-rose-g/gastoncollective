import {
  functionErrorResponse,
  luluApiRequest,
  methodNotAllowed,
  readJsonBody,
  type PagesContext,
} from '../../_shared/lulu';

export async function onRequestPost({ request, env }: PagesContext) {
  try {
    const purchaseQuotePayload = await readJsonBody(request);
    return await luluApiRequest(env, '/print-job-cost-calculations/', {
      method: 'POST',
      body: purchaseQuotePayload,
    });
  } catch (error) {
    return functionErrorResponse(error);
  }
}

export function onRequestGet() {
  return methodNotAllowed('POST');
}
