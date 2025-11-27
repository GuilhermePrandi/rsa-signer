import { useState, useRef } from 'react';
import { signDocument, fileToBase64, downloadFile, calculateHash } from '../services/api';

export default function DocumentSigner() {
  const [file, setFile] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [hash, setHash] = useState('');
  const [signature, setSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;

    // Verificar tamanho (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Arquivo excede o limite de 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSignature('');

    // Calcular hash do documento
    try {
      const base64 = await fileToBase64(selectedFile);
      const result = await calculateHash(base64);
      setHash(result.hash);
    } catch {
      setHash('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSign = async () => {
    if (!file || !privateKey.trim()) {
      setError('Selecione um documento e forneça a chave privada');
      return;
    }

    setIsLoading(true);
    setError('');
    setSignature('');

    try {
      const documentBase64 = await fileToBase64(file);
      const result = await signDocument(documentBase64, privateKey);

      setSignature(result.signature);
      setHash(result.hash);

      // Download automático do arquivo de assinatura
      const sigContent = JSON.stringify({
        signature: result.signature,
        algorithm: result.algorithm,
        filename: file.name,
        hash: result.hash
      }, null, 2);

      downloadFile(sigContent, `${file.name}.sig`, 'application/json');

    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao assinar documento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyFileUpload = async (e) => {
    const keyFile = e.target.files[0];
    if (keyFile) {
      const text = await keyFile.text();
      setPrivateKey(text);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Assinar Documento
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        Assine um documento com sua chave privada. O hash SHA-256 será exibido para verificação.
      </p>

      {/* Upload de documento */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Documento
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${file ? 'bg-green-50 border-green-300' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          {file ? (
            <div>
              <p className="text-green-700 font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Arraste um arquivo ou clique para selecionar</p>
              <p className="text-xs text-gray-400 mt-1">Máximo: 10MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Hash do documento */}
      {hash && (
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hash SHA-256 do Documento
          </label>
          <code className="text-xs text-gray-600 break-all font-mono">
            {hash}
          </code>
        </div>
      )}

      {/* Chave privada */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Chave Privada
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
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
          className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-xs resize-none"
        />
      </div>

      {/* Botão de assinatura */}
      <button
        onClick={handleSign}
        disabled={isLoading || !file || !privateKey.trim()}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors
          ${isLoading || !file || !privateKey.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Assinando...
          </span>
        ) : (
          'Assinar Documento'
        )}
      </button>

      {/* Erro */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Assinatura gerada */}
      {signature && (
        <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded">
          <p className="text-green-800 font-medium mb-2">
            ✓ Documento assinado com sucesso!
          </p>
          <p className="text-sm text-gray-600 mb-2">
            O arquivo de assinatura (.sig) foi baixado automaticamente.
          </p>
          <details className="mt-2">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Ver assinatura (Base64)
            </summary>
            <code className="block mt-2 text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border">
              {signature}
            </code>
          </details>
        </div>
      )}
    </div>
  );
}
