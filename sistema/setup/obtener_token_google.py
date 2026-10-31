"""Se corre UNA sola vez, en la compu de Flor, para darle permiso al sistema
sobre su Gmail, Drive, Docs y Calendar. No se comparte ninguna contraseña:
Google muestra su pantalla de "Permitir" y devuelve un token que va directo a
GitHub › Settings › Secrets.

Pasos (ver sistema/LEEME.md, sección "Conectar Google"):
  1. pip install google-auth-oauthlib
  2. python obtener_token_google.py ruta/al/client_secret.json
  3. Se abre el navegador → elegís florenciapersico@breakingbarriers.site → Permitir.
  4. Copiá los 3 valores que imprime en los Secrets de GitHub.
"""
import json
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/calendar",
]

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "client_secret.json"
    flow = InstalledAppFlow.from_client_secrets_file(path, SCOPES)
    creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
    info = json.load(open(path)).get("installed") or json.load(open(path)).get("web")
    print("\nCopiá estos 3 valores en GitHub › Settings › Secrets and variables › Actions:\n")
    print("GOOGLE_CLIENT_ID     =", info["client_id"])
    print("GOOGLE_CLIENT_SECRET =", info["client_secret"])
    print("GOOGLE_REFRESH_TOKEN =", creds.refresh_token)
