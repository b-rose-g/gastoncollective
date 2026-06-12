import {
  functionErrorResponse,
  luluApiRequest,
  methodNotAllowed,
  readJsonBody,
  type PagesContext,
} from '../../_shared/lulu';

export async function onRequestPost({ request, env }: PagesContext) {
  try {
    // Internal Lulu provider route. Public book purchasing should use /api/book-purchases/quote.
    const payload = await readJsonBody(request);
    return await luluApiRequest(env, '/print-job-cost-calculations/', {
      method: 'POST',
      body: payload,
    });
  } catch (error) {
    return functionErrorResponse(error);
  }
}

export function onRequestGet() {
  return methodNotAllowed('POST');
}
