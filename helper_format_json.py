"""
Script untuk membantu format private_key dari file JSON Google Cloud
ke format yang benar untuk secrets.toml

Cara menggunakan:
1. Download file JSON dari Google Cloud
2. Jalankan script ini
3. Copy output ke secrets.toml
"""

import json
import sys

def format_private_key_for_toml(json_file_path):
    """
    Membaca file JSON dan memformat private_key untuk secrets.toml
    """
    try:
        # Baca file JSON
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("\n" + "="*60)
        print("CREDENTIALS UNTUK secrets.toml")
        print("="*60 + "\n")
        
        # Format output untuk secrets.toml
        print(f'# Spreadsheet Key - dapatkan dari URL Google Sheets')
        print(f'spreadsheet_key = "PASTE_SPREADSHEET_KEY_ANDA_DI_SINI"\n')
        
        print(f'[gcp_service_account]')
        print(f'type = "{data.get("type", "service_account")}"')
        print(f'project_id = "{data.get("project_id", "")}"')
        print(f'private_key_id = "{data.get("private_key_id", "")}"')
        
        # Format private_key - ini yang paling penting!
        private_key = data.get("private_key", "")
        # Pastikan private_key sudah dalam format yang benar (dengan \n)
        print(f'private_key = "{private_key}"')
        
        print(f'client_email = "{data.get("client_email", "")}"')
        print(f'client_id = "{data.get("client_id", "")}"')
        print(f'auth_uri = "{data.get("auth_uri", "https://accounts.google.com/o/oauth2/auth")}"')
        print(f'token_uri = "{data.get("token_uri", "https://oauth2.googleapis.com/token")}"')
        print(f'auth_provider_x509_cert_url = "{data.get("auth_provider_x509_cert_url", "https://www.googleapis.com/oauth2/v1/certs")}"')
        print(f'client_x509_cert_url = "{data.get("client_x509_cert_url", "")}"')
        print(f'universe_domain = "{data.get("universe_domain", "googleapis.com")}"')
        
        print("\n" + "="*60)
        print("COPY SEMUA TEXT DI ATAS KE FILE .streamlit/secrets.toml")
        print("="*60 + "\n")
        
        print("✅ CHECKLIST:")
        print(f"  - Email Service Account: {data.get('client_email', '')}")
        print(f"  - Project ID: {data.get('project_id', '')}")
        print(f"  - Private Key ada: {'✅' if private_key else '❌'}")
        print(f"\n📋 JANGAN LUPA:")
        print(f"  1. Share Google Sheets ke email: {data.get('client_email', '')}")
        print(f"  2. Beri akses 'Editor'")
        print(f"  3. Copy Spreadsheet Key dari URL Google Sheets")
        
    except FileNotFoundError:
        print(f"❌ Error: File '{json_file_path}' tidak ditemukan!")
        print("Pastikan Anda sudah download file JSON dari Google Cloud.")
    except json.JSONDecodeError:
        print(f"❌ Error: File '{json_file_path}' bukan file JSON yang valid!")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("\n🔧 HELPER: Format Google Cloud JSON untuk secrets.toml\n")
    
    if len(sys.argv) > 1:
        json_file = sys.argv[1]
    else:
        # Tanya user untuk path file JSON
        print("Masukkan path ke file JSON Google Cloud Anda:")
        print("Contoh: C:\\Users\\Downloads\\absensi-rapat-123456.json")
        print("Atau tekan Enter untuk mencari file JSON di folder ini...\n")
        
        json_file = input("Path file JSON: ").strip().strip('"')
        
        if not json_file:
            # Cari file JSON di folder saat ini
            import os
            import glob
            
            json_files = glob.glob("*.json")
            if json_files:
                print(f"\n📁 Ditemukan file JSON:")
                for i, f in enumerate(json_files, 1):
                    print(f"  {i}. {f}")
                
                choice = input(f"\nPilih file (1-{len(json_files)}): ").strip()
                try:
                    json_file = json_files[int(choice) - 1]
                except:
                    print("❌ Pilihan tidak valid!")
                    sys.exit(1)
            else:
                print("❌ Tidak ada file JSON ditemukan di folder ini!")
                sys.exit(1)
    
    format_private_key_for_toml(json_file)
