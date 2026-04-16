import os
import subprocess

# Mappings of local filenames to Unsplash URL/IDs for the new cities
mappings = {
    # DELHI
    "delhi/india-gate.jpg": "https://images.unsplash.com/photo-1587474260584-1cf10834c3ff?q=80&w=800",
    "delhi/red-fort.jpg": "https://images.unsplash.com/photo-1585135760594-3ee27eebc3f2?q=80&w=800",
    "delhi/qutub-minar.jpg": "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=800",
    "delhi/lotus-temple.jpg": "https://images.unsplash.com/photo-1567157577867-05ccb1388e6e?q=80&w=800",
    "delhi/akshardham.jpg": "https://images.unsplash.com/photo-1616036740257-9449ea1f6605?q=80&w=800",
    "delhi/humayun-tomb.jpg": "https://images.unsplash.com/photo-1523544545273-b38462efc03e?q=80&w=800",
    "delhi/jama-masjid.jpg": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800",
    "delhi/connaught-place.jpg": "https://images.unsplash.com/photo-1599341624896-03f6cc0b1d03?q=80&w=800",
    "delhi/lodhi-garden.jpg": "https://images.unsplash.com/photo-1581449553761-007f3ed6f671?q=80&w=800",
    "delhi/raj-ghat.jpg": "https://images.unsplash.com/photo-1510595306376-e175062f6b8b?q=80&w=800",
    "delhi/chandni-chowk.jpg": "https://images.unsplash.com/photo-1504198266311-84084f7b60c9?q=80&w=800",
    "delhi/khari-baoli.jpg": "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=800",
    "delhi/sarojini.jpg": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800",

    # AGRA
    "agra/taj-mahal.jpg": "https://images.unsplash.com/photo-1564507592333-c60657cef533?q=80&w=800",
    "agra/agra-fort.jpg": "https://images.unsplash.com/photo-1541059191175-e2230da37198?q=80&w=800",
    "agra/mehtab-bagh.jpg": "https://images.unsplash.com/photo-1598325513174-1ed7a5996ccb?q=80&w=800",
    "agra/baby-taj.jpg": "https://images.unsplash.com/photo-1598325513174-1ed7a5996ccb?q=80&w=800",
    "agra/fatehpur-sikri.jpg": "https://images.unsplash.com/photo-1585135760594-3ee27eebc3f2?q=80&w=800",
    "agra/akbar-tomb.jpg": "https://images.unsplash.com/photo-1585135760594-3ee27eebc3f2?q=80&w=800",
    "agra/taj-museum.jpg": "https://images.unsplash.com/photo-1585135760594-3ee27eebc3f2?q=80&w=800",
    "agra/wildlife-sos.jpg": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800",
    "agra/kinari-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "agra/yamuna-view.jpg": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800",
    "agra/sadar-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # HYDERABAD
    "hyderabad/charminar.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/golconda.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/ramoji.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/hussain-sagar.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/birla-mandir.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/salar-jung.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/chowmahalla.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/zoo.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/tank-bund.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/shilparamam.jpg": "https://images.unsplash.com/photo-1500313830540-7b665047d013?q=80&w=800",
    "hyderabad/laad-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "hyderabad/begum-bazaar.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # VARANASI
    "varanasi/kashi-vishwanath.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/dashashwamedh.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/assi-ghat.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/sarnath.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/ramnagar-fort.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/manikarnika.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/tulsi-manas.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/bhu.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/kala-bhavan.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/boat-ride.jpg": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=800",
    "varanasi/godowlia.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",
    "varanasi/vishwanath-gali.jpg": "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800",

    # FOOD
    "food/chole-bhature.jpg": "https://images.unsplash.com/photo-1626132646529-5ae7a8989e90?q=80&w=800",
    "food/paratha.jpg": "https://images.unsplash.com/photo-1601050690117-94f5f6fa0d26?q=80&w=800",
    "food/butter-chicken.jpg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=800",
    "food/chaat.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    "food/kebabs.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "food/petha.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/jalebi.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/mughlai.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "food/dalmoth.jpg": "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=800",
    "food/biryani.jpg": "https://images.unsplash.com/photo-1563379091339-0ca4b82ca5e8?q=80&w=800",
    "food/haleem.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
    "food/irani-chai.jpg": "https://images.unsplash.com/photo-1632208031355-66795ef35e8d?q=80&w=800",
    "food/double-ka-meetha.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/kachori.jpg": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800",
    "food/paan.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/malaiyo.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",
    "food/lassi.jpg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=800",

    # GUIDES
    "guides/male1.jpg": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800",
    "guides/female1.jpg": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800",
    "guides/male2.jpg": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800",
    "guides/male3.jpg": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=800",
    "guides/male4.jpg": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
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
