/**
 * Buyer guides — long-form, genuinely useful editorial content for SEO
 * (targets buyer-intent queries) and for helping real customers spec equipment.
 * Content is static and author-reviewed.
 */

export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "p"; html: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; html: string };

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  category: string;
  readMins: number;
  /** ISO date — datePublished / dateModified for Article schema. */
  updated: string;
  body: GuideBlock[];
  related: { label: string; href: string }[];
};

export const GUIDES: Guide[] = [
  {
    "slug": "restaurant-equipment-checklist",
    "title": "Opening a Restaurant: The Kitchen Equipment Checklist",
    "excerpt": "A practical, station-by-station checklist for equipping a new commercial kitchen — cooking line, ventilation, refrigeration, warewashing and holding — with the specs, utilities and lead-time planning that keep an opening on schedule.",
    "metaDescription": "A station-by-station commercial kitchen equipment checklist for new restaurants: cooking line, ventilation, refrigeration, warewashing, holding, plus budgeting, lead times and financing.",
    "category": "Buying guide",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Equipping a new commercial kitchen is a sequencing problem as much as a purchasing one. The line has to fit the menu, the ventilation has to match the cooking equipment, and the electrical service has to be sized before anything is bolted down. Order those decisions wrong and you pay for it in change orders, failed inspections and opening delays. This checklist walks the kitchen station by station in the order a professional buyer should actually think about it, with the specs and lead-time realities that catch most first-time operators."
      },
      {
        "type": "h2",
        "text": "Start with the cooking line"
      },
      {
        "type": "p",
        "html": "The cooking line drives every other decision in the room, so specify it first. Build your equipment list from the menu, not from a catalog: count covers at peak, then decide how many burners, wok wells, steamer compartments or roaster racks you need to hit that number without a bottleneck. For high-volume Asian and institutional kitchens, a <a href=\"/category/wok-range\">wok range</a> earns its footprint because a single well can turn a dish in ninety seconds, but each well is also a serious gas load, so quantity matters for both throughput and utility sizing."
      },
      {
        "type": "ul",
        "items": [
          "Ranges and wok ranges sized to peak covers, with confirmed gas type (natural vs. LP) and BTU load per burner",
          "Steamers for dim sum, seafood and vegetables, plumbed with the water quality and drain they require",
          "Roasters or ovens matched to your protein volume and target holding temps",
          "A written spec sheet per unit: fuel, dimensions, connection type, clearances to combustibles"
        ]
      },
      {
        "type": "p",
        "html": "Confirm the fuel and connection for every piece before you buy. Gas equipment needs the right supply pressure and pipe diameter; heavy electric equipment often needs 208/240V three-phase service and dedicated circuits sized to the nameplate amperage. Have your electrician and plumber confirm the building can deliver it before the order ships. Browse the full equipment range at <a href=\"/products\">our products catalog</a> to match units to your line."
      },
      {
        "type": "h2",
        "text": "Size ventilation to the equipment, not the room"
      },
      {
        "type": "p",
        "html": "Ventilation is where new kitchens most often fail inspection, because the hood is specified after the fact instead of to the appliances beneath it. Exhaust CFM is a function of hood type, canopy length and the duty of the cooking equipment below it — a wok line and a heavy char-broiler pull far more air than a light-duty range. Whatever you exhaust, you must replace: your makeup air unit should supply roughly 80 to 90 percent of exhaust volume so the kitchen stays at slight negative pressure without starving burners or slamming doors."
      },
      {
        "type": "callout",
        "html": "<strong>Design the hood and makeup air with your mechanical contractor before you finalize the cooking line.</strong> Retrofitting ventilation after equipment is set is one of the most expensive mistakes in a new kitchen."
      },
      {
        "type": "h2",
        "text": "Refrigeration and prep"
      },
      {
        "type": "p",
        "html": "Map cold storage to your delivery schedule and prep flow. You typically need three tiers: bulk storage (walk-in cooler and freezer), line-side holding (reach-ins and undercounter units at each station), and prep-surface refrigeration (prep tables and rail units that keep mise en place at safe temperature during service). Keep raw and ready-to-eat storage separate to satisfy your health code. Size the walk-in to your least-frequent delivery, not your average day, or you will run out of room every time a big order lands."
      },
      {
        "type": "h2",
        "text": "Warewashing and sanitation"
      },
      {
        "type": "p",
        "html": "Most jurisdictions require a three-compartment sink for manual warewashing regardless of whether you run a machine, plus separate hand sinks and a mop sink. If you install a dish machine, decide early between high-temp (which needs a booster heater and the electrical to feed it) and low-temp chemical sanitizing, because that choice changes your plumbing and utility load. Add grease management — floor drains, grease trap or interceptor sized to your fixtures — to the plan before the slab work is done."
      },
      {
        "type": "h2",
        "text": "Holding, smallwares and the finish list"
      },
      {
        "type": "p",
        "html": "Hot and cold holding is what protects food quality between the line and the guest. Hold hot food at 140°F or above and cold food at 41°F or below, and buy enough holding capacity that your cooks aren't crowding the range to keep plates warm. Then work the long tail: worktables, shelving, sheet pans, hotel pans, knives, thermometers and the hundreds of smallwares that never make the first budget draft but are needed on day one."
      },
      {
        "type": "h2",
        "text": "Budget, lead time and financing"
      },
      {
        "type": "p",
        "html": "Two numbers derail more openings than equipment cost itself: lead time and installed cost. In-stock equipment can ship in 24 to 48 hours, but custom builds are made to order and need to be placed early against your construction schedule. Budget for the installed cost, not the sticker — freight, rigging, electrical, gas and plumbing connections, and ventilation are real line items. Spreading equipment cost over its useful life through <a href=\"/financing\">equipment financing</a> preserves the working capital a new restaurant needs for its first lean months. If you want a second set of eyes on your line before you commit, <a href=\"/contact\">talk to us</a> about your menu, your space and your opening date."
      },
      {
        "type": "p",
        "html": "Work the list top to bottom — cooking line, ventilation, refrigeration, warewashing, holding and smallwares — confirming utilities at each step, and you'll walk into inspection with a kitchen that's built to the menu and ready to open on schedule."
      }
    ],
    "related": [
      {
        "label": "Wok ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Browse all equipment",
        "href": "/products"
      },
      {
        "label": "Equipment financing",
        "href": "/financing"
      },
      {
        "label": "Talk to our team",
        "href": "/contact"
      }
    ]
  },
  {
    "slug": "choosing-a-commercial-wok-range",
    "title": "How to Choose a Commercial Wok Range",
    "excerpt": "A professional buyer's guide to specifying a commercial wok range: what BTU numbers really mean, bladder vs. ductile-iron chambers, burner counts, gas vs. LP, water-cooled tops, ventilation, and when to build custom.",
    "metaDescription": "How to choose a commercial wok range: BTU and firepower, chamber types, single vs. multi-burner, natural gas vs. LP, water-cooled tops, ventilation, footprint, and custom builds.",
    "category": "Buying guide",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "A wok range is the loudest, hottest, most-used piece of equipment on a Chinese or pan-Asian line, and the wrong choice shows up every service as slow recovery, weak breath-of-wok flavor, or a hood that can't keep up. Unlike a griddle or a fryer, a wok range is bought on a handful of specific numbers and construction choices that determine how it cooks for the next fifteen years. This guide walks through what actually matters when you specify one: firepower, chamber construction, burner count, fuel, water cooling, footprint and ventilation, and the point at which a stock range stops making sense and a custom build begins."
      },
      {
        "type": "h2",
        "text": "Firepower: reading BTU honestly"
      },
      {
        "type": "p",
        "html": "Chinese wok cooking depends on a very high, very fast heat release. Commercial wok burners are typically rated somewhere between roughly 100,000 and 150,000-plus BTU per hour per ring, far above a standard range top. That output is what lets a seasoned steel wok recover temperature the instant cold protein or a ladle of sauce hits it, which is the whole point of the technique."
      },
      {
        "type": "p",
        "html": "Two cautions on the number. First, a higher BTU rating is only usable if your gas supply and hood can support it; an underfed high-BTU burner never reaches its plate rating. Second, BTU is a rate, not a promise of efficiency, chamber design and blower air determine how much of that heat actually reaches the wok versus the room. Read the rating per burner, not just the total, and match it to what you cook: a banquet stir-fry station needs every bit of firepower, while a station that mostly holds and finishes may not."
      },
      {
        "type": "h2",
        "text": "Chamber types: bladder vs. ductile-iron ring"
      },
      {
        "type": "p",
        "html": "The chamber is the bowl the wok sits in and where combustion happens, and it is the single biggest driver of durability. Two common approaches exist. A curved-steel <em>bladder</em> chamber is a formed steel shell, lighter and lower cost, but it takes the direct thermal punishment of the flame and eventually warps or burns through at the hottest point. A <em>ductile-iron chamber ring</em> is a heavy cast insert that surrounds the flame path; it holds its shape under repeated heat cycling, resists cracking, and is often replaceable as a wear part rather than requiring the whole range to be rebuilt."
      },
      {
        "type": "callout",
        "html": "<strong>Rule of thumb:</strong> a curved-steel bladder is fine for lighter or intermittent duty; if the station runs hard through every service, specify a ductile-iron chamber ring and confirm it can be replaced in the field."
      },
      {
        "type": "h2",
        "text": "Single vs. multi-burner and warming pots"
      },
      {
        "type": "p",
        "html": "Wok ranges are configured by station count. Match burners to peak simultaneous tickets, not average volume, one cook working two woks at once needs a two-hole range even if the room is small. Behind the main rings, most ranges offer a rear <em>warming pot</em> (a soup or stock well) and a swing or waterfall faucet. The warming pot is where you hold blanching water, stock, or oil at temperature so the front burners stay free for firing."
      },
      {
        "type": "ul",
        "items": [
          "Single burner: prep kitchens, small menus, or a dedicated finishing station.",
          "Two to four burners: most full-service Chinese lines running simultaneous stir-fry and sauce work.",
          "Burners plus rear warming pot(s): high-volume lines that need constant hot water or stock at the station.",
          "Add a stock/soup range or steamer alongside rather than overloading the wok range with holding duty."
        ]
      },
      {
        "type": "h2",
        "text": "Natural gas vs. LP"
      },
      {
        "type": "p",
        "html": "Wok ranges run on natural gas (NG) or liquid propane (LP), and the two are not interchangeable without the correct orifices and pressure setup. Natural gas is the default for most urban buildings on a utility line; LP is common for rural sites, food trucks, and locations without gas service. Order the range configured for the fuel you actually have, converting in the field is possible on many models but requires the right orifice kit and a qualified installer, and a mismatch either starves the burner or over-fires it. Confirm your incoming gas pressure and pipe size can feed the total BTU load before the range arrives, undersized supply lines are the most common reason a new range underperforms."
      },
      {
        "type": "h2",
        "text": "Water-cooled tops and waterfall faucets"
      },
      {
        "type": "p",
        "html": "At sustained wok temperatures the range deck itself gets dangerously hot and can degrade. A <em>water-cooled top</em> circulates water through the front surface to keep it touchable and to extend the life of the steel around the chambers. Paired with it is the <em>waterfall faucet</em>, a wide swing spout that sheets water across the deck to flush oil, food debris, and grease into the trough during and after service. Together they make a hard-run range far easier to keep clean and NSF-compliant, and they meaningfully reduce burn risk for the cook. On any station that runs continuously, treat these as near-essential rather than upgrades."
      },
      {
        "type": "h2",
        "text": "Footprint and ventilation"
      },
      {
        "type": "p",
        "html": "A wok range's real footprint includes the back-guard, the rear warming pot, and the clearance the flame demands, plan the hood around the equipment, not the equipment around the hood. Because wok burners release so much heat and grease-laden vapor, they need substantial exhaust CFM and adequate makeup air; an under-sized hood will fail inspection and pull conditioned air out of the dining room. Bring your hood contractor the range's total BTU rating early. Also confirm delivery logistics: a multi-burner range is heavy freight, expect LTL shipping with a liftgate and a clear path to the kitchen, and measure your doorways before it ships."
      },
      {
        "type": "h2",
        "text": "When a custom range makes sense"
      },
      {
        "type": "p",
        "html": "Stock ranges cover most layouts, but a custom-built range is worth it when the room or the menu is unusual: a non-standard line length, a specific mix of wok holes, stock pots, and a griddle in one chassis, left- or right-hand faucet placement, or a burner output tuned to a particular style of cooking. Because Panda wok ranges are welded and line-tested in the New York factory, custom configurations are built to order rather than adapted from a catalog. If a stock model forces you to compromise on burner count or station layout, price the custom option before you settle, browse the current lineup on the <a href=\"/category/wok-range\">wok range category</a>, then send your line drawing and gas details through <a href=\"/contact\">contact</a> for a custom quote."
      },
      {
        "type": "p",
        "html": "Whatever you specify, confirm the range carries the listings your jurisdiction requires, Panda equipment is NSF, CSA and ETL listed, and get the fuel type, gas pressure, and hood CFM agreed among your installer, your hood contractor, and the manufacturer before anything ships. Those three conversations up front prevent nearly every expensive surprise on install day."
      }
    ],
    "related": [
      {
        "label": "Panda wok ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Request a custom quote",
        "href": "/contact"
      },
      {
        "label": "Shipping & freight",
        "href": "/shipping"
      },
      {
        "label": "Financing options",
        "href": "/financing"
      }
    ]
  },
  {
    "slug": "sizing-commercial-steamers-and-noodle-cookers",
    "title": "Sizing Commercial Steamers & Noodle Cookers",
    "excerpt": "How to size a commercial steamer or noodle cooker to your kitchen: real throughput over rated capacity, recovery time, auto vs manual water-fill, gas vs electric steam, footprint and freight, and matching capacity to your covers and menu.",
    "metaDescription": "A practical guide to sizing commercial steamers and noodle cookers — throughput, recovery time, water-fill, gas vs electric, footprint and LTL freight, matched to your menu.",
    "category": "Buying guide",
    "readMins": 5,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Steam capacity is one of the easiest specs to get wrong. Buy too small and your line backs up during a rush; buy too big and you pay for gas or electricity to heat water you never use, while giving up bench space you needed elsewhere. The right size comes from matching real throughput — baskets or pans per hour, recovery time between loads, and how fast the cabinet refills — to your covers and your menu. This guide walks through the numbers that actually matter when you spec a commercial steamer or a noodle cooker."
      },
      {
        "type": "h2",
        "text": "Start with throughput, not cabinet size"
      },
      {
        "type": "p",
        "html": "Manufacturers list steamers by pan or basket capacity, but a rated capacity only tells you how much fits inside at once. What you care about is how much cooked food comes <em>out</em> per hour. A three-pan convection compartment that recovers quickly can out-produce a five-pan boiler-based unit that stalls after every door opening. When you compare units, ask two questions: how many full-size pans (or noodle baskets) does it hold per compartment, and how long is the cook-plus-recovery cycle for your typical load. Multiply cycles per hour by pans per cycle and you have real throughput."
      },
      {
        "type": "p",
        "html": "For a noodle or multipurpose cooker, count basket stations rather than pans. A cooker with more independent baskets lets you run different products at different timings without cross-timing everything to the slowest item. Our <a href=\"/category/optispace\">OptiSpace multipurpose and noodle cookers</a> are built around that station-based workflow for high-mix menus."
      },
      {
        "type": "h2",
        "text": "Recovery time and water capacity"
      },
      {
        "type": "p",
        "html": "Recovery time is the interval it takes the unit to return to full steam after you open the door and load cold product. In a busy kitchen this number, not peak capacity, sets your effective output. Boiler-style steamers hold a reservoir of hot water and generally recover fast, but the boiler needs periodic descaling and draining, especially on hard water. Connectionless or boilerless steamers hold a small measured amount of water in the compartment base; they use less water and are simpler to clean, but a heavy continuous load can outpace them. Match the type to your duty cycle: steady all-day volume favors a boiler; intermittent or lighter service is well suited to boilerless."
      },
      {
        "type": "callout",
        "html": "<strong>Water quality drives reliability.</strong> Scale is the leading cause of steamer downtime. Test your incoming water hardness and budget for treatment or a descaling schedule before you commit to a boiler-based unit."
      },
      {
        "type": "h2",
        "text": "Auto water-fill vs manual"
      },
      {
        "type": "p",
        "html": "Auto water-fill units connect to a water line and maintain their own level, which keeps steam output steady and removes a step from the cook's routine — important on a busy line where nobody has time to babysit a reservoir. Manual-fill units need no plumbing connection, so they place anywhere you have power or gas, but someone has to check and top off the water, and running dry risks the element or burner. If you have a floor drain and a treated water line where the unit will live, auto-fill is usually worth it. If the unit needs to be mobile or the location has no plumbing, manual fill keeps you flexible."
      },
      {
        "type": "h2",
        "text": "Gas vs electric steam"
      },
      {
        "type": "p",
        "html": "Gas steamers heat a boiler or compartment with a burner rated in BTU per hour; electric units use immersion or convection elements rated in kW. The choice usually follows the utilities you already have. Gas often costs less to run where natural gas is cheap, and it keeps producing during an electrical outage, but it needs a gas connection, combustion clearance, and ventilation. Confirm whether the unit is configured for natural gas or LP — they are not interchangeable without a conversion. Electric runs cleaner at the point of use and installs anywhere with adequate service, but verify your panel can carry the load; a large electric steamer can pull substantial amperage across three phases. Whichever you choose, confirm the unit carries the listings your inspector expects — the equipment we build is NSF, CSA and ETL listed."
      },
      {
        "type": "h2",
        "text": "Footprint, utilities and delivery"
      },
      {
        "type": "p",
        "html": "Before you fall in love with a spec, measure the space and the path to it. Check these against the room:"
      },
      {
        "type": "ul",
        "items": [
          "Cabinet width and depth, plus door swing and clearance for loading full pans",
          "Whether it is a countertop, stand, or floor unit, and whether a stand adds needed under-storage",
          "Combustion and service clearances for gas, or panel capacity and phase for electric",
          "A floor drain within reach for boiler blowdown and compartment draining",
          "Door widths and the delivery path — a large floor steamer ships LTL freight on a pallet and usually needs a liftgate, so confirm you have a dock or order liftgate service"
        ]
      },
      {
        "type": "h2",
        "text": "Matching capacity to covers and menu"
      },
      {
        "type": "p",
        "html": "Translate your menu into steamer minutes. Estimate how many steamed items leave the pass during your busiest hour — dumplings, buns, fish, rice, blanched vegetables, or noodle portions — and how many pans or baskets each represents. Add a margin for menu growth and for the reality that peak demand clusters, it does not arrive evenly. Then pick the unit whose real throughput, after recovery, clears that peak with room to spare. A common mistake is sizing to average daily volume; you should size to the worst fifteen minutes of service, because that is when an undersized unit fails you."
      },
      {
        "type": "p",
        "html": "If your menu mixes steamed proteins with rice and noodles, consider splitting the load across a dedicated <a href=\"/category/steamer\">commercial steamer</a> for pan-based items and a station-based noodle cooker for portioned boiling — two right-sized units often beat one oversized cabinet on both throughput and flexibility. When you have your pan counts and utility constraints in hand, our team can help confirm the configuration before you order."
      }
    ],
    "related": [
      {
        "label": "Commercial steamers",
        "href": "/category/steamer"
      },
      {
        "label": "OptiSpace multipurpose & noodle cookers",
        "href": "/category/optispace"
      },
      {
        "label": "Shipping & freight",
        "href": "/shipping"
      },
      {
        "label": "Contact our team",
        "href": "/contact"
      }
    ]
  },
  {
    "slug": "commercial-refrigeration-guide",
    "title": "Commercial Refrigeration: Reach-ins, Prep Tables & Walk-ins",
    "excerpt": "How to choose between reach-ins, undercounters, prep tables and walk-ins — sizing by covers and menu, matching temperature zones, controlling energy use, and meeting NSF food-safety requirements.",
    "metaDescription": "A professional buyer's guide to commercial refrigeration: reach-in vs undercounter vs prep-table vs walk-in, sizing by covers, cooler and freezer temperature zones, energy use and NSF requirements.",
    "category": "Buying guide",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Refrigeration is the one system in a commercial kitchen that never gets to rest. It runs through every service, every overnight, every holiday, and it is usually the single largest electrical load in the room. Choosing the wrong format — too little capacity, the wrong temperature zone, or a cabinet placed where it starves for airflow — costs you in spoilage, health-code write-ups and utility bills for the life of the equipment. This guide walks through the four formats you will actually specify, how to size them, and what NSF and food-safety rules require before anything goes on the floor."
      },
      {
        "type": "h2",
        "text": "The four formats and where each belongs"
      },
      {
        "type": "p",
        "html": "<strong>Reach-ins</strong> are the workhorse: one, two or three full-height sections of bulk cold storage, either solid-door for freezers and long holds or glass-door for grab-and-go and front-of-house merchandising. They store the most product per square foot of floor and belong along a back wall away from the cook line. <strong>Undercounter and worktop units</strong> put a shallow cold base directly under a work surface, keeping frequently used product within arm's reach at a station without opening a tall door and dumping cold air. <strong>Prep tables</strong> — sandwich/salad and pizza rails — add a chilled pan well on top of a refrigerated base so line cooks build tickets without walking. <strong>Walk-ins</strong> are the answer once your bulk storage outgrows cabinets: field-assembled insulated rooms, cooler or freezer, sized to the building rather than to a footprint."
      },
      {
        "type": "callout",
        "html": "A useful rule of thumb: reach-ins and undercounters store product, prep tables <em>hold product at the station during service</em>. Rail pans are for a shift's worth of mise en place, not overnight storage — load them from a reach-in each morning and pull them at close."
      },
      {
        "type": "h2",
        "text": "Sizing by covers and menu"
      },
      {
        "type": "p",
        "html": "Start from throughput, not from a catalog. A common planning figure is roughly 4 to 6 cubic feet of refrigerated storage per cover per day for a full-menu restaurant, adjusted heavily by how you buy and how often you receive. A scratch kitchen taking one delivery a week needs far more cold volume than a place receiving fresh product daily. Remember that a cabinet's rated capacity is gross interior volume; usable space after shelving, pan clearance and air circulation runs closer to 60 to 65 percent of the number on the spec sheet, so size up accordingly."
      },
      {
        "type": "ul",
        "items": [
          "Menu mix: heavy protein and produce menus need more fresh cooler volume; frozen-heavy or par-cooked operations shift the balance toward freezer capacity.",
          "Delivery cadence: weekly receiving can double your storage requirement versus daily.",
          "Line stations: give each cook a dedicated undercounter or rail section so nobody crosses the aisle for a common ingredient during a rush.",
          "Growth: specify about 15 to 20 percent more capacity than today's covers so you are not re-buying in year two."
        ]
      },
      {
        "type": "p",
        "html": "The tipping point to a walk-in usually arrives around three reach-in sections of the same temperature zone. At that point a walk-in stores more per dollar and per watt, and it frees floor space. Below that, cabinets are cheaper to buy, install and relocate."
      },
      {
        "type": "h2",
        "text": "Temperature zones: cooler versus freezer"
      },
      {
        "type": "p",
        "html": "Keep the two jobs separate in your head and in your spec. A <strong>cooler</strong> holds fresh product at 33 to 40 degrees Fahrenheit; most operators target the middle of that band, around 36 to 38, to stay clear of the 41-degree line that health codes treat as the top of safe cold holding. A <strong>freezer</strong> holds at 0 degrees or below, with reach-in freezers typically running near minus 10 to hold product solid. Do not ask one cabinet to do both jobs by turning a thermostat down — the evaporator, defrost cycle and door gaskets are engineered for a specific range."
      },
      {
        "type": "p",
        "html": "Match the compressor to the room, too. A cook-line cabinet fights ambient heat, grease and constant door openings, so it needs more refrigeration headroom than the same box in a cool back room. Prep-table pan wells live in the temperature danger zone by design — verify the unit holds product pans at or below 41 degrees at the top of the well, not just in the base, and keep lids down between tickets."
      },
      {
        "type": "h2",
        "text": "Energy use and installation realities"
      },
      {
        "type": "p",
        "html": "Refrigeration runs continuously, so small efficiency differences compound. Prioritize units with ENERGY STAR-qualified compressors, LED interior lighting, and — for walk-ins — thick foamed-in-place polyurethane panels, tight cam-lock seams and self-closing doors with strip curtains. Give every self-contained cabinet the airflow its condenser needs: several inches of clearance at the intake and exhaust, and clean coils on a schedule, or the compressor overheats, short-cycles and dies early. Bottom-mount condensers pull cooler, cleaner air and suit hot kitchens; top-mounts stay cleaner in flour-heavy bakeshops."
      },
      {
        "type": "p",
        "html": "Confirm the electrical before delivery. Many reach-ins run on a standard 115V/20A circuit, but larger three-section boxes, low-temp freezers and remote condensing units often require dedicated or higher-amperage circuits, and walk-in condensing units are commonly 208/230V single- or three-phase. Remote-condenser walk-ins move compressor heat and noise outside but add a refrigeration line set and a licensed install. Browse formats and specs across our <a href=\"/products\">product range</a>, and if you want a layout sized to your covers and receiving schedule, our team can help — <a href=\"/contact\">contact us</a> with your menu and floor plan."
      },
      {
        "type": "h2",
        "text": "NSF and food-safety requirements"
      },
      {
        "type": "p",
        "html": "Health inspectors look for NSF/ANSI certification on commercial refrigeration because it certifies both food-contact materials and cleanability. Practically, that means smooth stainless interiors, coved corners with no crevices for bacteria, removable gaskets, and construction that can be sanitized without dead spots. Every cold-holding unit also needs a visible, accurate thermometer, and your team should log temperatures at least twice a day. Under FDA Food Code cold-holding rules, potentially hazardous food must stay at or below 41 degrees Fahrenheit; product above that line is on a clock, so a cabinet that cannot recover quickly after a busy service is a food-safety liability, not just an inconvenience."
      },
      {
        "type": "p",
        "html": "Spec NSF-listed equipment, size it to real throughput, keep cooler and freezer duties separate, and give each unit the power and airflow it was designed for. Do that and refrigeration becomes the quiet, reliable backbone of the kitchen instead of the thing that fails on your busiest Saturday."
      }
    ],
    "related": [
      {
        "label": "Browse commercial refrigeration and equipment",
        "href": "/products"
      },
      {
        "label": "Talk to our team about a layout",
        "href": "/contact"
      },
      {
        "label": "Shipping and freight",
        "href": "/shipping"
      },
      {
        "label": "Warranty coverage",
        "href": "/warranty"
      }
    ]
  },
  {
    "slug": "commercial-kitchen-ventilation-and-hoods",
    "title": "Commercial Kitchen Ventilation & Hood Sizing",
    "excerpt": "How to specify exhaust hoods for high-BTU wok lines: Type I vs Type II, calculating CFM, makeup air balance, capture and containment, and passing inspection.",
    "metaDescription": "A technical guide to sizing commercial kitchen exhaust hoods for high-BTU wok ranges: Type I vs Type II, CFM calculation, makeup air, capture velocity, fire suppression and code basics.",
    "category": "Compliance",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Ventilation is where most wok-line projects go wrong, and it is the one system you cannot fix cheaply after the slab is poured and the gas is run. A Panda® wok range throws off far more heat and combustion product per linear foot than a standard fry-and-griddle line, and the hood, the makeup air and the fire suppression all have to be sized around that reality from the first drawing. This guide walks through how to specify the exhaust system for a high-BTU Chinese cooking line so it captures grease and heat, satisfies mechanical code, and passes inspection the first time."
      },
      {
        "type": "h2",
        "text": "Type I vs Type II: pick the right hood first"
      },
      {
        "type": "p",
        "html": "The single most important classification is grease. A <strong>Type I hood</strong> is required over any appliance that produces grease-laden vapor or smoke — wok ranges, roasters, fryers, broilers and charbroilers. It carries listed baffle grease filters, a welded grease gutter and cup, and a fire-suppression system. A <strong>Type II hood</strong> handles only heat, steam and moisture with no grease, so it belongs over dishwashers, steamers and some rice-cooking equipment. Any <a href=\"/category/wok-range\">wok range</a> that sears, stir-fries or seasons a wok is unambiguously Type I. Do not let a value-engineering pass downgrade a wok hood to Type II — it will fail plan review and it is a genuine fire hazard."
      },
      {
        "type": "callout",
        "html": "<em>Rule of thumb:</em> if the appliance ever puts oil on a hot surface, it lives under a Type I grease hood with suppression. When in doubt, treat it as Type I."
      },
      {
        "type": "h2",
        "text": "Calculating exhaust CFM"
      },
      {
        "type": "p",
        "html": "Hood airflow is driven by two things: the duty of the equipment below it and the geometry of the hood itself. In practice engineers size the exhaust from the hood's capture length and cooking-duty category rather than from BTU alone, but BTU tells you which duty category you are in. Wok ranges are extra-heavy-duty cooking — the hottest category — so they demand the highest airflow per linear foot of hood, typically several hundred CFM per foot for a wall-canopy configuration and more for a single-island canopy. A short four-foot wok hood can therefore pull well over a thousand CFM, and a full production line can run several thousand."
      },
      {
        "type": "p",
        "html": "A few variables move the number materially. Longer overhang and lower hood mounting height improve capture and let you reduce airflow. Higher menu volume, back-to-back burners and open wok wells push it up. Because a wok flame is intermittent and vertical, capture velocity at the front lip matters more than raw volume, which is why hood length and overhang beyond the appliance face are as important as the fan you spec."
      },
      {
        "type": "ul",
        "items": [
          "Confirm the cooking-duty category — wok ranges are extra-heavy-duty and set the CFM floor.",
          "Size CFM from hood length and configuration (wall canopy vs single/double island), not BTU alone.",
          "Add overhang: extend the hood 6 to 12 inches past each end and beyond the appliance front where possible.",
          "Set mounting height low enough to capture the plume but high enough to clear the tallest wok work."
        ]
      },
      {
        "type": "h2",
        "text": "Makeup air: the half everyone forgets"
      },
      {
        "type": "p",
        "html": "Every cubic foot you exhaust has to be replaced, or the kitchen goes into negative pressure — doors that won't open, pilot lights that snuff out, back-drafting water heaters and cold drafts pulled through the dining room. <strong>Makeup air (MUA)</strong> should replace roughly 80 to 90 percent of exhaust volume, with the building's general HVAC supplying the small remainder so the kitchen stays slightly negative relative to the dining room but not to the outdoors. In cold climates the MUA unit usually needs to be tempered or heated so you are not dumping winter air onto the cooks. Balance this on paper before you order fans; an oversized exhaust with undersized makeup air is the most common cause of a hood that 'smokes' despite pulling plenty of CFM."
      },
      {
        "type": "h2",
        "text": "Capture, containment and fire suppression"
      },
      {
        "type": "p",
        "html": "Capture and containment is the test that matters in the field: the hood must both catch the plume as it rises and hold it inside the reservoir until the filters pull it out. A hood can move enough air on paper and still spill smoke if it is too short, mounted too high, or fighting a cross-draft from an HVAC diffuser or an open door. Keep supply diffusers from blowing across the hood face, and give the hood enough overhang and reservoir depth to hold the plume."
      },
      {
        "type": "p",
        "html": "Fire suppression is mandatory on a Type I wok hood. A wet-chemical system with nozzles aimed at each wok well, the duct collar and the plenum discharges on heat detection, and it must be interlocked to shut off gas to the appliances on activation. Listed baffle filters, a fusible-link damper and clearance for duct cleaning access are all part of the same package. Suppression, hood and gas shutoff are inspected together, so coordinate the mechanical, plumbing and fire trades early."
      },
      {
        "type": "h2",
        "text": "Code, power and inspection basics"
      },
      {
        "type": "p",
        "html": "Hoods are governed primarily by the mechanical code and NFPA 96, layered with local amendments — so the authority having jurisdiction has the final word. Plan review wants a hood schedule with exhaust and makeup CFM, duct routing and clearances, appliance BTU inputs, and the suppression cut sheet. On the electrical side, remember that a modern wok line is rarely all gas: automation, exhaust fans and induction wells may need dedicated circuits and often three-phase service, so verify amperage and phase against your panel before the equipment arrives. Panda-built equipment is NSF, CSA and ETL listed, which streamlines the equipment side of plan review, but the hood system is approved on its own merits."
      },
      {
        "type": "p",
        "html": "If you are laying out a new wok line and want the exhaust sized against real appliance heat loads and connected loads, our team can work from your floor plan and menu volume. <a href=\"/contact\">Contact us</a> with your drawings and we will help you match hood length, CFM and makeup air to the equipment before anything is ordered."
      }
    ],
    "related": [
      {
        "label": "Wok Ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Steamers",
        "href": "/category/steamer"
      },
      {
        "label": "Electric & Induction Cooking",
        "href": "/category/electric"
      },
      {
        "label": "Buyer Guides",
        "href": "/guides"
      }
    ]
  },
  {
    "slug": "gas-vs-induction-vs-electric-cooking",
    "title": "Gas vs. Induction vs. Electric for High-Output Cooking",
    "excerpt": "A practical comparison of gas, induction, and resistive electric for high-volume commercial kitchens — firepower, responsiveness, running cost, hood load, wok work, and what each one demands from your building.",
    "metaDescription": "Compare gas, induction, and electric cooking for commercial kitchens: BTU vs kW firepower, responsiveness, energy cost, ventilation load, wok cooking, and gas-line vs 3-phase install requirements.",
    "category": "Comparison",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Choosing between gas, induction, and resistive electric is not a fashion decision — it is a decision about how much power you can get to the cookline, how fast you can move it, what it costs to run, and what your building can physically supply. For high-output cooking the three technologies behave very differently. This guide compares them on the factors that actually change your kitchen: firepower, responsiveness, running cost, ventilation load, wok work specifically, and install requirements. As a manufacturer that builds and line-tests <a href=\"/category/wok-range\">wok ranges</a> in both gas and electric, we see these trade-offs play out on real cooklines every week."
      },
      {
        "type": "h2",
        "text": "Firepower: BTU vs. kW"
      },
      {
        "type": "p",
        "html": "Gas firepower is rated in BTU/hr; electric and induction in kilowatts (kW). A rough conversion is <strong>1 kW ≈ 3,412 BTU/hr</strong>, but that comparison is misleading because efficiency differs. An open gas burner throws a lot of heat past the pan — much of its rated BTU never enters the food — while induction couples magnetically into the vessel and delivers most of its kW straight to the load. A 15 kW induction hob and a 90,000+ BTU gas burner can put comparable useful heat into a pot even though the raw numbers look far apart. Resistive electric sits in between: efficient at the element, but slower to transfer through a solid plate or into a heavy wok."
      },
      {
        "type": "p",
        "html": "For sustained maximum output — a wall of burners all firing through a dinner rush — high-BTU gas and multi-hob induction both scale well. The practical ceiling on electric and induction is usually not the cooking surface but how many kilowatts your service can deliver, which we cover under install below."
      },
      {
        "type": "h2",
        "text": "Responsiveness"
      },
      {
        "type": "p",
        "html": "Induction is the most responsive: change the setting and the magnetic field changes almost instantly, with no thermal mass in a burner to heat or cool. Gas is close behind — a visible flame responds immediately, which is why line cooks trust it — though a heavy grate and pan still hold heat. Resistive electric is the slowest to react because you are heating and then cooling a solid element or plate. For techniques that demand instant swings between a hard sear and a bare simmer, induction and gas are the honest choices; straight electric asks the cook to work around the lag."
      },
      {
        "type": "h2",
        "text": "Energy efficiency and running cost"
      },
      {
        "type": "p",
        "html": "Induction is the most energy-efficient at the pan, commonly delivering a large majority of its input into the food versus roughly half or less for open gas. But <em>efficient</em> and <em>cheap to run</em> are not the same thing — running cost depends on your local price per therm of gas versus per kWh of electricity, and in many regions gas remains cheaper per unit of delivered heat despite lower efficiency. There is also a hidden operating cost: heat that escapes the pan becomes heat your ventilation and air conditioning must remove, which is where induction quietly pays you back."
      },
      {
        "type": "callout",
        "html": "<strong>Model the full bill, not the burner.</strong> Compare delivered-heat cost <em>plus</em> the HVAC load each option adds to your kitchen — a gas line that looks cheaper per therm can cost more once make-up air and cooling are counted."
      },
      {
        "type": "h2",
        "text": "Ventilation and hood load"
      },
      {
        "type": "p",
        "html": "This is where the gap is widest. Gas combustion produces heat, moisture, and combustion byproducts that must be captured and exhausted, so gas cooklines demand larger Type I hoods, more exhaust CFM, and tempered make-up air. Induction produces no combustion products and radiates far less waste heat into the room, so it often allows a smaller hood — and in some limited configurations, lighter ventilation — cutting both install cost and the ongoing energy spent conditioning the kitchen. Resistive electric also avoids combustion but still radiates significant ambient heat, so its hood savings are real but smaller than induction's. If your building is ventilation-constrained or you are fighting a hot kitchen, this factor alone can decide the question."
      },
      {
        "type": "h2",
        "text": "Wok cooking specifically"
      },
      {
        "type": "p",
        "html": "Wok cooking is the sharpest test. Traditional stir-fry relies on very high, enveloping flame around a round-bottom wok, constant tossing that lifts food out of contact with the surface, and the smoky char known as wok hei. High-BTU gas wok ranges remain the standard because the live flame heats the wok walls, not just the base, and reignites instantly as the cook tosses and lifts. Induction wok stations exist and perform well for volume line cooking — they are cooler to stand over, cleaner, and highly efficient — but they couple only where the wok touches the coil, so the wall-heating and toss-through-flame dynamics differ. If wok hei and traditional technique are central to your menu, gas is still the default; if throughput, a cooler line, and efficiency matter more than flame theater, induction is a serious contender. We build <a href=\"/category/electric\">electric and induction equipment</a> alongside gas for exactly this reason."
      },
      {
        "type": "h2",
        "text": "Install requirements: gas line vs. 3-phase power"
      },
      {
        "type": "p",
        "html": "The two paths make very different demands on your building. Gas needs an adequately sized gas line and regulator, correct pressure, and — critically — you must match the equipment to your fuel: <strong>natural gas and LP (propane) are not interchangeable</strong> without the correct orifices and conversion. Electric and induction need substantial electrical service, and high-output units almost always require <strong>three-phase power</strong>; a bank of induction hobs can pull tens of kilowatts, which may mean a service upgrade, new breakers, and heavier conductors. Whichever you choose, verify NSF, CSA, or ETL listings for your jurisdiction and plan for LTL freight — heavy ranges ship by liftgate and often need in-place assembly. It is far cheaper to confirm gas sizing or panel capacity before you buy than to discover a shortfall on install day."
      },
      {
        "type": "h2",
        "text": "Choose-X-when"
      },
      {
        "type": "ul",
        "items": [
          "Choose gas when your menu depends on live-flame wok cooking and wok hei, when local gas is cheap per therm, and when you already have adequate gas supply and hood capacity — the traditional high-output default.",
          "Choose induction when efficiency, a cooler and cleaner line, reduced ventilation load, and instant responsiveness matter most, and your building can deliver the three-phase power its kilowatt draw requires.",
          "Choose resistive electric when gas is unavailable or restricted and induction is not warranted — for holding, griddling, and steady-load cooking where instant response is less critical and up-front cost is a priority.",
          "Consider a mixed line — gas woks for stir-fry, induction or electric for holding and prep — to get flame where it counts and efficiency everywhere else."
        ]
      },
      {
        "type": "p",
        "html": "There is no single winner; the right answer follows your menu, your utility prices, and what your building can supply. If you want help matching firepower and fuel type to a specific cookline, our team builds to order and can spec gas, electric, or a hybrid line — <a href=\"/contact\">get in touch</a> with your layout and service details."
      }
    ],
    "related": [
      {
        "label": "Wok ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Electric & automation",
        "href": "/category/electric"
      },
      {
        "label": "Ventilation & hood sizing (contact us)",
        "href": "/contact"
      },
      {
        "label": "Financing options",
        "href": "/financing"
      }
    ]
  },
  {
    "slug": "electric-and-automation-in-the-kitchen",
    "title": "Electric & Automation: Robots, Auto-Stir & Induction",
    "excerpt": "Where AI cooking robots, auto stir-fry machines, and induction genuinely fit in a professional kitchen — labor and consistency, throughput, three-phase power requirements, and why automation complements a wok line rather than replacing it.",
    "metaDescription": "A practical buyer's guide to kitchen automation and induction: what auto stir-fry machines and AI cooking robots actually solve, throughput math, 3-phase power and ventilation requirements, and how to sequence the investment.",
    "category": "Comparison",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Kitchen automation is having a moment, and the pitch is seductive: a machine that stir-fries the same dish the same way at 2 p.m. and again at the Friday rush, with no line cook required. The reality is more useful and more limited than the marketing suggests. Automation and induction are excellent at specific jobs — repeatable throughput, holding, and de-skilling a few high-volume SKUs — but they slot into a wok line, they don't replace it. This guide lays out where each technology earns its place, what it demands from your electrical service, and how to decide what to automate first."
      },
      {
        "type": "h2",
        "text": "What automation actually solves"
      },
      {
        "type": "p",
        "html": "The honest value of an <a href=\"/category/electric\">electric or automated station</a> is labor and consistency, not magic. An auto stir-fry machine performs a fixed motion — tumbling, timed oil and sauce injection, controlled heat — so a lower-skilled operator can produce a plate that used to require a seasoned wok cook. That matters most when you are short-staffed, running multiple locations that need identical output, or building a menu around a handful of high-velocity dishes. Where it struggles is nuance: dishes that depend on a cook reading the pan, adjusting on the fly, or working ingredients that vary batch to batch. Automation rewards standardization and punishes improvisation."
      },
      {
        "type": "h2",
        "text": "Throughput: batch cadence, not raw speed"
      },
      {
        "type": "p",
        "html": "Judge an automated stir-fry unit by cycle time and parallelism, not by any single-plate speed claim. A machine that turns a portion in three minutes and needs 30 seconds to reload gives you roughly 17 covers an hour per drum. One skilled cook on a two-burner range can sometimes beat that in a burst — but not for four hours straight, and not identically. The automation advantage is a <em>flat</em> output curve: the 400th plate looks like the first. If your bottleneck is a lunch spike on three or four signature dishes, two or three automated drums running in parallel often clear the rush more reliably than adding another line cook. If your bottleneck is menu breadth, automation won't help."
      },
      {
        "type": "h2",
        "text": "Induction: precise, cool, and power-hungry"
      },
      {
        "type": "p",
        "html": "Induction sits between gas and full automation. It heats the pan directly through a magnetic field, so response is near-instant and the surrounding air stays far cooler than an open flame — a real gain for the comfort of the line and for the load on your exhaust. It is also the most controllable heat you can buy for holding, simmering, and sauce work. The trade-offs are that induction requires magnetic (ferrous) cookware and delivers a different heat character than a screaming gas wok, so the seared, smoky <em>wok hei</em> that flame gives you is hard to reproduce. Treat induction as the precision and holding layer of the station, with gas or high-output automation handling the aggressive searing."
      },
      {
        "type": "h2",
        "text": "Power and 3-phase: plan the panel before the equipment"
      },
      {
        "type": "p",
        "html": "This is where most automation projects stall. Serious electric and automated cooking equipment draws real current, and the larger units are three-phase — typically 208V or 240V three-phase — precisely because single-phase service can't deliver the amperage cleanly. Before you commit to a machine, confirm three things with your electrician: available phase and voltage at the panel, spare breaker capacity, and the conductor run to the equipment location. A single high-output induction wok or automated drum can pull enough amps that two or three units will exceed a typical single-phase subpanel."
      },
      {
        "type": "ul",
        "items": [
          "Confirm whether your building has three-phase service at all — many older spaces do not, and bringing it in from the street is a utility project, not an afternoon.",
          "Size each circuit to the equipment's full-load amperage with the required derating headroom, not to its running average.",
          "Automation reduces flame but not heat rejection — plate warmers, drums, and induction coils still shed heat into the space, so keep your HVAC and makeup-air plan in the conversation.",
          "Budget for dedicated circuits per unit; daisy-chaining high-draw cooking equipment is how you trip breakers mid-service."
        ]
      },
      {
        "type": "callout",
        "html": "Rule of thumb: settle your electrical service and ventilation <strong>before</strong> you choose specific machines. Retrofitting three-phase power around equipment you already bought is the most expensive way to do this."
      },
      {
        "type": "h2",
        "text": "Ventilation still applies"
      },
      {
        "type": "p",
        "html": "Automated and induction cooking produces less open flame, but stir-frying at volume still throws grease-laden vapor and steam that a hood has to capture. Size exhaust CFM to the cooking surface and duty, and make sure tempered makeup air replaces what you pull — otherwise the automated line will fight negative pressure just like a gas line does. The exhaust math doesn't get a discount because the heat source changed."
      },
      {
        "type": "h2",
        "text": "How to sequence the investment"
      },
      {
        "type": "p",
        "html": "Start by automating your highest-volume, most standardized dishes and keep the wok range for everything that needs a cook's judgment. A common, sane layout pairs one or two automated stir-fry drums for the volume SKUs, an induction station for sauces and holding, and a traditional gas wok line for the à la carte and specialty work. That hybrid captures the labor and consistency wins without surrendering the range and flexibility that make the menu yours. Because power, phase, and ventilation vary so much site to site, the right configuration is a conversation about your specific space and menu — <a href=\"/contact\">talk to us</a> with your panel details and top dishes before you spec a single unit."
      }
    ],
    "related": [
      {
        "label": "Electric & automation equipment",
        "href": "/category/electric"
      },
      {
        "label": "Wok ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Talk to our team",
        "href": "/contact"
      },
      {
        "label": "Financing options",
        "href": "/financing"
      }
    ]
  },
  {
    "slug": "nsf-csa-etl-certifications-explained",
    "title": "NSF, CSA & ETL: Commercial Kitchen Certifications Explained",
    "excerpt": "What the NSF, CSA and ETL marks on commercial kitchen equipment actually mean, why inspectors and insurers demand them, and how to verify a listing before you buy.",
    "metaDescription": "A plain-English guide to NSF, CSA and ETL certifications on commercial cooking equipment: sanitation vs. electrical and gas safety, why they're required, and how to verify a listing.",
    "category": "Compliance",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "Before a wok range, steamer or convection unit goes into a working kitchen, three sets of initials tend to decide whether it can legally operate there: <strong>NSF</strong>, <strong>CSA</strong> and <strong>ETL</strong>. They appear on spec sheets and rating plates, they get checked during plan review and health inspections, and they show up again when your insurer underwrites the policy. Each mark answers a different question, and confusing them is a common reason equipment fails inspection after it is already installed. This guide explains what each one certifies, why it is required, and how to confirm a listing is real rather than assumed."
      },
      {
        "type": "h2",
        "text": "NSF: sanitation and food safety"
      },
      {
        "type": "p",
        "html": "NSF certification addresses <strong>sanitation</strong> — whether equipment can be kept clean and will not contaminate food. NSF/ANSI Standard 4 covers commercial cooking, rethermalization and hot-holding equipment, and it governs the physical design: smooth welds, coved interior corners, non-toxic and corrosion-resistant materials, sealed seams, and the absence of crevices where grease, moisture or bacteria collect. It is a construction and materials standard, not an electrical one. A range can be perfectly safe electrically and still fail NSF because a seam traps debris or a surface cannot be wiped down."
      },
      {
        "type": "p",
        "html": "This is the mark local <em>health departments</em> care about most. Many jurisdictions will not approve foodservice equipment for a permitted kitchen unless it carries NSF certification or an accepted equivalent, and plan reviewers frequently reject substitutions that lack it. Because Panda equipment is fabricated from heavy-gauge stainless with sealed, cleanable construction, the sanitation listing follows from how the pieces are actually built and line-tested."
      },
      {
        "type": "h2",
        "text": "CSA and ETL: electrical and gas safety"
      },
      {
        "type": "p",
        "html": "CSA and ETL address a different hazard entirely — <strong>electrical and gas safety</strong>. Both are Nationally Recognized Testing Laboratories (NRTLs) recognized by OSHA, and both test to the same published UL and ANSI standards that underlie the familiar UL mark. For a gas wok range or roaster that means testing for safe combustion, gas-train integrity, flame supervision and surface temperatures; for electric ranges, steamers and automation it means testing insulation, grounding, wiring and fault behavior at the rated load."
      },
      {
        "type": "p",
        "html": "CSA (originally the Canadian Standards Association) and ETL (issued by Intertek) are peers to UL — a product bearing any of the three has been evaluated to the equivalent safety standard. So an ETL-listed unit is not a lesser product than a UL-listed one; the difference is which accredited lab performed the testing, not the rigor of the standard. Electrical inspectors and the authority having jurisdiction (AHJ) look for one of these marks before they will energize equipment."
      },
      {
        "type": "callout",
        "html": "<strong>Rule of thumb:</strong> NSF answers <em>can this be kept clean?</em> CSA and ETL answer <em>is this electrically and mechanically safe to operate?</em> A commercial kitchen typically needs both kinds of listing, not one or the other."
      },
      {
        "type": "h2",
        "text": "Why inspectors and insurers require them"
      },
      {
        "type": "p",
        "html": "These listings are not marketing badges — they are how a code official, without disassembling your equipment, can trust that it meets a recognized standard. Health inspectors rely on NSF to sign off on sanitation. Electrical and building inspectors rely on CSA or ETL to confirm the unit meets the National Electrical Code and applicable gas codes before granting a certificate of occupancy or an operating permit."
      },
      {
        "type": "p",
        "html": "Insurance is the quieter reason. Property and liability carriers commonly require that commercial cooking equipment be listed by an NRTL, and an uncertified appliance can become the basis for a denied claim after a fire or injury — even if that appliance was not the cause. For a buyer, an uncertified deal is rarely a bargain once permitting delays and coverage exposure are counted."
      },
      {
        "type": "h2",
        "text": "\"Listed\" vs. \"certified\" — and how to verify"
      },
      {
        "type": "p",
        "html": "The words are used loosely, so read them carefully. <strong>Listed</strong> or <strong>certified</strong> means a specific product has been tested and appears in the mark holder's directory, and it is subject to periodic follow-up factory inspections. Phrases like <em>\"designed to NSF standards,\"</em> <em>\"tested to UL,\"</em> or <em>\"CSA-compliant components\"</em> mean the opposite of what a buyer hopes: the finished product has not been certified. Only a mark tied to a real listing counts for inspection."
      },
      {
        "type": "ul",
        "items": [
          "Look for the mark on the rating plate or nameplate, not just the sales sheet — the plate should show the certifying body and, for electric units, the voltage, phase and kW rating.",
          "Note the exact model number, then search the certifying body's public directory (NSF, CSA Group or Intertek's Directory of Listed Products) to confirm that model is listed.",
          "Distinguish the listing type: whole-appliance certification is what inspectors want, not a component-only listing that covers only an internal part.",
          "Confirm the fuel and utility match your site — natural gas vs. LP, and single- vs. three-phase power — since a listing is specific to the configuration tested."
        ]
      },
      {
        "type": "p",
        "html": "When you request documentation, ask for the listing under the exact model and configuration you are buying. Reputable manufacturers will provide it without hesitation. You can review the full range of listed Panda equipment on our <a href=\"/products\">products</a> pages, and read more about how we design, weld and line-test in our own New York factory on the <a href=\"/about\">about</a> page — in-house fabrication is what makes a whole-appliance listing possible rather than a claim about parts."
      },
      {
        "type": "h2",
        "text": "The short version"
      },
      {
        "type": "p",
        "html": "Treat NSF as your sanitation clearance and CSA or ETL as your electrical and gas clearance; most kitchens need both. Insist on a real listing rather than language that only gestures at a standard, verify the exact model in the certifying body's directory, and match the listing to your actual gas type and electrical service. Do that before the equipment ships, and inspection day becomes a formality instead of a surprise."
      }
    ],
    "related": [
      {
        "label": "All Panda equipment",
        "href": "/products"
      },
      {
        "label": "About our New York factory",
        "href": "/about"
      },
      {
        "label": "Warranty coverage",
        "href": "/warranty"
      },
      {
        "label": "Shipping & freight",
        "href": "/shipping"
      }
    ]
  },
  {
    "slug": "wok-range-maintenance-and-care",
    "title": "Wok Range Care: Cleaning, Seasoning & Service",
    "excerpt": "A practical maintenance routine for commercial wok ranges: daily deck and trough cleaning, seasoning carbon-steel woks, burner and pilot upkeep, when to replace a chamber ring, and how warranty and field service fit in.",
    "metaDescription": "How to maintain a commercial wok range: daily and weekly cleaning of the deck and trough, seasoning carbon-steel woks, burner and pilot care, replacing a chamber ring, and warranty and field service.",
    "category": "Maintenance",
    "readMins": 7,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "A commercial wok range works harder and hotter than almost anything else in the kitchen, and it rewards a maintenance routine built around that heat. Carbonized oil, spilled stock, and grease-laden vapor attack the deck, the burners, and the chamber every service. Left alone, they clog burner ports, dull the flame, and warp steel. Handled with a simple daily and weekly rhythm, the same range holds its firepower and stays NSF-compliant for well over a decade. This guide covers the routine that actually matters: cleaning the deck and trough, seasoning your carbon-steel woks, keeping burners and pilots healthy, knowing when a chamber ring is finished, and how the <a href=\"/warranty\">warranty</a> and field service back you up."
      },
      {
        "type": "h2",
        "text": "Daily: deck, trough, and shutdown"
      },
      {
        "type": "p",
        "html": "Clean the range while it is still warm but off, not screaming hot and not stone cold. Warm grease wipes away; cold grease sets like varnish. If your range has a waterfall faucet, sheet water across the deck to flush oil and food debris into the trough, then scrape the deck with a wok-range scraper or a stiff nylon brush. Never pour cold water onto a fully fired deck or into a hot chamber; the thermal shock can crack cast iron and warp steel."
      },
      {
        "type": "p",
        "html": "The trough is where daily neglect shows up fastest. Pull the trough tray or clear the drain channel every night, empty it, and wash it, standing water plus grease becomes a grease clog and, eventually, a pest and odor problem. Wipe the back-guard and the faucet, and finish by drying any bare steel so it does not flash-rust overnight. Turn the gas off at the range and confirm every pilot behaves before you leave."
      },
      {
        "type": "callout",
        "html": "<strong>The one rule that saves ranges:</strong> clean warm, never shock hot cast iron with cold water. Most cracked chambers and warped decks trace back to a bucket of cold water hitting a fired range."
      },
      {
        "type": "h2",
        "text": "Weekly: deep-clean the deck and burner area"
      },
      {
        "type": "p",
        "html": "Once a week, go past the surface. With the gas off and the range cool, lift out the wok rings or grates and degrease them in a soak sink. Scrub the deck around each chamber where baked-on carbon builds a hard ridge, this ridge traps grease and slowly chokes airflow to the flame. Clear the chamber of any fallen food and check the drain holes at the bottom of each chamber are open so water and oil actually escape instead of pooling on the burner."
      },
      {
        "type": "ul",
        "items": [
          "Remove and degrease wok rings, grates, and the trough tray in a soak sink.",
          "Scrape carbon ridges off the deck around each chamber.",
          "Vacuum or brush crumbs and carbon out of the chamber and off the burner.",
          "Confirm chamber drain holes are clear so liquid never sits on the burner.",
          "Wipe the pilot and igniter area clean of grease film.",
          "Dry all bare steel and re-oil lightly to prevent rust."
        ]
      },
      {
        "type": "h2",
        "text": "Seasoning carbon-steel woks"
      },
      {
        "type": "p",
        "html": "A carbon-steel wok is not stainless, it needs a seasoned patina to be non-stick and rust-free, and that patina is a working part of your equipment, not a cosmetic finish. A new wok ships with a protective coating that must be scrubbed off first: fill it with hot water and a little detergent, scour it back to bare metal, and dry it fully. From then on, treat seasoning as maintenance, not a one-time event."
      },
      {
        "type": "p",
        "html": "To season, dry the bare wok over the burner until it just changes color, wipe a very thin film of a high-smoke-point oil across the whole interior with a folded towel, and heat until it smokes off and darkens. Repeat two or three thin coats. The mistake to avoid is too much oil, thick coats go sticky and gummy instead of hard and slick. During service, deglaze with water or stock rather than soap, dry the wok back over the flame after washing, and wipe a trace of oil in before it goes on the rack. If a wok rusts or the patina strips, simply re-season, it is a renewable surface, and a well-kept carbon-steel wok outlasts many cheaper alternatives."
      },
      {
        "type": "h2",
        "text": "Burner and pilot upkeep"
      },
      {
        "type": "p",
        "html": "Flame quality is the clearest signal of burner health. A healthy wok burner burns with a strong, mostly blue flame and a steady roar. If the flame goes lazy, yellow, or uneven, or if you see soot building on the wok bottom, the ports are partially blocked or the air shutter is out of adjustment. Let the burner cool, then clear each port with a stiff brush or a soft wire and blow out the loosened carbon, working grease into a port with a hard tool instead can lodge it deeper. Keep the burner venturi and air shutter free of grease so the burner pulls the right air-to-gas mix."
      },
      {
        "type": "p",
        "html": "Pilots and igniters need the same attention. A pilot that keeps blowing out or lights slowly is usually fouled with grease film or slightly out of position, wipe it clean weekly and confirm it sits in the flame path. If a standing pilot will not stay lit after cleaning, suspect the thermocouple. Adjustments to gas pressure, orifices, and burner components should be done by a qualified technician, never enlarge a port or change an orifice yourself, since it changes the burner's rated output and can make it unsafe."
      },
      {
        "type": "h2",
        "text": "When to replace a chamber ring"
      },
      {
        "type": "p",
        "html": "The chamber ring takes the direct thermal punishment of the flame and is designed as a wear part on many ranges. A ductile-iron ring holds up to years of heat cycling, but nothing lasts forever. Replace the ring when you see a crack through the casting, a section burned or corroded thin, or the ring no longer seats flat so the wok rocks or the flame pattern distorts. A failing chamber ring shows up as slower recovery and an uneven flame long before it fails outright, if the station has lost its snap and the burner checks out clean, the ring is the usual culprit. Replacing a ring is a straightforward field swap on a range built for it, and far cheaper than rebuilding a deck that has been allowed to burn through."
      },
      {
        "type": "h2",
        "text": "Warranty and field service"
      },
      {
        "type": "p",
        "html": "Panda-built equipment carries a one-year parts-and-labor warranty, and honest daily care is what keeps that coverage meaningful, damage from thermal shock, grease neglect, or unauthorized burner modifications is wear-and-abuse, not a warranty fault. Keep a simple cleaning log and hold onto your invoice so any claim is easy to process. For NY-metro accounts, Panda offers installation and field service, so a technician can handle pilot, burner, orifice, and chamber-ring work rather than leaving it to the line. Review the terms on the <a href=\"/warranty\">warranty</a> page, and when something is off with the flame, the pilot, or the chamber, call it in early through <a href=\"/contact\">contact</a>, a fifteen-minute service visit on a fouled burner is cheaper than a rebuild after it has run wrong for a month. For the current lineup and replaceable wear parts, see the <a href=\"/category/wok-range\">wok range category</a>."
      }
    ],
    "related": [
      {
        "label": "Panda wok ranges",
        "href": "/category/wok-range"
      },
      {
        "label": "Warranty coverage",
        "href": "/warranty"
      },
      {
        "label": "Contact & field service",
        "href": "/contact"
      },
      {
        "label": "Choosing a commercial wok range",
        "href": "/guides"
      }
    ]
  },
  {
    "slug": "freight-delivery-and-installation",
    "title": "Freight, Delivery & Installing Heavy Kitchen Equipment",
    "excerpt": "What actually happens between the click and the working line: how palletized LTL freight moves, which delivery level to book, how to inspect for damage before you sign, realistic lead times, and what gas and electrical hookup involves.",
    "metaDescription": "A practical guide to receiving and installing commercial kitchen equipment: LTL palletized freight, liftgate vs dock delivery, freight-damage inspection, lead times, gas and electrical hookup, and NY-metro field service.",
    "category": "Logistics",
    "readMins": 6,
    "updated": "2026-07-16",
    "body": [
      {
        "type": "p",
        "html": "A wok range or roaster is not a parcel. A single Panda® range can weigh several hundred pounds, ship bolted to a wood pallet, and travel by less-than-truckload (LTL) carrier — a freight network built for pallets, not doorsteps. The equipment itself is usually the easy part. What trips up buyers is the last hundred feet: getting a heavy machine off a truck, into the building, inspected, and hooked up to gas and power without a costly surprise. This guide walks through how that process actually works so you can plan the receiving day before you place the order."
      },
      {
        "type": "h2",
        "text": "How LTL palletized freight moves"
      },
      {
        "type": "p",
        "html": "Heavy equipment ships on a pallet and moves through an LTL carrier's hub-and-spoke network, changing trucks once or twice on the way to you. That routing is why freight transit runs a few business days rather than overnight, and why the carrier — not the seller — calls to schedule your delivery appointment. When we ship, in-stock items leave our New York factory in 24 to 48 hours; the clock you actually feel is the carrier's transit time on top of that. You can review the current terms, including free freight over $999 and the flat $89 charge under that threshold, on our <a href=\"/shipping\">shipping page</a>."
      },
      {
        "type": "p",
        "html": "The single most useful thing you can do up front is tell us your delivery environment honestly: a commercial dock, a storefront with a curb, or a tight residential-style street. That determines the delivery level below, and getting it wrong is the most common cause of a failed or re-billed delivery."
      },
      {
        "type": "h2",
        "text": "Liftgate, dock, or threshold — pick the right delivery level"
      },
      {
        "type": "p",
        "html": "LTL delivery is sold in levels, and the difference matters when the pallet weighs as much as the crew unloading it:"
      },
      {
        "type": "ul",
        "items": [
          "Dock delivery — the trailer backs to a loading dock at the same height as the truck bed and the pallet rolls straight off. Fastest and cheapest, but only an option if you actually have a dock.",
          "Liftgate delivery — the truck carries a hydraulic platform that lowers the pallet to street level. This is what most restaurants without a dock need. Say so at order time, because a standard trailer has no liftgate and the driver will not be able to unload a 400 lb crate by hand.",
          "Threshold delivery — the carrier moves the pallet just inside your door or garage, no farther. Beyond the threshold, positioning the machine on the line is on you or your installer.",
          "Inside / white-glove delivery — the crew brings it to the point of use and may remove debris. It costs more and is worth it for stairs, elevators, or a long interior path."
        ]
      },
      {
        "type": "callout",
        "html": "<strong>Book liftgate if you are unsure.</strong> A re-delivery or a driver refusal because there was no way to get the pallet down costs far more than the liftgate fee you would have paid up front."
      },
      {
        "type": "h2",
        "text": "Inspect before you sign — this is your one window"
      },
      {
        "type": "p",
        "html": "Once you sign the carrier's delivery receipt clean, you are telling the freight company the shipment arrived undamaged, and a later claim becomes very hard to win. So inspect while the driver is still there. Walk the crate before signing: look for crushed corners, forklift punctures, a shifted or tilted machine, and torn or re-taped shrink wrap. If you can, uncrate and check the equipment body, controls, and gas manifold for dents or bent components."
      },
      {
        "type": "p",
        "html": "If anything looks wrong, <em>note it on the delivery receipt before you sign</em> — write \"crate damaged, possible concealed damage\" or describe what you see. Photograph the packaging and the machine from several angles. You can accept the shipment with damage noted; you do not have to refuse it. Then contact us right away so we can help work the freight claim. Damage that is discovered after a clean signature is called concealed damage and is genuinely difficult to recover, which is exactly why the two minutes of inspection matter."
      },
      {
        "type": "h2",
        "text": "Lead times: in-stock versus built-to-order"
      },
      {
        "type": "p",
        "html": "Plan your opening or remodel around two very different timelines. In-stock equipment ships from our factory in 24 to 48 hours, then adds carrier transit. Custom wok ranges and configured equipment are built and line-tested to order in our 60,000 sq ft New York plant, so they carry a production lead time before anything ships — ask for the current build window when you spec the job, not after. If a fixed opening date is driving the project, tell us early; a custom range designed and welded to your dimensions is worth the wait, but only if the schedule accounts for it. You can start a configuration from the <a href=\"/category/wok-range\">wok range category</a>."
      },
      {
        "type": "h2",
        "text": "Gas and electrical hookup"
      },
      {
        "type": "p",
        "html": "Freight ends at the pallet; a working line needs a licensed hookup. Two details decide whether install day goes smoothly. First, fuel type: gas equipment is built for either natural gas or liquid propane (LP), and the two are not interchangeable without the correct orifice and conversion — confirm your building's fuel before ordering so the range arrives configured for what you have. Second, on electric and automation equipment, verify voltage, phase (single vs three-phase), and the amperage your panel can supply against the machine's kW draw; a high-output electric unit can require a dedicated circuit your existing panel may not have."
      },
      {
        "type": "p",
        "html": "Gas connection, and often the electrical tie-in, should be done by a licensed plumber or electrician who will also handle any required permit and inspection. Our equipment is NSF, CSA and ETL listed, which your local inspector will look for. If you are weighing electric or automated cooking lines, the <a href=\"/category/electric\">electric and automation category</a> lays out the options."
      },
      {
        "type": "h2",
        "text": "NY-metro installation and field service"
      },
      {
        "type": "p",
        "html": "In the New York metro area we offer installation and field service directly, so uncrating, positioning, hookup coordination, and startup can be handled as one job rather than a scramble of separate trades. It is the lowest-risk path for a custom range or a full line, especially where stairs, elevators, or tight kitchens are involved. See our service coverage on the <a href=\"/locations\">locations page</a>, and reach the team through <a href=\"/contact\">contact</a> to confirm scheduling and what your site needs before the truck rolls."
      }
    ],
    "related": [
      {
        "label": "Shipping & freight terms",
        "href": "/shipping"
      },
      {
        "label": "Service locations & coverage",
        "href": "/locations"
      },
      {
        "label": "Returns policy",
        "href": "/returns"
      },
      {
        "label": "Custom wok ranges",
        "href": "/category/wok-range"
      }
    ]
  }
];

export const getGuide = (slug: string): Guide | undefined => GUIDES.find((g) => g.slug === slug);

