import type { APIRoute } from 'astro';
import { buildSearchIndex } from '../lib/briefings';

export const GET: APIRoute = () => {
  const body = JSON.stringify(buildSearchIndex());
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};