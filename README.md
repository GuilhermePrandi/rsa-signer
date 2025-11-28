# 🔐 SeguraAssina

Sistema web educacional para demonstração de **Assinatura Digital** utilizando **RSA** com **SHA-256**.  
O projeto permite que o usuário gere chaves, assine documentos e verifique assinaturas, mostrando de forma prática como funcionam os mecanismos de autenticidade e integridade em segurança da informação.

Desenvolvido para a disciplina de Segurança em Computação — UFSC.

## ✨ Funcionalidades

- 🔑 **Geração de Chaves RSA** (2048 ou 4096 bits)  
- 🖋️ **Assinatura de Documentos** com exibição do hash SHA-256  
- 🔍 **Verificação de Assinaturas** com detecção de adulteração e autenticidade 

## 🧱 Arquitetura

```
Backend (Python/Flask)     Frontend (React)
├── /api/generate-keys     ├── KeyGenerator
├── /api/sign              ├── DocumentSigner
└── /api/verify            └── SignatureVerifier
```

## ⚙️ Instalação

### Backend

```bash
cd backend

# Criar ambiente virtual (opcional)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python app.py
```

O backend estará disponível em `http://localhost:5000`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## 🚀 Uso

1. **Gerar Chaves**: Acesse a aba "Gerar Chaves", selecione o tamanho (2048 ou 4096 bits) e clique em "Gerar". A chave privada será baixada automaticamente.

2. **Assinar Documento**: Na aba "Assinar", faça upload do documento, cole sua chave privada e clique em "Assinar". O arquivo `.sig` será baixado.

3. **Verificar Assinatura**: Na aba "Verificar", forneça o documento original, a assinatura e a chave pública do signatário. O sistema indicará se a assinatura é válida.

## 🛠️ Tecnologias

- **Backend**: Python 3.10+, Flask, PyCryptodome
- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Criptografia**: RSA (PKCS#1 v1.5), SHA-256

## 📚 Conceitos Demonstrados

- **Autenticidade**: Garante que o documento foi assinado pelo detentor da chave privada
- **Integridade**: Detecta qualquer alteração no documento após a assinatura
- **Não-Repúdio**: Signatário não pode negar a autoria da assinatura

## ⚠️ Limitações do Trabalho 

- Uso educacional — não adequado para produção
- Gerenciamento simples de chaves (sem armazenamento seguro)
- Testado principalmente com arquivos PDF e TXT
- Implementação básica do RSA (PKCS#1 v1.5)
- Sistema sem autenticação de usuários

## 📈 Melhorias Futuras

- Suporte ao padrão RSA-PSS
- Autenticação e sessões de usuário
- Histórico de assinaturas
- Suporte a algoritmos de curva elíptica (ECDSA)
- Upload de múltiplos arquivos
- Dockerização do ambiente

## 👥 Autores

- Guilherme Prandi - 21202330
- Cainã Rinaldi Esteche - 18100523

## 📄 Licença

Projeto educacional - UFSC 2025
