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
    // Internal Lulu provider route. Public book purchasing should use /api/book-purchases/create.
    const payload = await readJsonBody(request);
    const payloadWithContact = withDefaultContactEmail(payload, getConfiguredContactEmail(env));

    return await luluApiRequest(env, '/print-jobs/', {
      method: 'POST',
      body: payloadWithContact,
    });
  } catch (error) {
    return functionErrorResponse(error);
  }
}

export function onRequestGet() {
  return methodNotAllowed('POST');
}
