import json
import requests
import time

base_url = "https://www.legginx.com"
output_file = "legginx_data.json"

site_data = {
    "collections": [],
    "products": []
}

print("Fetching collections...")
collections_resp = requests.get(f"{base_url}/collections.json")
if collections_resp.status_code == 200:
    site_data["collections"] = collections_resp.json().get('collections', [])
else:
    print(f"Failed to fetch collections: {collections_resp.status_code}")

print("Fetching all products...")
page = 1
while True:
    products_resp = requests.get(f"{base_url}/products.json?page={page}&limit=250")
    if products_resp.status_code != 200:
        print(f"Failed to fetch products page {page}: {products_resp.status_code}")
        break
        
    products = products_resp.json().get('products', [])
    if not products:
        break
        
    site_data["products"].extend(products)
    print(f"  Fetched page {page} ({len(products)} products)...")
    page += 1
    time.sleep(0.5)

print(f"Total collections: {len(site_data['collections'])}")
print(f"Total products: {len(site_data['products'])}")

print(f"Writing to {output_file}...")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(site_data, f, indent=2, ensure_ascii=False)

print("Done!")
