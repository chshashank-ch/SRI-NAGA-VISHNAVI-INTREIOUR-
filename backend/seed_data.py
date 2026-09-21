import sys
from pathlib import Path
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from database import get_db_connection, init_db

def seed():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if projects exist
    cursor.execute("SELECT COUNT(*) FROM projects")
    count = cursor.fetchone()[0]

    if count > 0:
        print(f"Database already contains {count} projects. Skipping seed.")
        conn.close()
        return

    sample_projects = [
        {
            "title": "Heavy-Duty Aluminium Mosquito Mesh Balcony Door",
            "category": "mesh_doors",
            "description": "Custom fabricated powder-coated aluminium frame with high-grade SS304 invisible wire mesh. Provides 100% insect protection with unrestricted airflow and panoramic balcony visibility.",
            "image_url": "/assets/images/mesh_door.jpg",
            "specifications": "Material: Grade 6063-T6 Aluminium + SS304 Wire Mesh | Lock: Multi-point latch | Finish: Matte Charcoal Powder Coating | Warranty: 5 Years Rust-Free",
            "featured": 1,
            "price_range": "₹3,500 - ₹7,500 (Custom sizes)"
        },
        {
            "title": "Pleated Sliding Mosquito Screen System",
            "category": "mesh_doors",
            "description": "Retractable concertina pleated mesh designed for expansive French windows, balcony sliding doors, and sit-outs. Foldable accordion design with zero floor obstruction.",
            "image_url": "/assets/images/hero.jpg",
            "specifications": "Mesh: German Polyester Pleated Fabric | Guide Rail: Low-profile 3mm threshold | Operation: Smooth cord-guided sliding | Color: Customizable",
            "featured": 1,
            "price_range": "₹180 - ₹260 per sq. ft."
        },
        {
            "title": "Designer Waterproof WPC Bathroom Door with Frosted Glass Panel",
            "category": "bathroom_doors",
            "description": "100% waterproof, termite-proof, and borer-resistant solid Wood Polymer Composite (WPC) door featuring an elegant frosted vertical glass panel and brushed satin handle.",
            "image_url": "/assets/images/bathroom_door.jpg",
            "specifications": "Core: High-density WPC solid core | Waterproof: 100% Submersion resistant | Hardware: Rust-proof SS Hinges & Cylinder Lock | Finish: Wood grain laminate",
            "featured": 1,
            "price_range": "₹5,200 - ₹8,800"
        },
        {
            "title": "Heavy Duty UPVC Moisture-Proof Restroom Door",
            "category": "bathroom_doors",
            "description": "Seamless hollow-core multi-chambered UPVC door fitted with stainless steel hinges, acoustic rubber gaskets, and moisture-resistant locking mechanism.",
            "image_url": "/assets/images/bathroom_door.jpg",
            "specifications": "Profile: Virgin UPVC 3-chamber profile | Thickness: 32mm | Lock: Privacy thumb-turn brass latch | Maintenance: Washable with soap & water",
            "featured": 0,
            "price_range": "₹4,200 - ₹6,500"
        },
        {
            "title": "Balcony Ceiling 6-Pipe Pulley Cloth Drying Hanger System",
            "category": "cloth_hangers",
            "description": "Heavy-duty ceiling-mounted individual pipe pulley cloth drying hanger. Built with genuine Jindal SS304 stainless steel pipes and high-tensile braided nylon ropes for effortless lifting.",
            "image_url": "/assets/images/cloth_hanger.jpg",
            "specifications": "Pipes: 6 Pipes (Available in 4ft, 5ft, 6ft, 7ft, 8ft) | Pipe Gauge: SS304 Rustproof (0.8mm wall) | Capacity: 35 kg load per rack | Pulley: Dual bearing nylon wheels",
            "featured": 1,
            "price_range": "₹1,800 - ₹3,200 (Includes Installation)"
        },
        {
            "title": "Wall-Mounted Retractable Folding Stainless Steel Cloth Dryer",
            "category": "cloth_hangers",
            "description": "Accordion style wall-mounted collapsible drying rack for utility areas, narrow balconies, and indoor laundry walls. Folds completely flat against the wall when not in use.",
            "image_url": "/assets/images/cloth_hanger.jpg",
            "specifications": "Build: Complete SS202/SS304 | Extends: 2.5 ft out | Retracts: Folds flat to 2 inches | Capacity: 25 kg wet laundry",
            "featured": 0,
            "price_range": "₹1,400 - ₹2,400"
        },
        {
            "title": "Luxury Dual-Tone Zebra Blinds for Living & Bedrooms",
            "category": "blinds",
            "description": "Contemporary daylight-filtering and privacy-regulating zebra roller blinds. Seamlessly switch between transparent and blackout stripe alignment with a smooth chain pull.",
            "image_url": "/assets/images/blinds.jpg",
            "specifications": "Fabric: 100% Anti-static Polyester | Headrail: Extruded aluminium cassette with bottom weight bar | Mechanism: Smooth bead chain clutch | UV Protection: 85%",
            "featured": 1,
            "price_range": "₹120 - ₹195 per sq. ft."
        },
        {
            "title": "Custom Blackout Roller & Venetian Window Blinds",
            "category": "blinds",
            "description": "Total blackout thermal roller blinds designed for master bedrooms, home theatres, and sunny windows to keep rooms cool and completely private.",
            "image_url": "/assets/images/blinds.jpg",
            "specifications": "Blackout Grade: 100% Light blockout | Coating: Silver thermal reflective backing | Operating Type: Manual or motorized option | Fire Retardant: Yes",
            "featured": 0,
            "price_range": "₹110 - ₹175 per sq. ft."
        },
        {
            "title": "Architectural Window Accessories, Pelmets & Heavy Sliding Tracks",
            "category": "window_accessories",
            "description": "Complete range of window upgrade accessories: silent-gliding ripple fold curtain tracks, designer valances, aluminium sliding mesh tracks, and secure window grills.",
            "image_url": "/assets/images/blinds.jpg",
            "specifications": "Tracks: Anodized aluminium silent-glide | Carriers: Ball-bearing wheeled runners | Finish: Champagne Gold / Matt Black / Pure White",
            "featured": 0,
            "price_range": "Custom workshop quote"
        },
        {
            "title": "Main Entrance Security Safety Door with Wood & Steel Finish",
            "category": "designer_doors",
            "description": "Heavy-gauge dual-panel safety door featuring high-tensile steel security framework clad with teak-finish weatherproof HPL laminate and multi-bolt security lock.",
            "image_url": "/assets/images/hero.jpg",
            "specifications": "Structure: 16-gauge cold rolled steel framework | Core: Acoustic PUF infill | Locks: Godrej 6-lever deadbolt system | Weight: 45 kg sturdy build",
            "featured": 1,
            "price_range": "₹14,500 - ₹24,000"
        }
    ]

    for p in sample_projects:
        cursor.execute("""
        INSERT INTO projects (title, category, description, image_url, specifications, featured, price_range)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            p["title"],
            p["category"],
            p["description"],
            p["image_url"],
            p["specifications"],
            p["featured"],
            p["price_range"]
        ))

    # Add 2 sample inquiries
    sample_inquiries = [
        {
            "name": "Ramesh Varma",
            "phone": "+91 98491 88231",
            "service": "Mesh Doors & Balcony Sliding",
            "message": "Need mosquito mesh sliding doors for 2 balconies and 1 main door in our new flat at Kondapur.",
            "address": "Flat 402, Green Valley Apartments, Kondapur",
            "status": "New"
        },
        {
            "name": "Sunitha Reddy",
            "phone": "+91 97011 22940",
            "service": "Ceiling Cloth Drying Hanger",
            "message": "Interested in 6-pipe 7ft ceiling hanger for apartment utility balcony. Please share quotation and installation timeline.",
            "address": "Miyapur, Hyderabad",
            "status": "Quoted"
        }
    ]

    for inq in sample_inquiries:
        cursor.execute("""
        INSERT INTO inquiries (name, phone, service, message, address, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            inq["name"],
            inq["phone"],
            inq["service"],
            inq["message"],
            inq["address"],
            inq["status"]
        ))

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(sample_projects)} projects and {len(sample_inquiries)} inquiries.")

if __name__ == "__main__":
    seed()
