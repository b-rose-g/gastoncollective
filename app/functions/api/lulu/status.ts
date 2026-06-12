import {
  jsonResponse,
  luluEnvironmentStatus,
  methodNotAllowed,
  type PagesContext,
} from '../../_shared/lulu';

export function onRequestGet({ env }: PagesContext) {
  return jsonResponse(luluEnvironmentStatus(env));
}

export function onRequestPost() {
  return methodNotAllowed('GET');
}
