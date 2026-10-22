import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export default async function pdfPreview(req, res) {
  const fileId = req.query.fileId;
  const token = req.query.token;
  const apiUrl = process.env.BACKEND_API_URL || process.env.VITE_API_URL;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Método no permitido.' });
  }

  if (
    typeof fileId !== 'string' ||
    !/^[A-Za-z0-9_-]+$/.test(fileId) ||
    typeof token !== 'string' ||
    token.length > 2048
  ) {
    return res.status(400).json({ message: 'La solicitud del PDF no es válida.' });
  }

  if (!apiUrl) {
    console.error('Configura BACKEND_API_URL o VITE_API_URL para el proxy de PDF en Vercel.');
    return res.status(500).json({ message: 'El servicio de archivos no está configurado.' });
  }

  let upstreamUrl;
  try {
    const baseUrl = new URL(apiUrl);
    if (!['http:', 'https:'].includes(baseUrl.protocol)) {
      return res.status(500).json({ message: 'La URL de la API no es válida.' });
    }
    const apiPath = baseUrl.pathname.replace(/\/+$/, '');
    upstreamUrl = new URL(
      `${apiPath}/files/${encodeURIComponent(fileId)}/preview?token=${encodeURIComponent(token)}`,
      baseUrl.origin
    );
  } catch (error) {
    console.error('La URL de la API para el visor PDF no es válida:', error);
    return res.status(500).json({ message: 'No se pudo conectar con el servicio de archivos.' });
  }

  try {
    const headers = { 'Bypass-Tunnel-Reminder': 'true' };
    if (req.headers.range) headers.Range = req.headers.range;

    const upstream = await fetch(upstreamUrl, { headers });
    const contentType = upstream.headers.get('content-type') || '';
    if (!upstream.ok || !contentType.toLowerCase().includes('application/pdf')) {
      console.error(
        `El servicio de archivos respondió con ${upstream.status} y Content-Type ${contentType}.`
      );
      return res.status(upstream.ok ? 502 : upstream.status).json({
        message: 'No fue posible entregar el PDF desde el servicio de archivos.',
      });
    }

    res.status(upstream.status);
    for (const header of [
      'accept-ranges',
      'cache-control',
      'content-disposition',
      'content-length',
      'content-range',
      'etag',
      'last-modified',
    ]) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');

    if (!upstream.body) return res.end();
    await pipeline(Readable.fromWeb(upstream.body), res);
  } catch (error) {
    console.error('Error al transmitir el PDF al navegador:', error);
    if (!res.headersSent) {
      return res.status(502).json({ message: 'No fue posible abrir el PDF.' });
    }
    res.destroy(error);
  }
};
