import { useState, useEffect, useCallback } from "react";

// ── DATA ────────────────────────────────────────────────────────────────────

const PRAYERS = {
  signOfCross: {
    name: "Sign of the Cross",
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  apostlesCreed: {
    name: "Apostles' Creed",
    text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  },
  ourFather: {
    name: "Our Father",
    text: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  hailMary: {
    name: "Hail Mary",
    text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  gloryBe: {
    name: "Glory Be",
    text: "Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  fatimaPrayer: {
    name: "Fatima Prayer",
    text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those who have most need of Thy mercy. Amen.",
  },
  hailHolyQueen: {
    name: "Hail Holy Queen",
    text: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
  },
  finalPrayer: {
    name: "Final Prayer",
    text: "Let us Pray:\n\nO God, whose only begotten Son, by His life, death and resurrection has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating on these mysteries of the most holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise. Through the same Christ our Lord. Amen.\n\nQueen of the most holy Rosary, pray for us.\n\nO Mary, conceived without sin, pray for us who have recourse to thee.\n\nSaint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him we humbly pray. And do thou, O Prince of the heavenly Host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
  },
};

// ── MYSTERY CONTENT ──────────────────────────────────────────────────────────
// Short and long versions of each mystery's reflection and prayer intention.
// Edit these over time to grow the content.

const MYSTERY_CONTENT = {
  Sorrowful: {
    days: "Tuesday & Friday",
    mysteries: [
      {
        fruit: "Contrition, Conformity to God's Will",
        short: "Lord, help me trust You in suffering and surrender fully to Your will.",
        long: "Jesus, both fully human and fully divine, suffered deeply in the garden. Knowing what was to come, He experienced fear and anguish, even pleading with the Father to let this cup pass from Him. Yet, in perfect obedience, He surrendered completely to the Father's will. We are called to that same trust—uniting our struggles to God's plan and seeking the grace to say, \"Not my will, but Yours be done.\"",
      },
      {
        fruit: "Purity, Mortification",
        short: "Jesus, give me the grace to embrace small sacrifices and grow in purity.",
        long: "Though often misunderstood today, mortification calls us to willingly embrace small sacrifices for love of God. In a world that prioritizes comfort, we are invited to offer up daily inconveniences and sufferings. These small acts of self-denial help purify our hearts and draw us closer to Christ, who endured great suffering for our sake.",
      },
      {
        fruit: "Moral Courage",
        short: "Grant me courage to stand firm in truth, seeking Your approval above all.",
        long: "Even as He was mocked and humiliated, Jesus remained steadfast. He did not waver in truth or dignity. This mystery invites us to examine our own courage: Do we stand firm in our faith when faced with ridicule or pressure? Ultimately, whose approval do we seek—the world's, or God's?",
      },
      {
        fruit: "Patience",
        short: "Strengthen me to carry my crosses with patience and trust in You.",
        long: "Jesus bore His cross with quiet endurance as He walked the road to Calvary. His suffering was not rushed or resisted but embraced with love. In our own lives, we are often tempted to frustration and impatience. This mystery calls us to look to Christ for strength, learning to carry our crosses with perseverance and trust.",
      },
      {
        fruit: "Salvation, Self-Denial",
        short: "Jesus, thank You for Your sacrifice. Teach me to love selflessly and put others first.",
        long: "On the cross, Jesus gave everything—offering Himself completely for our salvation. He bore the weight of sin across all time, redeeming the world through His sacrifice. In response to this immense gift, we are called to gratitude and to imitate His self-giving love. When we are asked to put others before ourselves, we can look to the cross as the ultimate model of sacrificial love.",
      },
    ],
  },
  Joyful: {
    days: "Monday & Saturday",
    mysteries: [
      {
        fruit: "Humility",
        short: "Lord, teach me humility. Help me trust in You and receive Your will with a faithful \"yes.\"",
        long: "The mystery of the Incarnation begins with humility—Mary's humble \"yes\" to God's will. True prayer, the Church teaches, is rooted in this spirit: recognizing our dependence on God and our need for His grace. As the Catechism reminds us, \"Man is a beggar before God\" (CCC 2559). May we learn to approach the Lord with that same humility, open to receiving whatever He desires to give.",
      },
      {
        fruit: "Love of Neighbor",
        short: "Mary, inspire me to serve others with love. Show me where I am called to give of myself today.",
        long: "Moved by love, Mary hastens to assist Elizabeth in her time of need. Her actions reflect a heart attentive to others, ready to serve without hesitation. This mystery calls us to examine our own lives: where are we being invited to show charity and presence? May we recognize Christ in those around us and respond generously in love.",
      },
      {
        fruit: "Poverty of Spirit, Detachment",
        short: "Jesus, born in simplicity, free my heart from attachment and teach me to live with what truly matters.",
        long: "In the simplicity of Bethlehem, the Son of God enters the world in poverty and humility. This mystery challenges our attachment to material things and invites us to embrace a spirit of simplicity. What we truly need is not found in abundance, but in God alone. May we learn to let go of excess and share generously with others.",
      },
      {
        fruit: "Obedience",
        short: "Lord, help me surrender my will to Yours, trusting in Your plan above all.",
        long: "In faithful obedience to the law, Mary and Joseph present Jesus in the temple, offering Him back to God. Their example reminds us that obedience is an act of trust—not merely duty, but a surrender of our will to the Father's loving plan. In our own lives, may we echo Christ's words: \"Not my will, but Yours be done.\"",
      },
      {
        fruit: "Piety",
        short: "Jesus, draw me closer to You in prayer and the sacraments. Keep my heart centered on You.",
        long: "After searching in sorrow, Mary and Joseph find Jesus in the temple, immersed in His Father's house. This mystery invites us into a deeper devotion to God—through prayer, the sacraments, and the life of the Church. May we seek Him earnestly, and remain close to Him in all things, placing God at the center of our lives.",
      },
    ],
  },
  Glorious: {
    days: "Wednesday & Sunday",
    mysteries: [
      {
        fruit: "Faith",
        short: "Lord, increase my faith in Your victory over death. Help me believe, even when I cannot see: \"I believe—help my unbelief.\"",
        long: "Christ's Resurrection is the foundation of our faith—the triumph of life over death, hope over despair. Though we did not witness it ourselves, we are called to believe in the risen Lord and the promise that we, too, shall rise with Him. In moments of doubt, we echo the prayer of the Gospel: \"Lord, I believe; help my unbelief.\" May this mystery strengthen our trust in God's power and His promises.",
      },
      {
        fruit: "Hope, Desire for Heaven",
        short: "Jesus, lift my heart to heaven. Let my hope in eternal life shape how I live each day on earth.",
        long: "As Jesus ascended into heaven, He opened the way for us to follow. His departure is not a loss but an invitation—to lift our hearts beyond this world and fix our eyes on eternal life. May our hope in heaven shape our choices, detach us from what is passing, and draw us toward what is everlasting.",
      },
      {
        fruit: "Wisdom, Love of God",
        short: "Holy Spirit, fill me with Your wisdom and courage. Help me love God fully and live boldly in Your truth.",
        long: "The apostles, once fearful and uncertain, were transformed by the coming of the Holy Spirit. Filled with divine wisdom and courage, they went forth to proclaim the Gospel without hesitation. That same Spirit has been given to us. May we open our hearts to His presence, allowing Him to guide us, strengthen us, and inflame within us a deep and abiding love of God.",
      },
      {
        fruit: "Devotion to Mary",
        short: "Blessed Mother, draw me closer to your Son. Teach me humility and faithful devotion, as one lifted by God's grace.",
        long: "In her Assumption, Mary is taken body and soul into heavenly glory—a sign of the destiny prepared for those who are faithful to God. Honored above all creatures, she remains a loving mother who leads us ever closer to her Son. May our devotion to Mary deepen our humility, our trust, and our desire to follow Christ more faithfully.",
      },
      {
        fruit: "Eternal Happiness",
        short: "Queen of Heaven, pray for me. Lead me to share one day in the joy of eternal life with your Son.",
        long: "Crowned as Queen of Heaven, Mary now shares fully in the glory of her Son. Her joy is complete, and her reign is one of love and intercession for all her children. This mystery reminds us of the eternal happiness for which we were created. May we persevere in faith, so that one day we may join her in the fullness of life with God.",
      },
    ],
  },
  Luminous: {
    days: "Thursday",
    mysteries: [
      {
        fruit: "Openness to the Holy Spirit",
        short: "Holy Spirit, fill my heart. Help me be open to Your guidance and grow in Your gifts.",
        long: "At His baptism in the Jordan, Jesus reveals His identity as the beloved Son, and the Holy Spirit descends upon Him. Through our own Baptism—and strengthened in Confirmation—we receive that same Spirit. The gifts of the Holy Spirit are freely offered to guide and sustain us. May we remain open and receptive, trusting that when we ask for His help, He will lead us in truth and grace.",
      },
      {
        fruit: "To Jesus through Mary",
        short: "Mary, lead me to your Son. Help me trust and \"do whatever He tells me.\"",
        long: "At Cana, Mary gently intercedes, directing the servants—and us—to her Son: \"Do whatever He tells you.\" Through her quiet trust, Christ performs His first public miracle. Mary continues to guide us in the same way, always leading us closer to Jesus. May we turn to her with confidence, trusting in her intercession and her care.",
      },
      {
        fruit: "Repentance, Trust in God",
        short: "Jesus, call me to conversion. Give me the grace to turn from sin and trust in You.",
        long: "Jesus proclaims the coming of God's Kingdom, calling all to repentance and faith. His words and works invite us to turn away from sin and to place our trust more fully in God. This mystery challenges us to continual conversion—seeking mercy, embracing truth, and living according to the Gospel.",
      },
      {
        fruit: "Desire for Holiness",
        short: "Lord, reveal Your glory to me. Strengthen my desire to grow in holiness and seek heaven above all.",
        long: "On Mount Tabor, Jesus reveals His divine glory to His closest disciples, offering a glimpse of the life to come. This moment strengthens them for the trials ahead and reminds us of our own call to holiness. May we desire heaven above all else, striving to be transformed by God's grace and conformed to Christ.",
      },
      {
        fruit: "Eucharistic Devotion, Participation at Mass",
        short: "Jesus, present in the Eucharist, deepen my love for You. Draw me into full and faithful participation in the Mass.",
        long: "At the Last Supper, Jesus gives us the gift of Himself in the Eucharist—His Body and Blood, offered for our salvation. This mystery invites us to deepen our reverence and gratitude, to participate fully in the Mass, and to adore Him truly present among us. May the Eucharist become the center of our lives, drawing us ever closer to Christ.",
      },
    ],
  },
};

const MYSTERIES = {
  Joyful: [
    { title: "The Annunciation", scripture: "Luke 1:26-38", description: "The Angel Gabriel announces to Mary that she will conceive and bear the Son of God." },
    { title: "The Visitation", scripture: "Luke 1:39-56", description: "Mary visits her cousin Elizabeth, who is pregnant with John the Baptist." },
    { title: "The Nativity", scripture: "Luke 2:1-20", description: "Jesus is born in Bethlehem and laid in a manger." },
    { title: "The Presentation", scripture: "Luke 2:22-38", description: "Mary and Joseph present the infant Jesus in the Temple." },
    { title: "Finding in the Temple", scripture: "Luke 2:41-52", description: "The young Jesus is found teaching in the Temple after being lost for three days." },
  ],
  Sorrowful: [
    { title: "Agony in the Garden", scripture: "Luke 22:39-46", description: "Jesus prays in Gethsemane the night before His Passion." },
    { title: "Scourging at the Pillar", scripture: "John 19:1", description: "Jesus is bound and scourged by Roman soldiers." },
    { title: "Crowning with Thorns", scripture: "Matthew 27:29", description: "Soldiers place a crown of thorns on Jesus and mock Him as King." },
    { title: "Carrying the Cross", scripture: "Luke 23:26-32", description: "Jesus carries His cross to Golgotha." },
    { title: "The Crucifixion", scripture: "John 19:17-30", description: "Jesus is crucified and dies on the cross for our sins." },
  ],
  Glorious: [
    { title: "The Resurrection", scripture: "John 20:1-18", description: "Jesus rises from the dead on the third day." },
    { title: "The Ascension", scripture: "Acts 1:6-11", description: "Jesus ascends into heaven forty days after His Resurrection." },
    { title: "Descent of the Holy Spirit", scripture: "Acts 2:1-13", description: "The Holy Spirit descends upon Mary and the Apostles at Pentecost." },
    { title: "Assumption of Mary", scripture: "Revelation 12:1", description: "Mary is assumed body and soul into heavenly glory." },
    { title: "Coronation of Mary", scripture: "Revelation 12:1", description: "Mary is crowned Queen of Heaven and Earth." },
  ],
  Luminous: [
    { title: "Baptism of Jesus", scripture: "Matthew 3:13-17", description: "Jesus is baptized by John in the Jordan River." },
    { title: "Wedding at Cana", scripture: "John 2:1-12", description: "Jesus performs His first miracle, turning water into wine." },
    { title: "Proclamation of the Kingdom", scripture: "Mark 1:14-15", description: "Jesus proclaims the Kingdom of God and calls all to repentance." },
    { title: "The Transfiguration", scripture: "Matthew 17:1-8", description: "Jesus is transfigured in glory before Peter, James, and John." },
    { title: "Institution of the Eucharist", scripture: "Luke 22:14-20", description: "Jesus institutes the Eucharist at the Last Supper." },
  ],
};

// ── SEQUENCE BUILDER ──────────────────────────────────────────────────────────
// Each step has: type, prayer?, mystery?, beadType, label?, decade?, beadInDecade?
// beadType: "crucifix" | "large" | "small" | "none"

function buildSequence(mysterySet) {
  const mysteries = MYSTERIES[mysterySet];
  const steps = [];

  // Sign of the Cross — opening step (no bead, shown before touching the rosary)
  steps.push({ type: "prayer", prayer: "signOfCross", label: "Begin with the Sign of the Cross", beadType: "none" });

  // Pendant steps — bottom to top visually:
  // crucifix (Apostles' Creed) → large Our Father → small×3 HM → junction → loop
  steps.push({ type: "prayer", prayer: "apostlesCreed", label: "Apostles' Creed", beadType: "crucifix" });          // idx 0 - bottom
  steps.push({ type: "prayer", prayer: "ourFather",     label: "Our Father",      beadType: "large" });             // idx 1
  steps.push({ type: "prayer", prayer: "hailMary",      label: "Hail Mary (1 of 3) — for Faith",   beadType: "small" }); // idx 2
  steps.push({ type: "prayer", prayer: "hailMary",      label: "Hail Mary (2 of 3) — for Hope",    beadType: "small" }); // idx 3
  steps.push({ type: "prayer", prayer: "hailMary",      label: "Hail Mary (3 of 3) — for Charity", beadType: "small" }); // idx 4
  steps.push({ type: "prayer", prayer: "gloryBe",       label: "Glory Be",        beadType: "small" });              // idx 5 - small bead at junction

  // 5 decades on the loop
  mysteries.forEach((mystery, mi) => {
    steps.push({ type: "mystery", mystery, decadeIndex: mi, beadType: "none" });
    steps.push({ type: "prayer", prayer: "ourFather", label: "Our Father", beadType: "large", decade: mi });
    for (let i = 1; i <= 10; i++) {
      steps.push({ type: "prayer", prayer: "hailMary", label: `Hail Mary (${i} of 10)`, beadType: "small", decade: mi, beadInDecade: i });
    }
    steps.push({ type: "prayer", prayer: "gloryBe",      label: "Glory Be",      beadType: "none", decade: mi });
    steps.push({ type: "prayer", prayer: "fatimaPrayer", label: "Fatima Prayer", beadType: "none", decade: mi });
  });

  steps.push({ type: "prayer", prayer: "hailHolyQueen", label: "Hail Holy Queen", beadType: "none" });
  steps.push({ type: "prayer", prayer: "finalPrayer", label: "Final Prayer", beadType: "none" });
  steps.push({ type: "prayer", prayer: "signOfCross", label: "Closing Sign of the Cross", beadType: "none" });
  steps.push({ type: "complete" });
  return steps;
}

const DAY_MYSTERIES = {
  0: "Glorious", 1: "Joyful", 2: "Sorrowful", 3: "Glorious",
  4: "Luminous", 5: "Sorrowful", 6: "Joyful",
};

// ── SVG ROSARY ────────────────────────────────────────────────────────────────
//
// A classic rosary shape:
//   • A circular loop of 55 beads (5 large Our Father + 50 small Hail Mary)
//   • A pendant tail hanging from the bottom: medal → large → 3 small → crucifix
//
// The loop beads map to loop steps in the sequence.
// The pendant beads map to intro steps (0–4) in the sequence.

// ── DECADE ARC ────────────────────────────────────────────────────────────────
// Shows the active decade's arc in the top half of the circle.
// All 5 decades are mapped into the top 180° (from 0° to 180°, left to right).
// The circle center sits below the SVG so only the top arc is visible.

function DecadeArc({ sequence, currentStep, onBeadTap }) {
  // Use the SAME circle geometry as the full rosary, but shift cy upward
  // so all 5 decades are visible in the top portion of the SVG.
  // Full rosary: cx=190, cy=172, r=148
  // We shift cy so decade 1 (bottom-right, relative y=+148) sits near bottom of our SVG,
  // and decade 3 (top, relative y=-148) sits near top.
  // We want a 220px tall SVG. Set cy=220 so:
  //   - circle top (cy-148=72) is near top with padding
  //   - decade 1/5 bottom (cy+148=368) is below SVG — clipped out
  //   - decade 2/4 bottom (cy+46=266) — also below, clipped
  // This means only the upper arc (decades 1-5 top portions) shows.
  // But we actually want all of decade 1 visible too.
  // Solution: shrink r proportionally so everything fits in 220px.
  // Scale factor: 220 / 296 = 0.74 → r_new = 148 * 0.74 = 110
  // Then the full circle fits in 220px, and we show only the top 220px.

  const W = 380;
  const r = 170;
  const cx = W / 2;
  const cy = -40;
  const svgH = 270;

  const activeMysteryStep = sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery");
  const activeDecadeIndex = activeMysteryStep?.decadeIndex ?? 0;
  const activeMysteryOurFather = sequence[currentStep]?.type === "mystery" ? currentStep + 1 : null;

  const loopSteps = sequence
    .map((s, i) => ({ ...s, stepIndex: i }))
    .filter(s => s.stepIndex >= 7 && (s.beadType === "large" || s.beadType === "small"));

  const total = loopSteps.length; // 55

  // Junction = bottom of circle (90°). D1 arcs counter-clockwise up and to the right.
  const allPositions = loopSteps.map((s, idx) => {
    const angleDeg = 90 - (idx / total) * 360;
    const angleRad = angleDeg * Math.PI / 180;
    return {
      ...s,
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  });

  const decadePositions = allPositions.filter(b => 
    b.decade === activeDecadeIndex || 
    (b.decade === activeDecadeIndex + 1 && b.beadType === "large")
  );

  function beadFill(stepIndex) {
    if (stepIndex === currentStep || stepIndex === activeMysteryOurFather) return "url(#arcGradActive)";
    if (stepIndex < currentStep) return "url(#arcGradDone)";
    return "url(#arcGradIdle)";
  }
  function beadStroke(stepIndex) {
    if (stepIndex === currentStep || stepIndex === activeMysteryOurFather) return "#ffd700";
    if (stepIndex < currentStep) return "#2a6abf";
    return "#8a6aaa";
  }
  function isActive(si) { return si === currentStep || si === activeMysteryOurFather; }

  // Per-decade viewBox offset to slide the window up and reveal each decade
  // D1: y 13->130 (no shift needed), D2: y -178->13 (shift up ~160), etc.
  const decadeViewOffsets = [-10, -170, -210, -170, -10];
  const viewOffsetY = decadeViewOffsets[activeDecadeIndex] ?? -10;

  // Active mystery for display inside arc
  const activeMysteryForDisplay = sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery");

  // Junction point (bottom of circle)
  const juncX = cx;
  const juncY = cy + r;

  // Pendant beads hanging from junction (small scale)
  const pendantBeads = [
    { y: juncY + 22, r: 8, type: "large" },   // Our Father
    { y: juncY + 38, r: 6, type: "small" },   // HM1
    { y: juncY + 51, r: 6, type: "small" },   // HM2
    { y: juncY + 64, r: 6, type: "small" },   // HM3
  ];
  const crucifixY = juncY + 84;

  // Center of arc — good spot for mystery text
  // Use midpoint of active decade arc
  const midBead = decadePositions[Math.floor(decadePositions.length / 2)];
  const textX = midBead ? cx + (midBead.x - cx) * 0.45 : cx;
  const textY = midBead ? cy + (midBead.y - cy) * 0.45 : cy;

  const chainPath = decadePositions.length > 1
    ? decadePositions.map((b, i) => `${i === 0 ? "M" : "L"} ${b.x} ${b.y}`).join(" ")
    : null;

  return (
    <svg width={W} height={svgH} viewBox={`0 ${viewOffsetY} ${W} ${svgH}`} style={{ display: "block", margin: "0 auto", overflow: "hidden" }}>
      <defs>
        <radialGradient id="arcGradIdle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c8a8e8" />
          <stop offset="100%" stopColor="#4a2870" />
        </radialGradient>
        <radialGradient id="arcGradDone" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a8c8f8" />
          <stop offset="100%" stopColor="#1a4a8a" />
        </radialGradient>
        <radialGradient id="arcGradActive" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#c8860a" />
        </radialGradient>
        <radialGradient id="arcGradGhost" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6a4890" />
          <stop offset="100%" stopColor="#2d1b3d" />
        </radialGradient>
        <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="arcShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#1a0d2e" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Ghost full circle */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r}
        fill="none" stroke="rgba(107,63,160,0.2)" strokeWidth="1.5" strokeDasharray="2 3" />

      {/* Ghost beads — all 55 faintly */}
      {allPositions.map((b, i) => {
        const isActiveDec = b.decade === activeDecadeIndex;
        if (isActiveDec) return null; // active decade drawn separately
        return (
          <circle key={i} cx={b.x} cy={b.y}
            r={b.beadType === "large" ? 5 : 3.5}
            fill="rgba(107,63,160,0.25)" stroke="rgba(107,63,160,0.15)" strokeWidth="0.5" />
        );
      })}

      {/* Pendant tail hanging from junction */}
      <line x1={juncX} y1={juncY} x2={juncX} y2={crucifixY - 10}
        stroke="rgba(90,56,120,0.4)" strokeWidth="1.5" />
      <circle cx={juncX} cy={juncY} r={5} fill="rgba(107,63,160,0.5)" stroke="rgba(200,160,232,0.3)" strokeWidth="1" />
      {pendantBeads.map((pb, i) => (
        <circle key={i} cx={juncX} cy={pb.y} r={pb.r}
          fill="rgba(107,63,160,0.35)" stroke="rgba(107,63,160,0.2)" strokeWidth="0.5" />
      ))}
      {/* Crucifix */}
      <rect x={juncX - 1.5} y={crucifixY - 10} width={3} height={20} rx={1.5}
        fill="rgba(107,63,160,0.4)" />
      <rect x={juncX - 7} y={crucifixY - 5} width={14} height={3} rx={1.5}
        fill="rgba(107,63,160,0.4)" />

      {/* Mystery text inside the arc */}
      {activeMysteryForDisplay && (
        <g>
          <text x={textX} y={textY - 10} textAnchor="middle"
            fontSize="9" fill="rgba(200,160,232,0.5)" fontFamily="'Lora',serif"
            fontStyle="italic" pointerEvents="none">
            Mystery {(activeMysteryForDisplay.decadeIndex ?? 0) + 1}
          </text>
          <text x={textX} y={textY + 6} textAnchor="middle"
            fontSize="11" fontWeight="600" fill="rgba(240,230,255,0.7)"
            fontFamily="'Lora',serif" pointerEvents="none">
            {activeMysteryForDisplay.mystery?.title?.split(" ").slice(0, 3).join(" ")}
          </text>
          {activeMysteryForDisplay.mystery?.title?.split(" ").length > 3 && (
            <text x={textX} y={textY + 20} textAnchor="middle"
              fontSize="11" fontWeight="600" fill="rgba(240,230,255,0.7)"
              fontFamily="'Lora',serif" pointerEvents="none">
              {activeMysteryForDisplay.mystery?.title?.split(" ").slice(3).join(" ")}
            </text>
          )}
        </g>
      )}

      {/* Chain arc for active decade */}
      {chainPath && (
        <path d={chainPath} fill="none" stroke="#5a3878" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Active decade beads */}
      {decadePositions.map((b) => {
        const large = b.beadType === "large";
        const beadR = large ? 16 : 13;
        const active = isActive(b.stepIndex);
        const reached = b.stepIndex <= currentStep || (activeMysteryOurFather && b.stepIndex <= activeMysteryOurFather);
        const showNum = !large && b.beadInDecade != null && reached;
        const textCol = active ? "#2d1b3d" : "rgba(255,255,255,0.95)";
        return (
          <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
            {active && <circle cx={b.x} cy={b.y} r={beadR + 7} fill="rgba(255,215,0,0.15)" />}
            <circle cx={b.x} cy={b.y} r={beadR}
              fill={beadFill(b.stepIndex)} stroke={beadStroke(b.stepIndex)}
              strokeWidth={active ? 2.5 : 1.5}
              filter={active ? "url(#arcGlow)" : "url(#arcShadow)"}
            />
            {large && <circle cx={b.x} cy={b.y} r={beadR - 5} fill="none"
              stroke={active ? "rgba(255,215,0,0.6)" : "rgba(200,168,232,0.4)"} strokeWidth="1" />}
            {showNum && (
              <text x={b.x} y={b.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={b.beadInDecade >= 10 ? "10" : "12"} fontWeight="700"
                fill={textCol} fontFamily="sans-serif" pointerEvents="none">
                {b.beadInDecade}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function RosaryShape({ sequence, currentStep, onBeadTap, mini = false, activeMystery = null, mysterySet = "Sorrowful" }) {
  const W = 380;
  const H = mini ? 260 : 500;
  const cx = W / 2;
  const cy = mini ? 82 : 158;
  const rx = mini ? 76 : 148;
  const ry = mini ? 76 : 148;
  const beadR = mini ? 5 : 9;
  const largeR = mini ? 7 : 13;
  const junctionR = mini ? 5 : 11;
  const fontSize = mini ? 4 : 8.5;

  // Collect loop bead steps (indices 7+ with beadType large or small)
  const loopSteps = sequence
    .map((s, i) => ({ ...s, stepIndex: i }))
    .filter(s => s.stepIndex >= 7 && (s.beadType === "large" || s.beadType === "small"));
  // 55 beads: 5 Our Father + 50 Hail Mary

  // Collect pendant bead steps (indices 0–5)
  const pendantSteps = sequence
    .map((s, i) => ({ ...s, stepIndex: i }))
    .filter(s => s.stepIndex <= 5 && s.beadType !== "none");
  // [apostlesCreed(crucifix=0), ourFather(large=1), hm(2), hm(3), hm(4), gloryBe(small=5)]

  // Loop: per the diagram, flow starts at junction going UP and clockwise (right side first).
  // In SVG angles: bottom = 90°, going counter-clockwise means decreasing angle.
  // Start at 90° (bottom/junction), go counter-clockwise (up the right side first).
  const total = loopSteps.length;
  const loopPositions = loopSteps.map((s, idx) => {
    const angleDeg = 90 - (idx / total) * 360; // counter-clockwise from bottom
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      ...s,
      x: cx + rx * Math.cos(angleRad),
      y: cy + ry * Math.sin(angleRad),
    };
  });

  // Junction point (bottom of ellipse)
  const juncX = cx;
  const juncY = cy + ry;

  // Pendant visual order — bottom to top:
  // crucifix(0) → ourFather(1) → hm1(2) → hm2(3) → hm3(4) → gloryBe(5) → junction
  const gloryBeStep = pendantSteps.find(s => s.stepIndex === 5);
  const hmSteps = pendantSteps.filter(s => s.beadType === "small" && s.stepIndex !== 5); // idx 2,3,4
  const ourFatherStep = pendantSteps.find(s => s.beadType === "large");                  // idx 1
  const crucifixStep = pendantSteps.find(s => s.beadType === "crucifix");                // idx 0

  // Bottom to top: crucifix, ourFather, hm1, hm2, hm3, gloryBe
  const pendantOrdered = [crucifixStep, ourFatherStep, ...hmSteps, gloryBeStep].filter(Boolean);
  const pendantCount = pendantOrdered.length; // 6

  // Spacing: larger gap between crucifix and ourFather, tight for the small beads above
  const largeSpacing = mini ? 20 : 40;
  const smallSpacing = mini ? 13 : 24;
  // spacings[i] = distance from crucifix (i=0) upward
  const spacings = [
    0,                                        // crucifix
    largeSpacing,                             // ourFather
    largeSpacing + smallSpacing,              // hm1
    largeSpacing + smallSpacing * 2,          // hm2
    largeSpacing + smallSpacing * 3,          // hm3
    largeSpacing + smallSpacing * 4,          // gloryBe
  ];
  const crucifixY = juncY + 26 + spacings[pendantCount - 1];
  const pendantPositions = pendantOrdered.map((s, i) => ({
    ...s,
    x: juncX,
    y: crucifixY - spacings[i],
  }));

  const crucifixPos = pendantPositions[0]; // crucifix is always index 0 = bottom

  // Color helpers — when on a mystery step, light up the following Our Father bead
  const activeMysteryOurFather = sequence[currentStep]?.type === "mystery" ? currentStep + 1 : null;

  function beadFill(stepIndex) {
    if (stepIndex === currentStep || stepIndex === activeMysteryOurFather) return "url(#gradActive)";
    if (stepIndex < currentStep) return "url(#gradDone)";
    return "url(#gradIdle)";
  }
  function beadStroke(stepIndex) {
    if (stepIndex === currentStep || stepIndex === activeMysteryOurFather) return "#ffd700";
    if (stepIndex < currentStep) return "#2a6abf";
    return "#8a6aaa";
  }
  function isActive(si) { return si === currentStep || si === activeMysteryOurFather; }

  // Determine active decade index (from current step or most recent mystery)
  const activeMysteryStep = sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery");
  const activeDecadeIndex = activeMysteryStep?.decadeIndex ?? -1;
  // Are we still in the pendant intro (before any mystery)?
  const inPendant = activeDecadeIndex === -1;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="gradIdle" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#c8a8e8" />
          <stop offset="100%" stopColor="#4a2870" />
        </radialGradient>
        <radialGradient id="gradDone" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#a8c8f8" />
          <stop offset="100%" stopColor="#1a4a8a" />
        </radialGradient>
        <radialGradient id="gradActive" cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#c8860a" />
        </radialGradient>
        <radialGradient id="gradMedal" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e8d8ff" />
          <stop offset="100%" stopColor="#6b3fa0" />
        </radialGradient>
        <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#1a0d2e" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* ── Chain: Ellipse loop ── */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill="none" stroke="#5a3878" strokeWidth="2" />

      {/* ── Chain: Pendant line ── */}
      <line
        x1={juncX} y1={juncY}
        x2={crucifixPos ? crucifixPos.x : juncX}
        y2={crucifixPos ? crucifixPos.y - 20 : juncY + 160}
        stroke="#5a3878" strokeWidth="2"
      />

      {/* ── Junction medal ── */}
      <circle cx={juncX} cy={juncY} r={junctionR} fill="url(#gradMedal)" stroke="#9b6dcc" strokeWidth="1.5" filter="url(#softShadow)" />
      <circle cx={juncX} cy={juncY} r={junctionR - 5} fill="none" stroke="#c9a0e8" strokeWidth="1" />

      {/* ── Loop beads ── */}
      {loopPositions.map((b) => {
        const large = b.beadType === "large";
        const r = large ? largeR : beadR;
        const active = isActive(b.stepIndex);
        const isHM = !large;
        const inActiveDecade = b.decade === activeDecadeIndex;
        const reached = b.stepIndex <= currentStep || (activeMysteryOurFather && b.stepIndex <= activeMysteryOurFather);
        const showNumber = isHM && inActiveDecade && reached && b.beadInDecade != null;
        const textCol = active ? "#2d1b3d" : "rgba(255,255,255,0.9)";
        return (
          <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
            {active && <circle cx={b.x} cy={b.y} r={r + (mini ? 3 : 7)} fill="rgba(255,215,0,0.15)" />}
            <circle cx={b.x} cy={b.y} r={r} fill={beadFill(b.stepIndex)} stroke={beadStroke(b.stepIndex)} strokeWidth={active ? 2 : 1} filter={active ? "url(#glowGold)" : "url(#softShadow)"} />
            {large && <circle cx={b.x} cy={b.y} r={r - (mini ? 2 : 4)} fill="none" stroke={active ? "rgba(255,215,0,0.6)" : "rgba(200,168,232,0.4)"} strokeWidth="1" />}
            {showNumber && !mini && (
              <text x={b.x} y={b.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={b.beadInDecade >= 10 ? "7.5" : "8.5"} fontWeight="700"
                fill={textCol} fontFamily="sans-serif" pointerEvents="none">
                {b.beadInDecade}
              </text>
            )}
            {showNumber && mini && (
              <text x={b.x} y={b.y + 0.5} textAnchor="middle" dominantBaseline="middle"
                fontSize="4" fontWeight="700"
                fill={textCol} fontFamily="sans-serif" pointerEvents="none">
                {b.beadInDecade}
              </text>
            )}
          </g>
        );
      })}

      {/* ── Pendant beads ── */}
      {pendantPositions.map((b, posIdx) => {
        const isCrucifix = b.beadType === "crucifix";
        const isLarge = b.beadType === "large";
        const active = isActive(b.stepIndex);
        // Pendant HM beads are positions 2,3,4 (stepIndex 2,3,4)
        // Show number 1,2,3 only while still in pendant intro phase
        const isPendantHM = !isCrucifix && !isLarge && b.stepIndex >= 2 && b.stepIndex <= 4;
        const pendantHMNum = b.stepIndex - 1; // stepIndex 2→1, 3→2, 4→3
        const showPendantNum = isPendantHM && inPendant && b.stepIndex <= currentStep;

        if (isCrucifix) {
          const armH = mini ? 7 : 17, armV = mini ? 10 : 25, thick = mini ? 2.5 : 5;
          const col = active ? "#ffd700" : b.stepIndex < currentStep ? "#2a6abf" : "#8a6aaa";
          return (
            <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
              <rect x={b.x - thick / 2} y={b.y - armV} width={thick} height={armV * 2} rx={thick / 2} fill={col} filter={active ? "url(#glowGold)" : "url(#softShadow)"} />
              <rect x={b.x - armH} y={b.y - thick / 2 - (mini ? 3 : 6)} width={armH * 2} height={thick} rx={thick / 2} fill={col} filter={active ? "url(#glowGold)" : "url(#softShadow)"} />
            </g>
          );
        }

        const r = isLarge ? largeR : beadR;
        return (
          <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
            {active && <circle cx={b.x} cy={b.y} r={r + (mini ? 3 : 7)} fill="rgba(255,215,0,0.15)" />}
            <circle cx={b.x} cy={b.y} r={r} fill={beadFill(b.stepIndex)} stroke={beadStroke(b.stepIndex)} strokeWidth={active ? 2 : 1} filter={active ? "url(#glowGold)" : "url(#softShadow)"} />
            {isLarge && <circle cx={b.x} cy={b.y} r={r - (mini ? 2 : 4)} fill="none" stroke={active ? "rgba(255,215,0,0.6)" : "rgba(200,168,232,0.4)"} strokeWidth="1" />}
            {showPendantNum && (
              <text x={b.x} y={b.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={mini ? "4" : "8.5"} fontWeight="700"
                fill={active ? "#2d1b3d" : "rgba(255,255,255,0.9)"} fontFamily="sans-serif" pointerEvents="none">
                {pendantHMNum}
              </text>
            )}
          </g>
        );
      })}
      {/* Mystery text inside the circle */}
      {activeMystery && !mini && (() => {
        const title = activeMystery.mystery?.title ?? "";
        const decadeIdx = activeMystery.decadeIndex ?? 0;
        const content = MYSTERY_CONTENT[mysterySet]?.mysteries[decadeIdx];
        const words = title.split(" ");
        const lines = [];
        for (let i = 0; i < words.length; i += 3) {
          lines.push(words.slice(i, i + 3).join(" "));
        }
        const lineHeight = 24;
        const startY = cy - 65;

        // Wrap short prayer into lines of ~5 words
        const prayerWords = (content?.short ?? "").split(" ");
        const prayerLines = [];
        for (let i = 0; i < prayerWords.length; i += 5) {
          prayerLines.push(prayerWords.slice(i, i + 5).join(" "));
        }

        const scriptureY = startY + lines.length * lineHeight + 22;
        const fruitY = scriptureY + 28;
        const prayerStartY = fruitY + 30;

        return (
          <g pointerEvents="none">
            {/* Mystery number */}
            <text x={cx} y={startY - 28} textAnchor="middle"
              fontSize="12" fill="rgba(200,160,232,0.6)"
              fontFamily="'Lora',serif" fontStyle="italic" letterSpacing="2">
              MYSTERY {decadeIdx + 1}
            </text>
            {/* Title */}
            {lines.map((line, i) => (
              <text key={i} x={cx} y={startY + i * lineHeight} textAnchor="middle"
                fontSize="20" fontWeight="700" fill="rgba(240,230,255,0.95)"
                fontFamily="'Lora',serif">
                {line}
              </text>
            ))}
            {/* Scripture */}
            <text x={cx} y={scriptureY} textAnchor="middle"
              fontSize="12" fill="rgba(200,160,232,0.55)"
              fontFamily="'Lora',serif" fontStyle="italic">
              {activeMystery.mystery?.scripture}
            </text>
            {/* Fruit of the Mystery */}
            {content?.fruit ? (
              <text x={cx} y={fruitY} textAnchor="middle"
                fontSize="14" fontWeight="600" fill="rgba(255,215,150,0.85)"
                fontFamily="'Lora',serif" fontStyle="italic">
                {content.fruit}
              </text>
            ) : null}
            {/* Prayer intention — stays visible throughout the decade */}
            {content?.short ? prayerLines.map((line, i) => (
              <text key={i} x={cx} y={prayerStartY + i * 18} textAnchor="middle"
                fontSize="13" fontWeight="600" fill="rgba(255,215,150,0.9)"
                fontFamily="'Lora',serif">
                {line}
              </text>
            )) : null}
          </g>
        );
      })()}
    </svg>
  );
}

function PrayerCard({ step, expanded, onToggle }) {
  const prayer = PRAYERS[step.prayer];
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, border: "1px solid rgba(200,160,232,0.2)", overflow: "hidden" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <div style={{ fontSize: 10, color: "#9b7aba", fontFamily: "'Lora',serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
            {step.label}
          </div>
          <div style={{ fontSize: 18, fontFamily: "'Lora',serif", color: "#f0e6ff", fontWeight: 600 }}>
            {prayer.name}
          </div>
        </div>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: expanded ? "#6b3fa0" : "rgba(200,160,232,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>
          <span style={{ color: expanded ? "white" : "#c9a0e8", fontSize: 15, lineHeight: 1 }}>{expanded ? "−" : "+"}</span>
        </div>
      </button>
      {expanded && (
        <div style={{
          padding: "0 18px 16px", paddingTop: 12, fontSize: 14, lineHeight: 1.85,
          color: "#d4b8f0", fontFamily: "'Lora',serif",
          borderTop: "1px solid rgba(200,160,232,0.15)",
          animation: "fadeIn 0.2s ease",
        }}>
          {prayer.text.split("\n\n").map((para, i) => (
            <p key={i} style={{ margin: "0 0 10px" }}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function MysteryCard({ mystery, decadeIndex }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(107,63,160,0.7), rgba(155,109,204,0.5))",
      borderRadius: 16, padding: "16px 18px",
      border: "1px solid rgba(200,160,232,0.3)",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#c9a0e8", fontFamily: "'Lora',serif", marginBottom: 3 }}>
        Mystery {decadeIndex + 1}
      </div>
      <div style={{ fontSize: 18, fontFamily: "'Lora',serif", fontWeight: 700, color: "#f0e6ff", marginBottom: 5 }}>{mystery.title}</div>
      <div style={{ fontSize: 12, color: "#c9a0e8", fontFamily: "'Lora',serif", marginBottom: 8, fontStyle: "italic" }}>{mystery.scripture}</div>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: "#d4b8f0", fontFamily: "'Lora',serif" }}>{mystery.description}</div>
    </div>
  );
}

function CompletionScreen({ onRestart }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center", padding: 32 }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>✝️</div>
      <div style={{ fontSize: 24, fontFamily: "'Lora',serif", fontWeight: 700, color: "#f0e6ff", marginBottom: 10 }}>Rosary Complete</div>
      <div style={{ fontSize: 14, color: "#c9a0e8", fontFamily: "'Lora',serif", lineHeight: 1.7, marginBottom: 28, maxWidth: 280 }}>
        You have completed the Holy Rosary. May Our Lady intercede for you and your intentions.
      </div>
      <button onClick={onRestart} style={{
        background: "linear-gradient(135deg,#6b3fa0,#9b6dcc)", color: "white", border: "none",
        borderRadius: 14, padding: "14px 32px", fontSize: 15, fontFamily: "'Lora',serif", cursor: "pointer", fontWeight: 600,
      }}>
        Pray Again
      </button>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

const ICON_DATA_URI = "data:image/png;base64,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";

export default function RosaryApp() {
  const today = new Date().getDay();
  const defaultMystery = DAY_MYSTERIES[today];
  const [mysterySet, setMysterySet] = useState(defaultMystery);
  const [sequence, setSequence] = useState(() => buildSequence(defaultMystery));
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedPrayer, setExpandedPrayer] = useState(null);
  const [stickyExpanded, setStickyExpanded] = useState(new Set());
  const [learnMore, setLearnMore] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [homeLearnMore, setHomeLearnMore] = useState(false);
  const [screen, setScreen] = useState("home");
  const [showDedication, setShowDedication] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFeedbackViewer, setShowFeedbackViewer] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackThumb, setFeedbackThumb] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackLocation, setFeedbackLocation] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackPinInput, setFeedbackPinInput] = useState("");
  const [feedbackPinError, setFeedbackPinError] = useState(false);
  const [feedbackPinUnlocked, setFeedbackPinUnlocked] = useState(false);

  // Prayer Warrior state
  const [showPrayerWarrior, setShowPrayerWarrior] = useState(false);
  const [showPrayerWall, setShowPrayerWall] = useState(false);
  const [prayerIntention, setPrayerIntention] = useState("");
  const [prayerName, setPrayerName] = useState("");
  const [prayerLocation, setPrayerLocation] = useState("");
  const [prayerList, setPrayerList] = useState([]);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  // Load feedback and prayers from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const result = await window.storage.get("rosary_feedback", true);
        if (result) setFeedbackList(JSON.parse(result.value));
      } catch (e) { setFeedbackList([]); }
      try {
        const result = await window.storage.get("rosary_prayers", true);
        if (result) setPrayerList(JSON.parse(result.value));
      } catch (e) { setPrayerList([]); }
    }
    loadData();
  }, []);

  // Save feedback to storage
  async function submitFeedback() {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      rating: feedbackRating,
      thumb: feedbackThumb,
      comment: feedbackComment.trim(),
      name: feedbackName.trim(),
      location: feedbackLocation.trim(),
    };
    const updated = [entry, ...feedbackList];
    try {
      await window.storage.set("rosary_feedback", JSON.stringify(updated), true);
      setFeedbackList(updated);
      setFeedbackSubmitted(true);
      setFeedbackRating(0);
      setFeedbackThumb(null);
      setFeedbackComment("");
      setFeedbackName("");
      setFeedbackLocation("");
      setTimeout(() => { setFeedbackSubmitted(false); setShowFeedback(false); }, 1800);
    } catch (e) { console.error("Storage error:", e); }
  }

  // Save prayer intention to storage
  async function submitPrayer() {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      intention: prayerIntention.trim(),
      name: prayerName.trim(),
      location: prayerLocation.trim(),
    };
    const updated = [entry, ...prayerList];
    try {
      await window.storage.set("rosary_prayers", JSON.stringify(updated), true);
      setPrayerList(updated);
      setPrayerSubmitted(true);
      setPrayerIntention("");
      setPrayerName("");
      setPrayerLocation("");
      setTimeout(() => { setPrayerSubmitted(false); setShowPrayerWarrior(false); }, 1800);
    } catch (e) { console.error("Storage error:", e); }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // PWA meta tags — inject into document head
  useEffect(() => {
    const metas = [
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Holy Rosary" },
      { name: "theme-color", content: "#1a0d2e" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
    ];
    const added = metas.map(m => {
      const el = document.createElement("meta");
      el.name = m.name;
      el.content = m.content;
      document.head.appendChild(el);
      return el;
    });
    // Inject apple touch icon
    const link = document.createElement("link");
    link.rel = "apple-touch-icon";
    link.href = ICON_DATA_URI;
    document.head.appendChild(link);
    return () => { added.forEach(el => el.remove()); link.remove(); };
  }, []);

  const step = sequence[currentStep];

  const restart = useCallback((ms) => {
    const m = ms || mysterySet;
    setSequence(buildSequence(m));
    setCurrentStep(0);
    setExpandedPrayer(null);
    setStickyExpanded(new Set());
    setScreen("home");
  }, [mysterySet]);

  const advance = () => {
    if (currentStep < sequence.length - 1) {
      setCurrentStep(c => c + 1);
      setExpandedPrayer(null);
    }
  };
  const goBack = () => {
    if (currentStep > 0) { setCurrentStep(c => c - 1); setExpandedPrayer(null); }
  };

  useEffect(() => {
    if (step?.type === "complete") setScreen("complete");
  }, [step]);

  const progress = Math.round((currentStep / (sequence.length - 2)) * 100);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
    @keyframes splashFade { 0% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; } }
    @keyframes pulseBead { 0%,100% { transform:scale(1); opacity:0.7; } 50% { transform:scale(1.15); opacity:1; } }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #1a0d2e; }
    body { -webkit-user-select: none; user-select: none; }
  `;

  // ── FEEDBACK PANEL ──
  const FeedbackPanel = showFeedback ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(10,5,20,0.75)",
      display: "flex", alignItems: "flex-end",
    }} onClick={() => setShowFeedback(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
        borderRadius: "24px 24px 0 0", padding: "24px 22px 40px",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99, margin: "0 auto 20px" }} />

        {feedbackSubmitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 18, color: "white", fontFamily: "'Lora',serif", fontWeight: 700 }}>Thank you!</div>
            <div style={{ fontSize: 14, color: "#c9a0e8", fontFamily: "'Lora',serif", marginTop: 6 }}>Your feedback has been saved.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif", marginBottom: 6 }}>Share Your Feedback</div>
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 20 }}>Help us improve the Holy Rosary app</div>

            {/* Star rating */}
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Rate your experience</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setFeedbackRating(n)} style={{
                  fontSize: 28, background: "none", border: "none", cursor: "pointer",
                  opacity: n <= feedbackRating ? 1 : 0.3,
                  transition: "opacity 0.15s",
                }}>⭐</button>
              ))}
            </div>

            {/* Thumbs */}
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Quick reaction</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {[["👍", "up"], ["👎", "down"]].map(([emoji, val]) => (
                <button key={val} onClick={() => setFeedbackThumb(feedbackThumb === val ? null : val)} style={{
                  fontSize: 28, background: feedbackThumb === val ? "rgba(107,63,160,0.4)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${feedbackThumb === val ? "#6b3fa0" : "rgba(200,160,232,0.2)"}`,
                  borderRadius: 12, padding: "8px 20px", cursor: "pointer",
                  transition: "all 0.15s",
                }}>{emoji}</button>
              ))}
            </div>

            {/* Name */}
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Your first name</div>
            <input
              value={feedbackName}
              onChange={e => setFeedbackName(e.target.value)}
              placeholder="First name"
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, marginBottom: 16, boxSizing: "border-box",
              }}
            />

            {/* Location */}
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Your location</div>
            <input
              value={feedbackLocation}
              onChange={e => setFeedbackLocation(e.target.value)}
              placeholder="City, State or Country"
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, marginBottom: 16, boxSizing: "border-box",
              }}
            />

            {/* Comment */}
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Comments (optional)</div>
            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="What do you love? What could be better?"
              style={{
                width: "100%", height: 80, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, resize: "none", marginBottom: 16,
              }}
            />

            {/* Submit */}
            <button onClick={submitFeedback} disabled={!feedbackRating && !feedbackThumb && !feedbackComment}
              style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none",
                background: (feedbackRating || feedbackThumb || feedbackComment)
                  ? "linear-gradient(135deg,#6b3fa0,#9b6dcc)" : "rgba(255,255,255,0.1)",
                color: "white", fontFamily: "'Lora',serif", fontSize: 15,
                fontWeight: 700, cursor: "pointer",
              }}>
              Submit Feedback
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  // ── FEEDBACK VIEWER ──
  const FeedbackViewer = showFeedbackViewer ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(10,5,20,0.75)",
      display: "flex", alignItems: "flex-end",
    }} onClick={() => { setShowFeedbackViewer(false); setFeedbackPinInput(""); setFeedbackPinError(false); setFeedbackPinUnlocked(false); }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
        borderRadius: "24px 24px 0 0", padding: "24px 22px 40px",
        maxHeight: "80vh", overflowY: "auto",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99, margin: "0 auto 20px" }} />

        {!feedbackPinUnlocked ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif", marginBottom: 8 }}>Enter PIN</div>
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 20 }}>Feedback viewer is protected</div>
            <input
              type="password"
              value={feedbackPinInput}
              onChange={e => { setFeedbackPinInput(e.target.value); setFeedbackPinError(false); }}
              placeholder="PIN"
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: `1px solid ${feedbackPinError ? "#ff6b6b" : "rgba(200,160,232,0.2)"}`, borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 18,
                padding: 12, marginBottom: 8, boxSizing: "border-box", textAlign: "center", letterSpacing: 6,
              }}
            />
            {feedbackPinError && <div style={{ fontSize: 12, color: "#ff6b6b", marginBottom: 12 }}>Incorrect PIN</div>}
            <button onClick={() => {
              if (feedbackPinInput === "2680") { setFeedbackPinUnlocked(true); setFeedbackPinError(false); }
              else { setFeedbackPinError(true); setFeedbackPinInput(""); }
            }} style={{
              width: "100%", padding: "13px", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,#6b3fa0,#9b6dcc)",
              color: "white", fontFamily: "'Lora',serif", fontSize: 15,
              fontWeight: 700, cursor: "pointer", marginTop: 4,
            }}>Unlock</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif" }}>
                All Feedback ({feedbackList.length})
              </div>
              {feedbackList.length > 0 && (
                <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif" }}>
                  Avg: {"⭐".repeat(Math.round(feedbackList.filter(f=>f.rating).reduce((a,b)=>a+b.rating,0) / (feedbackList.filter(f=>f.rating).length||1)))}
                </div>
              )}
            </div>
            {feedbackList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#9b7aba", fontFamily: "'Lora',serif", fontStyle: "italic" }}>
                No feedback yet. Be the first! 🙏
              </div>
            ) : feedbackList.map((f) => (
              <div key={f.id} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 12,
                padding: "12px 14px", marginBottom: 10,
                border: "1px solid rgba(200,160,232,0.1)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: "#9b7aba", fontFamily: "'Lora',serif" }}>{f.date}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {f.rating > 0 && <span style={{ fontSize: 12 }}>{"⭐".repeat(f.rating)}</span>}
                    {f.thumb && <span style={{ fontSize: 14 }}>{f.thumb === "up" ? "👍" : "👎"}</span>}
                  </div>
                </div>
                {(f.name || f.location) && (
                  <div style={{ fontSize: 12, color: "#c9a0e8", fontFamily: "'Lora',serif", marginBottom: 4 }}>
                    {[f.name, f.location].filter(Boolean).join(" · ")}
                  </div>
                )}
                {f.comment && (
                  <div style={{ fontSize: 13, color: "#d4b8f0", fontFamily: "'Lora',serif", lineHeight: 1.5 }}>
                    "{f.comment}"
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  ) : null;

  // ── PRAYER WARRIOR PANEL ──
  const PrayerWarriorPanel = showPrayerWarrior ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(10,5,20,0.75)",
      display: "flex", alignItems: "flex-end",
    }} onClick={() => setShowPrayerWarrior(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
        borderRadius: "24px 24px 0 0", padding: "24px 22px 40px",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99, margin: "0 auto 20px" }} />

        {prayerSubmitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 18, color: "white", fontFamily: "'Lora',serif", fontWeight: 700 }}>Prayer Received</div>
            <div style={{ fontSize: 14, color: "#c9a0e8", fontFamily: "'Lora',serif", marginTop: 6 }}>Your intention has been saved.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif", marginBottom: 6 }}>⚔️ Prayer Requests</div>
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 20 }}>Submit a prayer intention</div>

            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Prayer intention</div>
            <textarea
              value={prayerIntention}
              onChange={e => setPrayerIntention(e.target.value)}
              placeholder="Share your prayer intention..."
              style={{
                width: "100%", height: 90, background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, resize: "none", marginBottom: 16, boxSizing: "border-box",
              }}
            />

            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>First name of person this is for</div>
            <input
              value={prayerName}
              onChange={e => setPrayerName(e.target.value)}
              placeholder="First name"
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, marginBottom: 16, boxSizing: "border-box",
              }}
            />

            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 8 }}>Location</div>
            <input
              value={prayerLocation}
              onChange={e => setPrayerLocation(e.target.value)}
              placeholder="City, State or Country"
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 12,
                color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                padding: 12, marginBottom: 20, boxSizing: "border-box",
              }}
            />

            <button onClick={submitPrayer} disabled={!prayerIntention.trim()}
              style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none",
                background: prayerIntention.trim() ? "linear-gradient(135deg,#6b3fa0,#9b6dcc)" : "rgba(255,255,255,0.1)",
                color: "white", fontFamily: "'Lora',serif", fontSize: 15,
                fontWeight: 700, cursor: prayerIntention.trim() ? "pointer" : "default",
              }}>
              Submit Intention
            </button>
          </>
        )}
      </div>
    </div>
  ) : null;

  // ── PRAYER WALL ──
  const PrayerWall = showPrayerWall ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "rgba(10,5,20,0.75)",
      display: "flex", alignItems: "flex-end",
    }} onClick={() => setShowPrayerWall(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
        borderRadius: "24px 24px 0 0", padding: "24px 22px 40px",
        maxHeight: "80vh", overflowY: "auto",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif" }}>🙏 Prayer Wall</div>
          <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif" }}>{prayerList.length} intention{prayerList.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginBottom: 20, fontStyle: "italic" }}>
          Pray for each of these intentions as you read them.
        </div>
        {prayerList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#9b7aba", fontFamily: "'Lora',serif", fontStyle: "italic" }}>
            No intentions yet. Be the first to share one. 🙏
          </div>
        ) : prayerList.map((p) => (
          <div key={p.id} style={{
            background: "rgba(255,255,255,0.05)", borderRadius: 12,
            padding: "14px 16px", marginBottom: 10,
            border: "1px solid rgba(200,160,232,0.15)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: "#c9a0e8", fontFamily: "'Lora',serif", fontWeight: 700 }}>
                {[p.name, p.location].filter(Boolean).join(" · ") || "Anonymous"}
              </div>
              <div style={{ fontSize: 11, color: "#6b5080", fontFamily: "'Lora',serif" }}>{p.date}</div>
            </div>
            <div style={{ fontSize: 14, color: "#e8d8ff", fontFamily: "'Lora',serif", lineHeight: 1.6, fontStyle: "italic" }}>
              "{p.intention}"
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  // ── PERSISTENT BUTTONS ──
  const labelStyle = {
    fontSize: 10, color: "rgba(200,160,232,0.85)", fontFamily: "'Lora',serif",
    background: "rgba(10,5,20,0.75)", borderRadius: 6, padding: "2px 6px",
    backdropFilter: "blur(6px)", whiteSpace: "nowrap", letterSpacing: 0.3,
    pointerEvents: "none",
  };
  const rowStyle = { display: "flex", alignItems: "center", gap: 8 };

  const FeedbackButton = !showDedication ? (
    <div style={{
      position: "fixed", bottom: 20, right: 16, zIndex: 9997,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
    }}>
      <div style={rowStyle}>
        <span style={labelStyle}>View Feedback</span>
        <button onClick={() => { setShowFeedbackViewer(true); setShowFeedback(false); setShowPrayerWarrior(false); }} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(26,13,46,0.9)",
          border: "1px solid rgba(200,160,232,0.3)",
          fontSize: 18, cursor: "pointer",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>📋</button>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Leave Feedback</span>
        <button onClick={() => { setShowFeedback(true); setShowFeedbackViewer(false); setShowPrayerWarrior(false); }} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg,#6b3fa0,#9b6dcc)",
          border: "none", fontSize: 20, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(107,63,160,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>💬</button>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Prayer Requests</span>
        <button onClick={() => { setShowPrayerWarrior(true); setShowFeedback(false); setShowFeedbackViewer(false); setShowPrayerWall(false); }} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg,#1a4a8a,#2e6abf)",
          border: "none", fontSize: 20, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(30,80,160,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>⚔️</button>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Prayer Wall</span>
        <button onClick={() => { setShowPrayerWall(true); setShowPrayerWarrior(false); setShowFeedback(false); setShowFeedbackViewer(false); }} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg,#0d5c3a,#1a8a5a)",
          border: "none", fontSize: 20, cursor: "pointer",
          boxShadow: "0 4px 16px rgba(13,92,58,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>🙏</button>
      </div>
    </div>
  ) : null;

  // Completely self-contained dedication overlay — no dependencies on anything else
  if (showDedication) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(180deg, #1a0d2e 0%, #2d1b3d 60%, #3d1f55 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "Georgia, serif",
        padding: "48px 32px 40px", textAlign: "center",
        overflowY: "auto", zIndex: 9999,
      }}>
        <style>{CSS}</style>

        {/* Splash overlay on top of dedication for first 2 seconds */}
        {showSplash && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
            background: "linear-gradient(160deg, #1a0d2e 0%, #2d1b3d 60%, #4a2060 100%)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", fontFamily: "Georgia, serif",
            animation: "splashFade 2s ease forwards", pointerEvents: "none",
          }}>
            <div style={{ position: "relative", width: 140, height: 140, marginBottom: 32 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 360;
                const rad = angle * Math.PI / 180;
                const x = 70 + 55 * Math.cos(rad) - 6;
                const y = 70 + 55 * Math.sin(rad) - 6;
                return (
                  <div key={i} style={{
                    position: "absolute", left: x, top: y,
                    width: 12, height: 12, borderRadius: "50%",
                    background: i % 3 === 0 ? "#c9a0e8" : "#6b3fa0",
                    animation: `pulseBead 1.8s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                );
              })}
              <div style={{
                position: "absolute", left: "50%", top: "50%",
                transform: "translate(-50%,-50%)",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <div style={{ width: 3, height: 28, background: "#c9a0e8", borderRadius: 2 }} />
                <div style={{ width: 18, height: 3, background: "#c9a0e8", borderRadius: 2, marginTop: -18 }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#c9a0e8", letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>The Holy</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "white", letterSpacing: 1 }}>Rosary</div>
            <div style={{ fontSize: 13, color: "rgba(200,160,232,0.5)", marginTop: 12, fontStyle: "italic" }}>Pray with Mary</div>
          </div>
        )}
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 2, height: 36, background: "rgba(200,160,232,0.5)", borderRadius: 1, margin: "0 auto" }} />
          <div style={{ width: 24, height: 2, background: "rgba(200,160,232,0.5)", borderRadius: 1, marginTop: -22, marginLeft: "auto", marginRight: "auto" }} />
        </div>

        <p style={{ fontSize: 13, color: "rgba(200,160,232,0.65)", letterSpacing: 3, textTransform: "uppercase", margin: "0 0 16px", fontWeight: 600, fontStyle: "italic" }}>
          Dedicated With Love
        </p>
        <p style={{ fontSize: 28, fontWeight: 700, color: "white", margin: "0 0 6px" }}>To My Wife</p>
        <p style={{ fontSize: 24, fontWeight: 700, color: "#c9a0e8", margin: "0 0 24px" }}>Judith</p>

        <hr style={{ width: 48, border: "none", borderTop: "1px solid rgba(200,160,232,0.25)", margin: "0 auto 24px" }} />

        <p style={{ fontSize: 14, color: "rgba(200,160,232,0.8)", lineHeight: 2, fontStyle: "italic", margin: "0 0 24px", textAlign: "center" }}>
          Daughter of the Most High<br/>
          Wife · Bride · Lover · My Person<br/>
          Mother · Sister · Daughter<br/>
          Aunt · Cousin<br/>
          Caring Friend · Loving Neighbor
        </p>

        <hr style={{ width: 48, border: "none", borderTop: "1px solid rgba(200,160,232,0.25)", margin: "0 auto 24px" }} />

        <p style={{ fontSize: 14, color: "rgba(240,230,255,0.85)", lineHeight: 1.9, margin: "0 0 24px", maxWidth: 300 }}>
          Defender of life — the born and unborn.<br/>
          Defender of marriage.<br/>
          Artist of life's most beautiful memories.<br/>
          Consoler and counselor to many.
        </p>

        <hr style={{ width: 48, border: "none", borderTop: "1px solid rgba(200,160,232,0.25)", margin: "0 auto 24px" }} />

        <p style={{ fontSize: 18, color: "#6aabff", fontWeight: 700, lineHeight: 1.8, fontStyle: "italic", maxWidth: 300, margin: "0 0 20px" }}>
          Bravely fighting cancer —<br/>
          one day and one step at a time.
        </p>

        <p style={{ fontSize: 14, color: "rgba(240,230,255,0.75)", lineHeight: 1.9, fontStyle: "italic", maxWidth: 300, margin: "0 0 20px" }}>
          A woman of extraordinary faith and family devotion.
        </p>

        <p style={{ fontSize: 14, color: "white", fontWeight: 700, lineHeight: 1.9, maxWidth: 300, margin: "0 0 24px" }}>
          Please pray with her, for her,<br/>
          and for all people suffering<br/>
          with cancer and other illness.
        </p>

        <hr style={{ width: 48, border: "none", borderTop: "1px solid rgba(200,160,232,0.25)", margin: "0 auto 24px" }} />

        <p style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,215,150,0.95)", letterSpacing: 0.5, margin: "0 0 6px" }}>
          Through Mary to Jesus.
        </p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,215,150,0.95)", letterSpacing: 0.5, margin: "0 0 36px" }}>
          Jesus, we trust in You.
        </p>

        <p style={{ fontSize: 13, color: "rgba(200,160,232,0.65)", fontStyle: "italic", letterSpacing: 0.5, margin: "0 0 20px", fontWeight: 600 }}>
          Rosary App · Built through the night, with love — May 2026
        </p>

        <button
          onClick={() => setShowDedication(false)}
          style={{
            background: "transparent",
            border: "1px solid rgba(200,160,232,0.4)",
            borderRadius: 30, padding: "13px 44px",
            color: "rgba(200,160,232,0.9)",
            fontFamily: "Georgia, serif", fontSize: 15,
            cursor: "pointer", letterSpacing: 1,
          }}
        >
          Begin →
        </button>
      </div>
    );
  }

  // ── HOME SCREEN ──
  if (screen === "home") {
    return (
      <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#faf7fc", display: "flex", flexDirection: "column", fontFamily: "'Lora',serif" }}>
        <style>{CSS}</style>
        {FeedbackPanel}
        {FeedbackViewer}
        {PrayerWarriorPanel}
        {PrayerWall}
        {FeedbackButton}
        <div style={{ background: "linear-gradient(160deg,#2d1b3d,#6b3fa0)", padding: "20px 20px 16px", color: "white" }}>
          <div style={{ fontSize: 12, color: "#c9a0e8", letterSpacing: 2, textTransform: "uppercase" }}>The Holy</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Rosary</div>
        </div>
        <div style={{ padding: "18px", overflowY: "auto" }}>
          <div style={{ fontSize: 12, color: "#7a6680", marginBottom: 8 }}>Choose mysteries</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {["Joyful", "Sorrowful", "Glorious", "Luminous"].map(m => {
              const isSelected = mysterySet === m;
              const isSuggested = defaultMystery === m;
              return (
                <button key={m} onClick={() => setMysterySet(m)} style={{
                  padding: "11px 8px", borderRadius: 12, border: "2px solid",
                  borderColor: isSelected ? "#6b3fa0" : isSuggested ? "#c9a0e8" : "#e8dff0",
                  background: isSelected ? "#f5eeff" : isSuggested ? "#faf5ff" : "white",
                  cursor: "pointer", fontFamily: "'Lora',serif",
                  color: isSelected ? "#6b3fa0" : "#4a3550",
                  transition: "all 0.2s", textAlign: "center",
                }}>
                  <div style={{ fontSize: 14, fontWeight: isSelected ? 700 : 600 }}>{m}</div>
                  <div style={{ fontSize: 10, color: isSelected ? "#8b5cc8" : "#9b8ea0", marginTop: 2, fontStyle: "italic" }}>
                    {MYSTERY_CONTENT[m]?.days}
                  </div>
                  {isSuggested && (
                    <div style={{ fontSize: 9, color: isSelected ? "#6b3fa0" : "#c9a0e8", marginTop: 3, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                      ✦ Suggested
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button onClick={() => { setSequence(buildSequence(mysterySet)); setCurrentStep(0); setScreen("praying"); }} style={{
            width: "100%", background: "#2d1b3d", color: "white", border: "none",
            borderRadius: 14, padding: "15px", fontSize: 16, fontFamily: "'Lora',serif",
            fontWeight: 700, cursor: "pointer", marginBottom: 20,
          }}>
            Begin the Rosary
          </button>
          <div style={{ background: "white", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: 12, color: "#7a6680", marginBottom: 8 }}>{mysterySet} Mysteries</div>
            {MYSTERIES[mysterySet].map((m, i) => (
              <div key={i} style={{ padding: "7px 0", borderBottom: i < 4 ? "1px solid #f0eaf5" : "none", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f0eaf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#6b3fa0", flexShrink: 0, fontWeight: 700 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, color: "#2d1b3d", fontWeight: 600 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: "#9b8ea0", fontStyle: "italic" }}>{m.scripture}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Learn More about the Mysteries */}
          <button onClick={() => setHomeLearnMore(v => !v)} style={{
            width: "100%", marginTop: 12,
            background: homeLearnMore ? "#f5eeff" : "white",
            border: `2px solid ${homeLearnMore ? "#6b3fa0" : "#e8dff0"}`,
            borderRadius: 14, padding: "13px 16px", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "'Lora',serif",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "#6b3fa0", fontWeight: 700, textAlign: "left" }}>
                Learn More About These Mysteries
              </div>
              <div style={{ fontSize: 11, color: "#9b8ea0", textAlign: "left", marginTop: 2 }}>
                Fruit, short prayer & full meditation
              </div>
            </div>
            <span style={{ color: "#6b3fa0", fontSize: 18 }}>{homeLearnMore ? "−" : "+"}</span>
          </button>

          {homeLearnMore && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
              {MYSTERIES[mysterySet].map((m, i) => {
                const content = MYSTERY_CONTENT[mysterySet]?.mysteries[i];
                return (
                  <div key={i} style={{ background: "white", borderRadius: 14, padding: "16px", border: "1px solid #e8dff0" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6b3fa0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", flexShrink: 0, fontWeight: 700 }}>{i + 1}</div>
                      <div>
                        <div style={{ fontSize: 15, color: "#2d1b3d", fontWeight: 700, fontFamily: "'Lora',serif" }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: "#9b8ea0", fontStyle: "italic", fontFamily: "'Lora',serif" }}>{m.scripture}</div>
                      </div>
                    </div>
                    {content?.fruit && (
                      <div style={{ fontSize: 13, color: "#7a4fa6", fontWeight: 600, fontFamily: "'Lora',serif", marginBottom: 8 }}>
                        Fruit: {content.fruit}
                      </div>
                    )}
                    {content?.short && (
                      <div style={{ fontSize: 13, color: "#4a3550", fontFamily: "'Lora',serif", fontStyle: "italic", lineHeight: 1.6, marginBottom: content?.long ? 10 : 0, paddingBottom: content?.long ? 10 : 0, borderBottom: content?.long ? "1px solid #f0eaf5" : "none" }}>
                        "{content.short}"
                      </div>
                    )}
                    {content?.long && (
                      <div style={{ fontSize: 13, color: "#4a3550", fontFamily: "'Lora',serif", lineHeight: 1.75 }}>
                        {content.long}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Copyright */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 8px", gap: 10 }}>
                <img src="data:image/png;base64,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" alt="LOJ Publications" style={{ width: 90, height: 90, objectFit: "contain", filter: "invert(38%) sepia(60%) saturate(500%) hue-rotate(240deg) brightness(60%)" }} />
                <div style={{ fontSize: 12, color: "#7a6680", fontFamily: "'Lora',serif", textAlign: "center", lineHeight: 1.8 }}>
                  LOJ Publications · MRA PRESS<br/>All Rights Reserved
                </div>
              </div>
            </div>
          )}

          <div style={{ height: 24 }} />
        </div>
      </div>
    );
  }

  // ── COMPLETE SCREEN ──
  if (screen === "complete") {
    return (
      <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#1a0d2e", display: "flex", flexDirection: "column", fontFamily: "'Lora',serif" }}>
        <style>{CSS}</style>
        {FeedbackPanel}
        {FeedbackViewer}
        {PrayerWarriorPanel}
        {PrayerWall}
        {FeedbackButton}
        <CompletionScreen onRestart={() => restart(mysterySet)} />
      </div>
    );
  }

  // ── PRAYING SCREEN ──
  return (
    <div style={{
      maxWidth: 390, margin: "0 auto", minHeight: "100vh",
      background: "linear-gradient(180deg, #1a0d2e 0%, #2d1b3d 100%)",
      display: "flex", flexDirection: "column", fontFamily: "'Lora',serif", overflowX: "hidden",
    }}>
      <style>{CSS}</style>
      {FeedbackPanel}
      {FeedbackViewer}
      {PrayerWarriorPanel}
      {PrayerWall}
      {FeedbackButton}

      {/* Stars background */}
      <div style={{
        position: "fixed", inset: 0, maxWidth: 390, margin: "0 auto",
        backgroundImage: "radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 72% 8%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 44% 22%, rgba(255,255,255,0.25) 0%, transparent 100%), radial-gradient(1px 1px at 88% 35%, rgba(255,255,255,0.2) 0%, transparent 100%), radial-gradient(1px 1px at 6% 55%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1px 1px at 93% 68%, rgba(255,255,255,0.25) 0%, transparent 100%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Top bar */}
      <div style={{ padding: "16px 18px 6px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#c9a0e8", cursor: "pointer", fontSize: 13, fontFamily: "'Lora',serif" }}>
            ← Home
          </button>
          <div style={{ fontSize: 12, color: "white", fontFamily: "'Lora',serif", fontWeight: 700 }}>{mysterySet} Mysteries</div>
        </div>
      </div>

      {/* SVG Rosary with Back/Next buttons overlaid on either side of the pendant */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>
        <RosaryShape
          sequence={sequence}
          currentStep={currentStep}
          mini={false}
          mysterySet={mysterySet}
          activeMystery={sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery") ?? null}
          onBeadTap={(i) => { setCurrentStep(i); setExpandedPrayer(null); }}
        />
        {/* Expand All Prayers button — above the Back button */}
        <button onClick={() => setExpandAll(e => !e)} style={{
          position: "absolute",
          left: 16,
          bottom: 78,
          background: expandAll ? "rgba(255,215,150,0.15)" : "rgba(26,13,46,0.85)",
          border: `1px solid ${expandAll ? "rgba(255,215,150,0.5)" : "rgba(200,160,232,0.25)"}`,
          borderRadius: 20, padding: "7px 14px", cursor: "pointer",
          color: expandAll ? "rgba(255,215,150,0.95)" : "#c9a0e8",
          fontFamily: "'Lora',serif", fontSize: 11, fontWeight: 600,
          backdropFilter: "blur(4px)", whiteSpace: "nowrap",
          transition: "all 0.2s",
        }}>
          {expandAll ? "✓ Expand All Prayers" : "Expand All Prayers"}
        </button>
        {/* Back button — left of pendant */}
        <button onClick={goBack} disabled={currentStep === 0} style={{
          position: "absolute",
          left: 16,
          bottom: 28,
          padding: "10px 18px",
          borderRadius: 14,
          border: "1px solid rgba(200,160,232,0.25)",
          background: "rgba(26,13,46,0.85)",
          fontFamily: "'Lora',serif", fontSize: 14,
          cursor: currentStep === 0 ? "not-allowed" : "pointer",
          color: currentStep === 0 ? "rgba(200,160,232,0.25)" : "#c9a0e8",
          fontWeight: 600,
          backdropFilter: "blur(4px)",
        }}>← Back</button>
        {/* Next button — right of pendant */}
        <button onClick={advance} style={{
          position: "absolute",
          right: 16,
          bottom: 28,
          padding: "10px 22px",
          borderRadius: 14, border: "none",
          background: "linear-gradient(135deg,#6b3fa0,#9b6dcc)",
          fontFamily: "'Lora',serif", fontSize: 14,
          cursor: "pointer", color: "white", fontWeight: 700,
          boxShadow: "0 4px 20px rgba(107,63,160,0.5)",
        }}>Next →</button>
      </div>

      {/* Prayer card */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 16px", flex: 1, overflowY: "auto" }}>
        <div style={{ animation: "fadeIn 0.3s ease" }} key={step?.prayer ?? currentStep}>
          {step?.type === "mystery" && (() => {
            const content = MYSTERY_CONTENT[mysterySet]?.mysteries[step.decadeIndex ?? 0];
            if (!content?.long) return null;
            return (
              <button onClick={() => setLearnMore(true)} style={{
                width: "100%", background: "none", border: "1px solid rgba(255,215,150,0.3)",
                borderRadius: 14, padding: "12px", cursor: "pointer",
                color: "rgba(255,215,150,0.8)", fontFamily: "'Lora',serif",
                fontSize: 14, fontWeight: 600, letterSpacing: 0.5,
              }}>
                Learn More ↓
              </button>
            );
          })()}
          {step?.type === "prayer" && (() => {
            const prayerKey = step.prayer;
            const isExpanded = expandAll || expandedPrayer === currentStep || stickyExpanded.has(prayerKey);
            // Also show Learn More if we're in a decade with long content
            const activeMystery = sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery");
            const content = activeMystery ? MYSTERY_CONTENT[mysterySet]?.mysteries[activeMystery.decadeIndex ?? 0] : null;
            return (
              <>
                <PrayerCard
                  step={step}
                  expanded={isExpanded}
                  onToggle={() => {
                    if (isExpanded) {
                      setStickyExpanded(prev => { const s = new Set(prev); s.delete(prayerKey); return s; });
                      setExpandedPrayer(null);
                    } else {
                      setStickyExpanded(prev => new Set(prev).add(prayerKey));
                      setExpandedPrayer(currentStep);
                    }
                  }}
                />
                {content?.long && (
                  <button onClick={() => setLearnMore(true)} style={{
                    width: "100%", marginTop: 10, background: "none",
                    border: "1px solid rgba(255,215,150,0.3)",
                    borderRadius: 14, padding: "12px", cursor: "pointer",
                    color: "rgba(255,215,150,0.8)", fontFamily: "'Lora',serif",
                    fontSize: 14, fontWeight: 600, letterSpacing: 0.5,
                  }}>
                    Learn More ↓
                  </button>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Learn More bottom sheet */}
      {learnMore && (() => {
        const activeMystery = sequence.slice(0, currentStep + 1).reverse().find(s => s.type === "mystery");
        const decadeIdx = activeMystery?.decadeIndex ?? 0;
        const mystery = MYSTERIES[mysterySet]?.[decadeIdx];
        const content = MYSTERY_CONTENT[mysterySet]?.mysteries[decadeIdx];
        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(10,5,20,0.7)",
            display: "flex", alignItems: "flex-end",
          }} onClick={() => setLearnMore(false)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: "100%", maxWidth: 390, margin: "0 auto",
              background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
              borderRadius: "24px 24px 0 0",
              padding: "24px 22px 40px",
              maxHeight: "80vh", overflowY: "auto",
              animation: "fadeIn 0.25s ease",
            }}>
              {/* Handle */}
              <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99, margin: "0 auto 20px" }} />
              {/* Mystery title */}
              <div style={{ fontSize: 11, color: "#9b7aba", fontFamily: "'Lora',serif", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                Mystery {decadeIdx + 1}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0e6ff", fontFamily: "'Lora',serif", marginBottom: 4 }}>
                {mystery?.title}
              </div>
              <div style={{ fontSize: 13, color: "#c9a0e8", fontFamily: "'Lora',serif", fontStyle: "italic", marginBottom: 12 }}>
                {mystery?.scripture}
              </div>
              {/* Fruit */}
              <div style={{ fontSize: 15, color: "rgba(255,215,150,0.9)", fontFamily: "'Lora',serif", fontWeight: 600, marginBottom: 16 }}>
                Fruit of the Mystery: {content?.fruit}
              </div>
              {/* Long text */}
              <div style={{ fontSize: 15, color: "#d4b8f0", fontFamily: "'Lora',serif", lineHeight: 1.85 }}>
                {content?.long}
              </div>
              {/* Close */}
              <button onClick={() => setLearnMore(false)} style={{
                width: "100%", marginTop: 24, background: "rgba(107,63,160,0.4)",
                border: "1px solid rgba(200,160,232,0.2)", borderRadius: 14,
                padding: "13px", color: "#c9a0e8", fontFamily: "'Lora',serif",
                fontSize: 15, cursor: "pointer", fontWeight: 600,
              }}>
                Return to Prayer
              </button>
              {/* Copyright */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24, gap: 10 }}>
                <img src="data:image/png;base64,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" alt="LOJ Publications" style={{ width: 90, height: 90, objectFit: "contain", filter: "invert(70%) sepia(20%) saturate(300%) hue-rotate(240deg) brightness(150%) opacity(0.6)" }} />
                <div style={{ fontSize: 12, color: "rgba(200,160,232,0.5)", fontFamily: "'Lora',serif", textAlign: "center", lineHeight: 1.8 }}>
                  LOJ Publications · MRA PRESS<br/>All Rights Reserved
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
