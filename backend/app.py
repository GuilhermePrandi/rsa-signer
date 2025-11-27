"""
SeguraAssina - API REST
Endpoints para geração de chaves, assinatura e verificação de documentos
"""

import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from crypto_utils import generate_rsa_keypair, sign_document, verify_signature, calculate_hash

app = Flask(__name__)
CORS(app)

# Limite máximo de documento: 10MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024


@app.route('/api/generate-keys', methods=['POST'])
def api_generate_keys():
    """
    Gera par de chaves RSA.

    Request JSON:
        { "key_size": 2048 }  (opcional, padrão: 2048)

    Response JSON:
        {
            "public_key": "-----BEGIN PUBLIC KEY-----...",
            "private_key": "-----BEGIN RSA PRIVATE KEY-----..."
        }
    """
    try:
        data = request.get_json() or {}
        key_size = data.get('key_size', 2048)

        # Validar tamanho
        if key_size not in [2048, 4096]:
            return jsonify({
                "error": "Tamanho de chave inválido. Use 2048 ou 4096."
            }), 400

        private_key, public_key = generate_rsa_keypair(key_size)

        return jsonify({
            "public_key": public_key,
            "private_key": private_key,
            "key_size": key_size
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/sign', methods=['POST'])
def api_sign():
    """
    Assina um documento.

    Request JSON:
        {
            "document": "<base64 encoded document>",
            "private_key": "-----BEGIN RSA PRIVATE KEY-----..."
        }

    Response JSON:
        {
            "signature": "<base64 encoded signature>",
            "hash": "<sha256 hex>",
            "algorithm": "SHA256withRSA"
        }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        document_b64 = data.get('document')
        private_key = data.get('private_key')

        if not document_b64:
            return jsonify({"error": "Documento não fornecido"}), 400

        if not private_key:
            return jsonify({"error": "Chave privada não fornecida"}), 400

        # Decodificar documento de Base64
        try:
            document = base64.b64decode(document_b64)
        except Exception:
            return jsonify({"error": "Documento em formato Base64 inválido"}), 400

        # Verificar tamanho
        if len(document) > MAX_DOCUMENT_SIZE:
            return jsonify({
                "error": f"Documento excede o limite de {MAX_DOCUMENT_SIZE // (1024*1024)}MB"
            }), 400

        # Assinar documento
        signature, hash_hex = sign_document(document, private_key)

        return jsonify({
            "signature": signature,
            "hash": hash_hex,
            "algorithm": "SHA256withRSA",
            "document_size": len(document)
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Erro ao assinar: {str(e)}"}), 500


@app.route('/api/verify', methods=['POST'])
def api_verify():
    """
    Verifica a assinatura de um documento.

    Request JSON:
        {
            "document": "<base64 encoded document>",
            "signature": "<base64 encoded signature>",
            "public_key": "-----BEGIN PUBLIC KEY-----..."
        }

    Response JSON:
        {
            "valid": true/false,
            "hash_calculated": "<sha256 hex>",
            "reason": "OK|INTEGRITY_VIOLATION|AUTHENTICITY_FAILURE|INVALID_KEY|INVALID_SIGNATURE"
        }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        document_b64 = data.get('document')
        signature_b64 = data.get('signature')
        public_key = data.get('public_key')

        if not document_b64:
            return jsonify({"error": "Documento não fornecido"}), 400

        if not signature_b64:
            return jsonify({"error": "Assinatura não fornecida"}), 400

        if not public_key:
            return jsonify({"error": "Chave pública não fornecida"}), 400

        # Decodificar documento de Base64
        try:
            document = base64.b64decode(document_b64)
        except Exception:
            return jsonify({"error": "Documento em formato Base64 inválido"}), 400

        # Verificar tamanho
        if len(document) > MAX_DOCUMENT_SIZE:
            return jsonify({
                "error": f"Documento excede o limite de {MAX_DOCUMENT_SIZE // (1024*1024)}MB"
            }), 400

        # Verificar assinatura
        result = verify_signature(document, signature_b64, public_key)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": f"Erro ao verificar: {str(e)}"}), 500


@app.route('/api/hash', methods=['POST'])
def api_hash():
    """
    Calcula o hash SHA-256 de um documento.
    Endpoint auxiliar para fins didáticos.

    Request JSON:
        { "document": "<base64 encoded document>" }

    Response JSON:
        { "hash": "<sha256 hex>", "algorithm": "SHA-256" }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400

        document_b64 = data.get('document')

        if not document_b64:
            return jsonify({"error": "Documento não fornecido"}), 400

        # Decodificar documento de Base64
        try:
            document = base64.b64decode(document_b64)
        except Exception:
            return jsonify({"error": "Documento em formato Base64 inválido"}), 400

        hash_hex = calculate_hash(document)

        return jsonify({
            "hash": hash_hex,
            "algorithm": "SHA-256",
            "document_size": len(document)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde da API."""
    return jsonify({
        "status": "ok",
        "service": "SeguraAssina API",
        "version": "1.0.0"
    })


if __name__ == '__main__':
    print("=" * 50)
    print("  SeguraAssina - API de Assinatura Digital")
    print("  Servidor rodando em http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)
