import { useState } from 'react';
import { generateKeys, downloadFile } from '../services/api';

export default function KeyGenerator() {
  const [keySize, setKeySize] = useState(2048);
  const [publicKey, setPublicKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setPublicKey('');
    setCopied(false);

    try {
      const result = await generateKeys(keySize);
      setPublicKey(result.public_key);

      // Download automático da chave privada
      downloadFile(
        result.private_key,
        `chave_privada_${keySize}bits.pem`,
        'application/x-pem-file'
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar chaves');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Erro ao copiar para área de transferência');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Gerador de Chaves RSA
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        Gere um par de chaves RSA. A chave privada será baixada automaticamente.
        Guarde-a em local seguro!
      </p>

      {/* Seletor de tamanho */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tamanho da Chave
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="keySize"
              value={2048}
              checked={keySize === 2048}
              onChange={() => setKeySize(2048)}
              className="mr-2"
            />
            <span>2048 bits</span>
            <span className="text-xs text-gray-500 ml-1">(recomendado)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="keySize"
              value={4096}
              checked={keySize === 4096}
              onChange={() => setKeySize(4096)}
              className="mr-2"
            />
            <span>4096 bits</span>
            <span className="text-xs text-gray-500 ml-1">(mais seguro)</span>
          </label>
        </div>
      </div>

      {/* Botão de geração */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
          ${isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Gerando ({keySize} bits)...
          </span>
        ) : (
          'Gerar Par de Chaves'
        )}
      </button>

      {/* Erro */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Chave pública gerada */}
      {publicKey && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Chave Pública (distribuível)
            </label>
            <button
              onClick={copyToClipboard}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
          <textarea
            readOnly
            value={publicKey}
            className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
          />

          {/* Alerta de segurança */}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> A chave privada foi baixada automaticamente.
              Guarde-a em local seguro! Sua perda impossibilitará futuras assinaturas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
