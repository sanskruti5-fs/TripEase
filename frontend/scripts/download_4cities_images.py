import os
import subprocess

# Mappings of local filenames to Unsplash URL/IDs for the 4 new cities
mappings = {
    # UDAIPUR
    "udaipur/city-palace.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/lake-pichola.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/jag-mandir.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/fateh-sagar.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/monsoon-palace.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/saheliyon-ki-bari.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/bagore-haveli.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/jagdish-temple.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/shilpgram.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/ropeway.jpg": "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=800",
    "udaipur/bapu-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "udaipur/hathi-pol.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "udaipur/bada-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # KOCHI
    "kochi/fort-kochi.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/fishing-nets.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/mattancherry.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/jew-town.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/marine-drive.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/cherai.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/hill-palace.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/basilica.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/lulu-mall.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/bolgatty.jpg": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=800",
    "kochi/broadway.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "kochi/jew-town-market.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "kochi/lulu-market.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # CHENNAI
    "chennai/marina.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/kapaleeshwarar.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/fort-st-george.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/san-thome.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/mahabalipuram.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/elliots.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/vgp.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/guindy.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/phoenix.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/dakshinachitra.jpg": "https://images.unsplash.com/photo-1582510003544-2d095665059e?q=80&w=800",
    "chennai/t-nagar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "chennai/pondy-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "chennai/george-town.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # KOLKATA
    "kolkata/victoria.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/howrah.jpg": "https://images.unsplash.com/photo-1587452308709-661ff97cf707?q=80&w=800",
    "kolkata/dakshineswar.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/park-street.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/indian-museum.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/eco-park.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/prinsep.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/science-city.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/belur-math.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/cemetery.jpg": "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=800",
    "kolkata/new-market.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "kolkata/gariahat.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "kolkata/college-street.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # NEW FOOD
    "food/dal-baati.jpg": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800",
    "food/mirchi-vada.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    "food/mawa-kachori.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/fish-curry.jpg": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800",
    "food/appam-stew.jpg": "https://images.unsplash.com/photo-1626132646529-5ae7a8989e90?q=80&w=800",
    "food/prawn-fry.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "food/parotta.jpg": "https://images.unsplash.com/photo-1601050690117-94f5f6fa0d26?q=80&w=800",
    "food/dosa.jpg": "https://images.unsplash.com/photo-1626132646529-5ae7a8989e90?q=80&w=800",
    "food/filter-coffee.jpg": "https://images.unsplash.com/photo-1632208031355-66795ef35e8d?q=80&w=800",
    "food/chettinad.jpg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800",
    "food/idli.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    "food/kathi-roll.jpg": "https://images.unsplash.com/photo-1626132646529-5ae7a8989e90?q=80&w=800",
    "food/phuchka.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    "food/fish-fry.jpg": "https://images.unsplash.com/photo-1563379091339-0ca4b82ca5e8?q=80&w=800",

    # NEW GUIDES
    "guides/male5.jpg": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800",
    "guides/male6.jpg": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
    "guides/male7.jpg": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
    "guides/male8.jpg": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
}

base_dir = r"c:\TripEase\frontend\public\images"

for rel_path, url in mappings.items():
    local_path = os.path.join(base_dir, rel_path.replace("/", "\\"))
    print(f"Downloading {url} to {local_path}...")
    try:
        subprocess.run(["curl", "-L", "-o", local_path, url], check=True)
    except Exception as e:
        print(f"Error downloading {rel_path}: {e}")

print("All new city images downloaded!")
