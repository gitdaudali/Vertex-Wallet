import requests
from typing import Optional, Dict, List
from decimal import Decimal
from app.core.config import settings

class BlockCypherService:
    """Service for interacting with BlockCypher API."""
    
    BASE_URL = "https://api.blockcypher.com/v1/btc"
    
    def __init__(self):
        self.api_key = settings.BLOCKCYPHER_API_KEY
        self.network = settings.BLOCKCHAIN_NETWORK
        self.base_url = f"{self.BASE_URL}/{self.network}"
    
    def _get_headers(self) -> dict:
        """Get request headers with API key."""
        return {
            "Content-Type": "application/json"
        }
    
    def _get_url(self, endpoint: str) -> str:
        """Build full API URL."""
        url = f"{self.base_url}/{endpoint}"
        if self.api_key:
            url += f"?token={self.api_key}"
        return url
    
    def generate_address(self) -> Dict[str, str]:
        """
        Generate a new Bitcoin address.
        Note: In production, use HD wallet or external key management.
        For MVP, we use BlockCypher's address generation.
        """
        response = requests.post(
            f"{self.base_url}/addrs",
            headers=self._get_headers(),
            json={}
        )
        response.raise_for_status()
        data = response.json()
        
        return {
            "address": data["address"],
            "private": data.get("private", ""),  # WARNING: Only for testnet MVP
            "public": data.get("public", ""),
            "wif": data.get("wif", "")
        }
    
    def get_address_info(self, address: str) -> Dict:
        """Get address information including balance."""
        response = requests.get(
            self._get_url(f"addrs/{address}/balance"),
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()
    
    def get_address_transactions(self, address: str) -> List[Dict]:
        """Get all transactions for an address."""
        response = requests.get(
            self._get_url(f"addrs/{address}/full"),
            headers=self._get_headers()
        )
        response.raise_for_status()
        data = response.json()
        return data.get("txs", [])
    
    def get_transaction(self, tx_hash: str) -> Dict:
        """Get transaction details by hash."""
        response = requests.get(
            self._get_url(f"txs/{tx_hash}"),
            headers=self._get_headers()
        )
        response.raise_for_status()
        return response.json()
    
    def create_webhook(self, address: str, webhook_url: str) -> Dict:
        """Create a webhook for address transactions."""
        payload = {
            "event": "tx-confirmation",
            "address": address,
            "url": webhook_url
        }
        response = requests.post(
            f"{self.base_url}/hooks",
            headers=self._get_headers(),
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def satoshi_to_btc(self, satoshi: int) -> Decimal:
        """Convert satoshi to BTC."""
        return Decimal(satoshi) / Decimal(100000000)
    
    def btc_to_satoshi(self, btc: Decimal) -> int:
        """Convert BTC to satoshi."""
        return int(btc * Decimal(100000000))

blockchain_service = BlockCypherService()

