import os
import requests
import time
from urllib.parse import urlparse

base_url = "https://www.legginx.com"
output_dir = "scraped_images"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print("Fetching collections...")
collections_resp = requests.get(f"{base_url}/collections.json")
if collections_resp.status_code != 200:
    print(f"Failed to fetch collections: {collections_resp.status_code}")
    exit(1)

collections = collections_resp.json().get('collections', [])

for collection in collections:
    handle = collection.get('handle')
    title = collection.get('title')
    print(f"Processing collection: {title} ({handle})")
    
    collection_dir = os.path.join(output_dir, handle)
    if not os.path.exists(collection_dir):
        os.makedirs(collection_dir)
        
    page = 1
    while True:
        products_resp = requests.get(f"{base_url}/collections/{handle}/products.json?page={page}&limit=250")
        if products_resp.status_code != 200:
            print(f"  Failed to fetch products for {handle}: {products_resp.status_code}")
            break
            
        products = products_resp.json().get('products', [])
        if not products:
            break
            
        for product in products:
            product_title = product.get('title', 'Unknown Product')
            product_handle = product.get('handle', 'unknown-product')
            images = product.get('images', [])
            
            product_dir = os.path.join(collection_dir, product_handle)
            if not os.path.exists(product_dir):
                os.makedirs(product_dir)
                
            for index, img in enumerate(images):
                src = img.get('src')
                if not src:
                    continue
                    
                # Clean URL
                parsed = urlparse(src)
                clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                filename = os.path.basename(clean_url)
                
                # if filename is empty somehow
                if not filename:
                    filename = f"{product_handle}_{index}.jpg"
                
                filepath = os.path.join(product_dir, filename)
                old_filepath = os.path.join(collection_dir, filename)
                
                if not os.path.exists(filepath):
                    if os.path.exists(old_filepath):
                        os.rename(old_filepath, filepath)
                        print(f"  Moved: {filename} to {product_handle}")
                    else:
                        try:
                            img_data = requests.get(clean_url).content
                            with open(filepath, 'wb') as handler:
                                handler.write(img_data)
                            print(f"  Downloaded: {filename} to {product_handle}")
                        except Exception as e:
                            print(f"  Failed to download {clean_url}: {e}")
                else:
                    print(f"  Skipped (already exists): {filename}")
                    
        page += 1
        time.sleep(0.5) # Be nice to the server

print("Done!")
