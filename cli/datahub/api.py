"""API client for DataHub CLI."""

from typing import Any, Dict, List, Optional

import requests

from .config import get_api_url, get_token


class APIError(Exception):
    """API error with status code and message."""
    
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"API Error ({status_code}): {message}")


class APIClient:
    """Client for DataHub API."""
    
    def __init__(self):
        self.base_url = get_api_url()
        self.token = get_token()
    
    def _headers(self) -> Dict[str, str]:
        """Get request headers."""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Any:
        """Make an API request."""
        url = f"{self.base_url}/api{endpoint}"
        
        response = requests.request(
            method=method,
            url=url,
            headers=self._headers(),
            json=data,
            params=params,
            timeout=30,
        )
        
        if response.status_code >= 400:
            try:
                error_data = response.json()
                message = error_data.get("error", response.text)
            except Exception:
                message = response.text
            raise APIError(response.status_code, message)
        
        if response.status_code == 204:
            return None
            
        return response.json()
    
    def login(self, username: str, password: str) -> str:
        """
        Login and get authentication token.
        
        Args:
            username: Admin username
            password: Admin password
            
        Returns:
            Authentication token
        """
        result = self._request(
            "POST",
            "/auth/login",
            data={"username": username, "password": password},
        )
        return result.get("token", "")
    
    def check_auth(self) -> bool:
        """Check if current token is valid."""
        try:
            self._request("GET", "/auth/check")
            return True
        except APIError:
            return False
    
    def list_datasets(self) -> List[Dict]:
        """
        List all datasets.
        
        Returns:
            List of dataset info
        """
        return self._request("GET", "/datasets")
    
    def get_dataset(self, dataset_id: str) -> Dict:
        """
        Get dataset details.
        
        Args:
            dataset_id: Dataset ID
            
        Returns:
            Dataset info
        """
        return self._request("GET", f"/datasets/{dataset_id}")
    
    def create_dataset(self, data: Dict) -> Dict:
        """
        Create a new dataset.
        
        Args:
            data: Dataset metadata
            
        Returns:
            Created dataset info
        """
        return self._request("POST", "/datasets", data=data)
    
    def update_dataset(self, dataset_id: str, data: Dict) -> Dict:
        """
        Update an existing dataset.
        
        Args:
            dataset_id: Dataset ID
            data: Dataset metadata to update
            
        Returns:
            Updated dataset info
        """
        return self._request("PUT", f"/datasets/{dataset_id}", data=data)
    
    def delete_dataset(self, dataset_id: str) -> None:
        """
        Delete a dataset.
        
        Args:
            dataset_id: Dataset ID
        """
        self._request("DELETE", f"/datasets/{dataset_id}")
    
    def upload_complete(self, dataset_id: str, files: List[Dict], total_size: int) -> Dict:
        """
        Notify the server that upload is complete.
        
        Args:
            dataset_id: Dataset ID
            files: List of uploaded file info
            total_size: Total size of all files
            
        Returns:
            Updated dataset info
        """
        return self._request(
            "POST",
            f"/datasets/{dataset_id}/upload-complete",
            data={"files": files, "totalSize": total_size},
        )
