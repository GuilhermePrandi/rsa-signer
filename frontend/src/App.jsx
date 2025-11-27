import { useState } from 'react';
import KeyGenerator from './components/KeyGenerator';
import DocumentSigner from './components/DocumentSigner';
import SignatureVerifier from './components/SignatureVerifier';

const TABS = {
  KEYS: 'keys',
  SIGN: 'sign',
  VERIFY: 'verify',
};

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.KEYS);

  const tabClass = (tab) => `
    px-4 py-2 font-medium text-sm rounded-t-lg transition-colors
    ${activeTab === tab
      ? 'bg-white text-blue-600 border-t-2 border-x border-blue-600'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
  `;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">SeguraAssina</h1>
          <p className="text-blue-200 text-sm mt-1">
            Assinatura Digital utilizando RSA
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Descrição */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>O que é assinatura digital?</strong> É um mecanismo criptográfico que
            garante a <strong>autenticidade</strong> (quem assinou),{' '}
            <strong>integridade</strong> (documento não foi alterado) e{' '}
            <strong>não-repúdio</strong> (signatário não pode negar) de documentos digitais.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-300">
          <button
            className={tabClass(TABS.KEYS)}
            onClick={() => setActiveTab(TABS.KEYS)}
          >
            1. Gerar Chaves
          </button>
          <button
            className={tabClass(TABS.SIGN)}
            onClick={() => setActiveTab(TABS.SIGN)}
          >
            2. Assinar
          </button>
          <button
            className={tabClass(TABS.VERIFY)}
            onClick={() => setActiveTab(TABS.VERIFY)}
          >
            3. Verificar
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === TABS.KEYS && <KeyGenerator />}
          {activeTab === TABS.SIGN && <DocumentSigner />}
          {activeTab === TABS.VERIFY && <SignatureVerifier />}
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-2">Algoritmo RSA</h3>
            <p className="text-sm text-gray-600">
              Criptografia assimétrica com par de chaves (pública/privada).
              A chave privada assina, a pública verifica.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-2">Hash SHA-256</h3>
            <p className="text-sm text-gray-600">
              Função de resumo criptográfico que gera uma impressão digital
              única de 256 bits para qualquer documento.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-800 mb-2">Paradigma Hash-Then-Sign</h3>
            <p className="text-sm text-gray-600">
              O documento não é assinado diretamente. Primeiro calcula-se o hash,
              depois assina-se apenas esse resumo.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>
            SeguraAssina - Projeto Educacional de Segurança em Computação
          </p>
          <p className="text-gray-500 mt-1">
            UFSC - Universidade Federal de Santa Catarina
          </p>
        </div>
      </footer>
    </div>
  );
}
