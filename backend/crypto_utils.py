"""
Módulo Criptográfico - SeguraAssina
Implementa operações de assinatura digital RSA com SHA-256
"""

import base64
import hashlib
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256


def generate_rsa_keypair(key_size: int = 2048) -> tuple[str, str]:
    """
    Gera par de chaves RSA.

    Args:
        key_size: Tamanho da chave em bits (2048 ou 4096)

    Returns:
        Tupla (private_key_pem, public_key_pem)
    """
    if key_size not in [2048, 4096]:
        raise ValueError("Tamanho de chave deve ser 2048 ou 4096 bits")

    # Gerar par de chaves RSA
    key = RSA.generate(key_size)

    # Exportar em formato PEM
    private_key_pem = key.export_key().decode('utf-8')
    public_key_pem = key.publickey().export_key().decode('utf-8')

    return private_key_pem, public_key_pem


def sign_document(document: bytes, private_key_pem: str) -> tuple[str, str]:
    """
    Assina um documento usando RSA com SHA-256.

    Implementa o paradigma hash-then-sign:
    1. Calcula SHA-256 do documento
    2. Assina o hash com a chave privada (PKCS#1 v1.5)

    Args:
        document: Conteúdo do documento em bytes
        private_key_pem: Chave privada em formato PEM

    Returns:
        Tupla (signature_base64, hash_hex)
    """
    # Importar chave privada
    try:
        private_key = RSA.import_key(private_key_pem)
    except ValueError as e:
        raise ValueError(f"Chave privada inválida: {e}")

    # Calcular hash SHA-256 do documento
    hash_obj = SHA256.new(document)
    hash_hex = hash_obj.hexdigest()

    # Assinar o hash com a chave privada (PKCS#1 v1.5)
    signature = pkcs1_15.new(private_key).sign(hash_obj)

    # Codificar assinatura em Base64
    signature_base64 = base64.b64encode(signature).decode('utf-8')

    return signature_base64, hash_hex


def verify_signature(document: bytes, signature_b64: str, public_key_pem: str) -> dict:
    """
    Verifica a assinatura de um documento.

    Processo de verificação:
    1. Calcula SHA-256 do documento recebido (hash_calculated)
    2. Usa a chave pública para verificar a assinatura

    Args:
        document: Conteúdo do documento em bytes
        signature_b64: Assinatura em Base64
        public_key_pem: Chave pública em formato PEM

    Returns:
        Dict com resultado da verificação:
        - valid: bool
        - hash_calculated: str (hash do documento atual)
        - reason: str (OK, INTEGRITY_VIOLATION, AUTHENTICITY_FAILURE, INVALID_KEY, INVALID_SIGNATURE)
    """
    result = {
        "valid": False,
        "hash_calculated": "",
        "reason": ""
    }

    # Importar chave pública
    try:
        public_key = RSA.import_key(public_key_pem)
    except ValueError as e:
        result["reason"] = "INVALID_KEY"
        return result

    # Decodificar assinatura de Base64
    try:
        signature = base64.b64decode(signature_b64)
    except Exception:
        result["reason"] = "INVALID_SIGNATURE"
        return result

    # Calcular hash SHA-256 do documento
    hash_obj = SHA256.new(document)
    result["hash_calculated"] = hash_obj.hexdigest()

    # Verificar assinatura
    try:
        pkcs1_15.new(public_key).verify(hash_obj, signature)
        result["valid"] = True
        result["reason"] = "OK"
    except ValueError:
        # A verificação falhou - pode ser integridade ou autenticidade
        # Como não temos como distinguir matematicamente, usamos INTEGRITY_VIOLATION
        # (o documento foi modificado OU a chave está incorreta)
        result["reason"] = "INTEGRITY_VIOLATION"

    return result


def calculate_hash(document: bytes) -> str:
    """
    Calcula o hash SHA-256 de um documento.

    Args:
        document: Conteúdo do documento em bytes

    Returns:
        Hash em formato hexadecimal
    """
    return hashlib.sha256(document).hexdigest()
