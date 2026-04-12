import json
import requests
import time
import os
from bs4 import BeautifulSoup

base_url = "https://www.legginx.com"
output_file = "legginx_comprehensive_data.json"

def get_shopify_data(endpoint):
    print(f"Fetching {endpoint}...")
    data = []
    page = 1
    while True:
        resp = requests.get(f"{base_url}/{endpoint}.json?page={page}&limit=250")
        if resp.status_code != 200:
            print(f"  Failed {endpoint} page {page}: {resp.status_code}")
            break
        items = resp.json().get(endpoint, [])
        if not items:
            break
        data.extend(items)
        print(f"  Fetched {len(items)} items from page {page}")
        page += 1
        time.sleep(0.5)
    return data

def scrape_policies():
    print("Scraping policies...")
    policy_data = {}
    policies = ['privacy-policy', 'refund-policy', 'terms-of-service', 'shipping-policy', 'contact-information']
    for p in policies:
        url = f"{base_url}/policies/{p}"
        resp = requests.get(url)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            # Look for the main content of the policy
            content = soup.find('main') or soup.find('article') or soup.find('div', class_='shopify-policy__container')
            if content:
                policy_data[p] = content.get_text(separator='\n', strip=True)
            else:
                policy_data[p] = soup.get_text(separator='\n', strip=True)
            print(f"  Scraped {p}")
        else:
            print(f"  Failed to scrape {p}: {resp.status_code}")
    return policy_data

# Data from Instagram manual check
instagram_data = {
    "handle": "@legginx",
    "url": "https://www.instagram.com/legginx",
    "stats": {
        "posts": 34,
        "followers": 338,
        "following": 10
    },
    "recent_captions": [
        "Aura Sports Bra is live now ✨ Your new favorite fit—soft, clean...",
        "gym essentials Ψ · squat & rdl combo in a full @legginx set · Push yourself... my legs have seriously grown SO MUCH...",
        "off season flow outfit: @legginx i do it all for my future self @dfyne.official code ASHLEY origin bra + impact shorts in espresso vision shrug in umber.",
        "easy on the eyes, heavy on the discipline🖤 @legginx Black ... Quiet focus. Loud results. Lately the grind hasn't been easy, and I won't pretend it has. Excuses come easy, growth doesn't.",
        "RIVAL SHORTS — MINT ✨ For those who live the lifestyle. LEGGINX.COM Ψ | earn your physique. Athlete: @yvonnacastillo · #npcwellness #npcbikini."
    ],
    "linked_accounts": ["@yvonnacastillo", "@dfyne.official"]
}

def main():
    site_data = {
        "shop_info": {
            "name": "LEGGINX.COM",
            "url": base_url,
            "social": {
                "instagram": "https://www.instagram.com/legginx"
            }
        },
        "collections": get_shopify_data("collections"),
        "products": get_shopify_data("products"),
        "pages": get_shopify_data("pages"),
        "policies": scrape_policies(),
        "instagram": instagram_data
    }

    print(f"Writing comprehensive data to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(site_data, f, indent=2, ensure_ascii=False)
    print("Done!")

if __name__ == "__main__":
    main()
