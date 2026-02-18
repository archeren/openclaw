export default {
  async fetch(request: Request): Promise<Response> {
    return new Response('🦞 Clawish L2 Worker Online!', {
      headers: { 'content-type': 'text/plain' }
    });
  }
};
