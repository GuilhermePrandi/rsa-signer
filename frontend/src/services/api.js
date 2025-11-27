import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Gera par de chaves RSA
 * @param {number} keySize - Tamanho da chave (2048 ou 4096)
 * @returns {Promise<{public_key: string, private_key: string, key_size: number}>}
 */
export async function generateKeys(keySize = 2048) {
  const response = await api.post('/generate-keys', { key_size: keySize });
  return response.data;
}

/**
 * Assina um documento
 * @param {string} documentBase64 - Documento em Base64
 * @param {string} privateKey - Chave privada em formato PEM
 * @returns {Promise<{signature: string, hash: string, algorithm: string}>}
 */
export async function signDocument(documentBase64, privateKey) {
  const response = await api.post('/sign', {
    document: documentBase64,
    private_key: privateKey,
  });
  return response.data;
}

/**
 * Verifica assinatura de um documento
 * @param {string} documentBase64 - Documento em Base64
 * @param {string} signatureBase64 - Assinatura em Base64
 * @param {string} publicKey - Chave pública em formato PEM
 * @returns {Promise<{valid: boolean, hash_calculated: string, reason: string}>}
 */
export async function verifySignature(documentBase64, signatureBase64, publicKey) {
  const response = await api.post('/verify', {
    document: documentBase64,
    signature: signatureBase64,
    public_key: publicKey,
  });
  return response.data;
}

/**
 * Calcula hash SHA-256 de um documento
 * @param {string} documentBase64 - Documento em Base64
 * @returns {Promise<{hash: string, algorithm: string}>}
 */
export async function calculateHash(documentBase64) {
  const response = await api.post('/hash', {
    document: documentBase64,
  });
  return response.data;
}

/**
 * Verifica saúde da API
 * @returns {Promise<{status: string, service: string, version: string}>}
 */
export async function healthCheck() {
  const response = await api.get('/health');
  return response.data;
}

/**
 * Converte arquivo para Base64
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} - String Base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove o prefixo "data:...;base64,"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Faz download de um arquivo de texto
 * @param {string} content - Conteúdo do arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} mimeType - Tipo MIME
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default api;
