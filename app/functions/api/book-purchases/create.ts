import {
  functionErrorResponse,
  getConfiguredContactEmail,
  luluApiRequest,
  methodNotAllowed,
  readJsonBody,
  withDefaultContactEmail,
  type PagesContext,
} from '../../_shared/lulu';

export async function onRequestPost({ request, env }: PagesContext) {
  try {
    const purchasePayload = await readJsonBody(request);
    const purchaseWithContact = withDefaultContactEmail(purchasePayload, getConfiguredContactEmail(env));

    return await luluApiRequest(env, '/print-jobs/', {
      method: 'POST',
      body: purchaseWithContact,
    });
  } catch (error) {
    return functionErrorResponse(error);
  }
}

export function onRequestGet() {
  return methodNotAllowed('POST');
}
