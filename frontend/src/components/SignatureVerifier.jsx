import { useState, useRef } from 'react';
import { verifySignature, fileToBase64 } from '../services/api';

export default function SignatureVerifier() {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo excede o limite de 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSigFileUpload = async (e) => {
    const sigFile = e.target.files[0];
    if (sigFile) {
      try {
        const text = await sigFile.text();
        const sigData = JSON.parse(text);
        setSignature(sigData.signature || text);
      } catch {
        // Se não for JSON, usar como texto puro
        const text = await sigFile.text();
        setSignature(text);
      }
    }
  };

  const handleKeyFileUpload = async (e) => {
    const keyFile = e.target.files[0];
    if (keyFile) {
      const text = await keyFile.text();
      setPublicKey(text);
    }
  };

  const handleVerify = async () => {
    if (!file || !signature.trim() || !publicKey.trim()) {
      setError('Forneça o documento, a assinatura e a chave pública');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const documentBase64 = await fileToBase64(file);
      const verifyResult = await verifySignature(documentBase64, signature, publicKey);
      setResult(verifyResult);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao verificar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonText = (reason) => {
    switch (reason) {
      case 'OK':
        return 'Assinatura verificada com sucesso';
      case 'INTEGRITY_VIOLATION':
        return 'O documento foi modificado após a assinatura ou a chave está incorreta';
      case 'AUTHENTICITY_FAILURE':
        return 'A chave pública não corresponde ao signatário';
      case 'INVALID_KEY':
        return 'Chave pública inválida';
      case 'INVALID_SIGNATURE':
        return 'Formato de assinatura inválido';
      default:
        return reason;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Verificar Assinatura
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        Verifique a autenticidade e integridade de um documento assinado.
      </p>

      {/* Upload de documento */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documento Original
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${file ? 'bg-green-50 border-green-300' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          {file ? (
            <p className="text-green-700 font-medium">{file.name}</p>
          ) : (
            <p className="text-gray-600 text-sm">Clique ou arraste o documento</p>
          )}
        </div>
      </div>

      {/* Assinatura */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Assinatura
          </label>
          <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            <input
              type="file"
              accept=".sig,.json"
              className="hidden"
              onChange={handleSigFileUpload}
            />
            Carregar arquivo .sig
          </label>
        </div>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Cole a assinatura em Base64 ou carregue o arquivo .sig"
          className="w-full h-20 p-2 border border-gray-300 rounded-md font-mono text-xs resize-none"
        />
      </div>

      {/* Chave pública */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Chave Pública do Signatário
          </label>
          <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
            <input
              type="file"
              accept=".pem"
              className="hidden"
              onChange={handleKeyFileUpload}
            />
            Carregar arquivo .pem
          </label>
        </div>
        <textarea
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
          className="w-full h-24 p-2 border border-gray-300 rounded-md font-mono text-xs resize-none"
        />
      </div>

      {/* Botão de verificação */}
      <button
        onClick={handleVerify}
        disabled={isLoading || !file || !signature.trim() || !publicKey.trim()}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
          ${isLoading || !file || !signature.trim() || !publicKey.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Verificando...
          </span>
        ) : (
          'Verificar Assinatura'
        )}
      </button>

      {/* Erro */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className={`mt-4 p-4 rounded-lg border-2 ${
          result.valid
            ? 'bg-green-50 border-green-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center mb-3">
            {result.valid ? (
              <>
                <span className="text-3xl mr-3">✓</span>
                <div>
                  <p className="text-green-800 font-bold text-lg">Assinatura Válida</p>
                  <p className="text-green-700 text-sm">Autenticidade e Integridade confirmadas</p>
                </div>
              </>
            ) : (
              <>
                <span className="text-3xl mr-3">✗</span>
                <div>
                  <p className="text-red-800 font-bold text-lg">Assinatura Inválida</p>
                  <p className="text-red-700 text-sm">{getReasonText(result.reason)}</p>
                </div>
              </>
            )}
          </div>

          {/* Detalhes técnicos */}
          <details className="mt-3">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              Detalhes Técnicos
            </summary>
            <div className="mt-2 p-3 bg-white rounded border text-xs font-mono">
              <p className="mb-1">
                <strong>Status:</strong> {result.reason}
              </p>
              <p className="mb-1">
                <strong>Hash Calculado (SHA-256):</strong>
              </p>
              <code className="block text-gray-600 break-all mb-2">
                {result.hash_calculated}
              </code>
              <p className="text-gray-500 text-xs mt-2">
                {result.valid
                  ? 'O hash calculado corresponde ao hash verificado na assinatura.'
                  : 'O hash calculado não corresponde ao esperado pela assinatura.'}
              </p>
            </div>
          </details>

          {/* Explicação dos pilares */}
          {result.valid && (
            <div className="mt-3 pt-3 border-t border-green-300">
              <p className="text-sm text-green-800">
                <strong>Garantias verificadas:</strong>
              </p>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>✓ <strong>Autenticidade:</strong> Documento assinado pelo detentor da chave privada</li>
                <li>✓ <strong>Integridade:</strong> Documento não foi alterado após a assinatura</li>
                <li>✓ <strong>Não-Repúdio:</strong> Signatário não pode negar a autoria</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
