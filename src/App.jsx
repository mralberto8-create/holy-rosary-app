import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";

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

// ── PIETA PRAYER BOOK DATA ───────────────────────────────────────────────────
// Categories match the Pieta Prayer Book index sections.
// All sections now have placeholders. Full texts still needed for:
// Chaplet of Faith, Hail Mary of Gold, Our Lady of Czestochowa, Our Lady of Ephesus,
// Novena — Glory Be to the Father, St. Bridget's Prayers 4–15, St. Joseph Prayer,
// Three Beautiful Prayers, True Letter, Unity Prayer, Brother Estanislao,
// Letter to Messina, Litany to Sacred Head, Mystic Picture, Why Daily Mass,
// Why Daily Rosary, Rosary Promises of Mary, Graces from Masses.

const PIETA_PRAYERS = [
  // ── SECTION: JUDITH'S FAVORITES ───────────────────────────────────────────
  {
    category: "★ Judith's Favorites",
    prayers: [
      { name: "St. Joseph Prayer", subtitle: "Coming Soon", text: "This prayer will be added soon. Check back for updates." },
    ],
  },
  // ── SECTION: DAILY PRAYERS ────────────────────────────────────────────────
  {
    category: "Daily Prayers",
    prayers: [
      { name: "Sign of the Cross", text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen." },
      { name: "Our Father", text: "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen." },
      { name: "Hail Mary", text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen." },
      { name: "Glory Be", text: "Glory be to the Father, and to the Son, and to the Holy Spirit; as it was in the beginning, is now, and ever shall be, world without end. Amen." },
      { name: "Apostles' Creed", text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen." },
      { name: "Daily Offering", text: "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys and sufferings of this day for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all our associates, and in particular for the intention recommended this month by the Holy Father. Amen." },
      { name: "Morning Offering", subtitle: "Act of Dedication", text: "O my God, in union with the Immaculate Heart of Mary, I offer Thee the Precious Blood of Jesus from all the altars throughout the world, joining with it the offering of my every thought, word, and action of this day.\n\nO my Jesus, I desire today to gain every indulgence and merit I can, and I offer them, together with myself, to Mary Immaculate — that she may best apply them to the interests of Thy most Sacred Heart. Precious Blood of Jesus, save us! Immaculate Heart of Mary, pray for us! Sacred Heart of Jesus, have mercy on us! Amen." },
      { name: "Evening Prayer", text: "O my God, I thank Thee for all the benefits which I have ever received from Thee, and particularly for those of this day. Give me light to see what sins I have committed, and grant me grace to be truly sorry for them.\n\nI have sinned against Thee, O Lord, have mercy on me. Examine your conscience.\n\nI am sorry for having offended Thee, O Lord. I firmly resolve, with the help of Thy grace, to avoid sin and the near occasion of sin, and to confess my sins as soon as possible. Amen.\n\nRemember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother! To thee I come; before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen." },
      { name: "Angelus", subtitle: "Prayed at 6am, noon, and 6pm", text: "V. The Angel of the Lord declared unto Mary.\nR. And she conceived of the Holy Spirit.\n\nHail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.\n\nV. Behold the handmaid of the Lord.\nR. Be it done unto me according to thy word.\n\nHail Mary...\n\nV. And the Word was made flesh.\nR. And dwelt among us.\n\nHail Mary...\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ.\n\nLet us pray: Pour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we to whom the Incarnation of Christ Thy Son was made known by the message of an Angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen." },
    ],
  },
  // ── SECTION: ACTS ─────────────────────────────────────────────────────────
  {
    category: "Acts",
    prayers: [
      { name: "Act of Faith", text: "O my God, I firmly believe that Thou art one God in three Divine Persons, Father, Son and Holy Spirit. I believe that Thy divine Son became man, and died for our sins, and that He will come to judge the living and the dead. I believe these and all the truths which the holy Catholic Church teaches, because Thou hast revealed them, Who canst neither deceive nor be deceived. Amen." },
      { name: "Act of Hope", text: "O my God, relying on Thy almighty power and infinite mercy and promises, I hope to obtain pardon of my sins, the help of Thy grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen." },
      { name: "Act of Love", text: "O my God, I love Thee above all things, with my whole heart and soul, because Thou art all good and worthy of all love. I love my neighbor as myself for the love of Thee. I forgive all who have injured me, and ask pardon of all whom I have injured. Amen." },
      { name: "Act of Contrition", text: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen." },
      { name: "St. Joseph Prayer", subtitle: "Coming Soon", text: "This prayer will be added soon. Check back for updates." },
      { name: "Daily Neglects Prayer", text: "O Lord Jesus, I ask forgiveness for the daily neglects I have committed this day:\n\nFor the times I have failed to offer up my sufferings.\nFor the times I have not accepted the cross Thou hast given me.\nFor the times I have not striven to overcome my faults.\nFor the times I have not praised or thanked Thee.\nFor the times I have missed opportunities to do good.\nFor the times I have not prayed with attention and devotion.\nFor the times I have neglected the inspirations of the Holy Spirit.\n\nO Jesus, I am sorry for all these daily neglects. Have mercy on me. Grant me the grace to be more faithful to Thee in the days ahead. Through the intercession of Thy most holy Mother Mary, help me to grow in love and in the practice of virtue. Amen." },
    ],
  },
  // ── SECTION: CHAPLETS ─────────────────────────────────────────────────────
  {
    category: "Chaplets",
    prayers: [
      {
        name: "Chaplet of Faith",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "Divine Mercy Chaplet",
        subtitle: "As given to St. Faustina Kowalska",
        history: "According to her spiritual diary, Jesus Christ appeared to St. Faustina on February 22, 1931, in Płock, Poland, and instructed her to have an image painted with the signature \"Jesus, I trust in You.\" This marked the beginning of the worldwide Divine Mercy devotion, which emphasizes complete reliance on God's mercy.",
        intro: "Begin with the Our Father, Hail Mary, and Apostles' Creed. Then on the large beads say the Eternal Father prayer; on the 10 small beads say the For the Sake prayer. Repeat for 5 decades. Close with the Holy God prayer (3 times).",
        text: "OPENING (once):\nOur Father... Hail Mary... Apostles' Creed...\n\nON THE LARGE BEADS (once per decade):\nEternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world.\n\nON THE 10 SMALL BEADS (each decade):\nFor the sake of His sorrowful Passion, have mercy on us and on the whole world.\n\n— Repeat for all 5 decades —\n\nCLOSING (3 times):\nHoly God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.\n\nOPTIONAL CLOSING PRAYER:\nEternal God, in whom mercy is endless and the treasury of compassion inexhaustible, look kindly upon us and increase Your mercy in us, that in difficult moments we might not despair nor become despondent, but with great confidence submit ourselves to Your holy will, which is Love and Mercy itself. Amen.",
      },
      {
        name: "Chaplet of St. Michael",
        subtitle: "In honor of the 9 Choirs of Angels",
        intro: "Pray one Our Father and three Hail Marys after each of the nine salutations. Close with four Our Fathers in honor of St. Michael, St. Gabriel, St. Raphael, and your Guardian Angel.",
        text: "By the intercession of St. Michael and the celestial Choir of Seraphim, may the Lord make us worthy to burn with the fire of perfect charity. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Cherubim, may the Lord grant us grace to leave the ways of sin and run in the paths of Christian perfection. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Thrones, may the Lord infuse into our hearts a true and sincere spirit of humility. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Dominations, may the Lord give us grace to govern our senses and overcome any unruly passions. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Virtues, may the Lord preserve us from evil and falling into temptation. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Powers, may the Lord protect our souls against the snares and temptations of the devil. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Principalities, may God fill our souls with a true spirit of obedience. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of Archangels, may the Lord give us perseverance in faith and in all good works in order that we may attain the glory of paradise. Amen.\n(1 Our Father, 3 Hail Marys)\n\nBy the intercession of St. Michael and the celestial Choir of all the Angels, may the Lord grant us to be protected by them in this mortal life and conducted in the life to come to heaven. Amen.\n(1 Our Father, 3 Hail Marys)\n\nCLOSING (4 Our Fathers):\nO glorious prince St. Michael, chief and commander of the heavenly hosts, guardian of souls, vanquisher of rebel spirits, servant in the house of the Divine King — deliver us from all evil who turn to you with confidence, and enable us by your gracious protection to serve God more and more faithfully every day. Amen.",
      },
    ],
  },
  // ── SECTION: CONSECRATIONS ────────────────────────────────────────────────
  {
    category: "Consecrations",
    prayers: [
      {
        name: "Consecration to the Blessed Virgin Mary",
        text: "My Queen and my Mother, I give myself entirely to thee, and to show my devotion to thee, I consecrate to thee this day my eyes, my ears, my mouth, my heart, my whole being without reserve.\n\nWherefore, good Mother, as I am your own, keep me, guard me, as your property and possession. Amen.\n\nO Mary, my Queen, I consecrate to thee my body and soul, my goods, both interior and exterior, and even the value of all my good actions, past, present, and future; leaving to thee the entire and full right of disposing of me and all that belongs to me, without exception, according to thy good pleasure, for the greater glory of God, in time and in eternity. Amen.",
      },
      {
        name: "Consecration to Jesus Christ",
        text: "Lord Jesus Christ, I consecrate myself today anew and without reserve to Thy divine Heart.\n\nI consecrate to Thee my body with all its senses, my soul with all its faculties, my entire being. I consecrate to Thee all my thoughts, words, and deeds, all my sufferings and labors, all my hopes, consolations, and joys. In particular I consecrate to Thee this poor heart of mine, so that it may love only Thee and be consumed as a victim in the fires of Thy love.\n\nI place my trust not in my own merits but solely in the merits of Thy most Sacred Heart. Amen.",
      },
      {
        name: "Consecration for the Last Two Hours",
        subtitle: "To be prayed at the time of death or for the dying",
        intro: "A prayer of consecration and trust for the final hours of life, or to be offered for those who are dying.",
        text: "O Jesus, through the most pure Heart of Mary, I offer Thee all the prayers, works, joys, sufferings, and the precious moments that remain to me in this life.\n\nI unite them with the merits of Thy Passion and Death, and with the intercession of Thy most holy Mother, the angels, and all the saints.\n\nI offer them for the salvation of souls, for the intentions of the Holy Father, for the poor souls in purgatory, and especially for those who are now in their final agony, that they may not be lost.\n\nMay the souls of all the faithful departed, through the mercy of God, rest in peace. Amen.\n\nO Mary, Mother of grace, Mother of mercy — shield us from the enemy and receive us at the hour of death. Amen.",
      },
    ],
  },
  // ── SECTION: PRAYERS TO JESUS CHRIST ─────────────────────────────────────
  {
    category: "Prayers to Jesus Christ",
    prayers: [
      {
        name: "Anima Christi",
        subtitle: "Soul of Christ — 14th century",
        text: "Soul of Christ, sanctify me.\nBody of Christ, save me.\nBlood of Christ, inebriate me.\nWater from the side of Christ, wash me.\nPassion of Christ, strengthen me.\nO Good Jesus, hear me.\nWithin Thy wounds, hide me.\nSuffer me not to be separated from Thee.\nFrom the malicious enemy defend me.\nIn the hour of my death call me,\nAnd bid me come unto Thee,\nThat I may praise Thee with Thy saints\nAnd with Thy angels forever and ever. Amen.",
      },
      {
        name: "Prayer Before the Crucifix",
        text: "Behold, O good and sweetest Jesus, I cast myself upon my knees in Thy sight, and with the most fervent desire of my soul I pray and beseech Thee that Thou wouldst impress upon my heart lively sentiments of faith, hope, and charity, with true repentance for my sins and a firm desire of amendment.\n\nWhile with deep affection and grief of soul I ponder within myself and mentally contemplate Thy five most precious wounds, having before mine eyes that which David spoke in prophecy of Thee, O good Jesus:\n\n\"They have pierced my hands and my feet; they have numbered all my bones.\" Amen.",
      },
      {
        name: "Prayer to the Holy Face",
        subtitle: "For reparation and mercy",
        text: "O Lord Jesus, in offering Thee this prayer, I unite myself to the intentions of Thy holy Face.\n\nO adorable Face of Jesus, more beautiful than the sun, more dazzling than the lightning — I adore Thee, I love Thee, I offer Thee all my actions.\n\nGrant me, O Lord, to walk always in Thy light. Enlighten my soul as Thou dost enlighten the countenance of Thy saints. Draw me to Thyself through the veil of Thy holy humanity, to the glory of Thy divinity.\n\nO Face of Jesus, I adore Thee with all the love of my heart. Amen.\n\nEternal Father, I offer Thee the adorable Face of Thy beloved Son for the honor and glory of Thy name, for the conversion of sinners, and for the salvation of the dying. Amen.",
      },
      {
        name: "Prayer to the Sacred Head",
        subtitle: "Wound of the Crown of Thorns",
        text: "O most merciful Jesus, lover of souls, I pray Thee, by the agony of Thy most Sacred Heart, and by the sorrows of Thy Immaculate Mother, to wash in Thy most Precious Blood the sinners of the whole world who are now in their agony and who are to die this day.\n\nO adorable Sacred Head of my Lord Jesus Christ, crowned with thorns — I adore Thee. I venerate Thy crown of thorns, so painful and so ignominious, placed upon Thy most holy head. I offer Thee my own head, my thoughts, my desires, my will.\n\nO Jesus, meek and humble of heart, make my heart like unto Thine. Amen.",
      },
      {
        name: "Prayer to the Holy Wounds",
        subtitle: "For the souls in purgatory",
        text: "Eternal Father, I offer Thee the wounds of Our Lord Jesus Christ to heal the wounds of our souls.\n\nMy Jesus, pardon and mercy through the merits of Thy holy wounds.\n\nO my Jesus, I adore Thy most precious wounds. I unite myself to the merits of Thy Passion, and I offer to Thy Eternal Father the drops of Thy Precious Blood which fell for the sins of men.\n\nI offer them for sinners; I offer them for all the souls in purgatory; I offer them for myself. Have mercy, O Lord, on all for whom Thy Blood was shed. Amen.",
      },
      {
        name: "Prayer to the Shoulder Wound",
        subtitle: "The most neglected wound of Our Lord",
        intro: "Our Lord revealed to St. Bernard that the wound in His shoulder, caused by carrying the heavy cross, was the most painful of all His wounds and the most neglected.",
        text: "O loving Jesus, meek Lamb of God, I, a miserable sinner, salute and worship the most sacred wound of Thy shoulder on which Thou didst bear Thy heavy cross, which so tore Thy flesh and laid bare Thy bones as to inflict anguish greater than any other wound of Thy most blessed Body.\n\nI adore Thee, O Jesus most sorrowful; I praise and glorify Thee, and give Thee thanks for this most sacred and painful wound, beseeching Thee that by this wound Thou wilt grant me Thy grace to carry my cross and follow Thee all the days of my life.\n\nAmen.",
      },
    ],
  },
  // ── SECTION: PRAYERS TO OUR LADY ─────────────────────────────────────────
  {
    category: "Prayers to Our Lady",
    prayers: [
      { name: "Hail Mary of Gold", subtitle: "Coming Soon", text: "This prayer will be added soon. Check back for updates." },
      { name: "Our Lady of Czestochowa", subtitle: "Coming Soon", text: "This prayer will be added soon. Check back for updates." },
      { name: "Our Lady of Ephesus", subtitle: "Coming Soon", text: "This prayer will be added soon. Check back for updates." },
      { name: "Rosary Promises of Mary", subtitle: "Coming Soon", text: "This reflection will be added soon. Check back for updates." },
      { name: "Hail Holy Queen", subtitle: "Salve Regina", text: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary!\n\nV. Pray for us, O holy Mother of God.\nR. That we may be made worthy of the promises of Christ." },
      { name: "Memorare", text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession, was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother! To thee I come; before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen." },
      { name: "Magnificat", subtitle: "Canticle of Mary — Luke 1:46–55", text: "My soul proclaims the greatness of the Lord,\nmy spirit rejoices in God my Savior\nfor He has looked with favor on His lowly servant.\n\nFrom this day all generations will call me blessed:\nthe Almighty has done great things for me,\nand holy is His Name.\n\nHe has mercy on those who fear Him\nin every generation.\n\nHe has shown the strength of His arm,\nHe has scattered the proud in their conceit.\n\nHe has cast down the mighty from their thrones,\nand has lifted up the lowly.\n\nHe has filled the hungry with good things,\nand the rich He has sent away empty.\n\nHe has come to the help of His servant Israel\nfor He has remembered His promise of mercy,\nthe promise He made to our fathers,\nto Abraham and his children forever. Amen." },
      { name: "Ave Maris Stella", subtitle: "Hail, Star of the Sea", text: "Hail, bright star of ocean,\nGod's own Mother blest,\nEver sinless Virgin,\nGate of heavenly rest.\n\nTaking that sweet Ave\nWhich from Gabriel came,\nPeace confirm within us,\nChanging Eva's name.\n\nBreak the captives' fetters,\nLight on blindness pour,\nAll our ills expelling,\nEvery bliss implore.\n\nShow thyself a Mother;\nMay the Word Divine,\nBorn for us thy Infant,\nHear our prayers through thine.\n\nVirgin all excelling,\nMildest of the mild,\nFreed from guilt, preserve us,\nPure and undefiled.\n\nKeep our life all spotless,\nMake our way secure,\nTill we find in Jesus\nJoy forevermore.\n\nThrough the highest heaven\nTo the Almighty Three,\nFather, Son and Spirit,\nOne same glory be. Amen." },
      { name: "Flos Carmeli", subtitle: "Flower of Carmel", text: "Flower of Carmel,\nTall vine blossom laden;\nSplendor of heaven,\nChildbearing yet maiden.\nNone equals thee.\n\nMother so tender,\nWho no man didst know,\nOn Carmel's children\nThy favors bestow.\nStar of the Sea. Amen." },
      {
        name: "Devotion to the Sorrowful & Immaculate Heart of Mary",
        text: "O most holy Heart of Mary, full of goodness, show thy love toward us. Let the flame of thy heart, O Mary, descend upon all people. We love thee so much. We long so much that thou be adored.\n\nO Mary, sweet Mother, show us thy love for us. May all who ask thy intercession feel the power of thy motherly heart. O Mary, meek and humble of heart, remember us when we sin.\n\nO Immaculate Heart of Mary, burning with love for God and for souls, be thou the way that leads to God. In thee let our hearts find rest, in thy sorrows our consolation, in thy arms our refuge. Amen.",
      },
      {
        name: "Golden Arrow",
        subtitle: "As given to Sr. Mary of St. Peter, 1843",
        intro: "Our Lord revealed to Sr. Mary of St. Peter that souls who would recite this prayer would console Him for blasphemies against His Holy Name.",
        text: "May the most holy, most sacred, most adorable, most incomprehensible and unutterable Name of God be always praised, blessed, loved, adored and glorified, in heaven, on earth, and under the earth, by all the creatures of God, and by the Sacred Heart of Our Lord Jesus Christ in the Most Holy Sacrament of the Altar. Amen.",
      },
    ],
  },
  // ── SECTION: PRAYERS FOR PROTECTION ──────────────────────────────────────
  {
    category: "Prayers for Protection",
    prayers: [
      { name: "Guardian Angel Prayer", text: "Angel of God, my guardian dear,\nTo whom God's love commits me here,\nEver this day be at my side,\nTo light and guard, to rule and guide. Amen." },
      { name: "St. Michael Prayer", text: "Saint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly hosts, by the power of God, thrust into hell Satan, and all the evil spirits who prowl about the world seeking the ruin of souls. Amen." },
      { name: "Come, Holy Spirit", text: "Come, Holy Spirit, fill the hearts of Thy faithful and kindle in them the fire of Thy love.\n\nV. Send forth Thy Spirit and they shall be created.\nR. And Thou shalt renew the face of the earth.\n\nLet us pray: O God, Who didst instruct the hearts of the faithful by the light of the Holy Spirit, grant us by the same Spirit to have a right judgment in all things and evermore to rejoice in His consolation. Through Christ Our Lord. Amen." },
      {
        name: "Prayer to Defeat Satan",
        text: "O Divine Eternal Father, in union with Thy Divine Son and the Holy Spirit, and through the Immaculate Heart of Mary, I beg Thee to destroy the power of Thy greatest enemy — the evil spirits.\n\nCast them into the deepest recesses of hell and chain them there forever! Take possession of Thy Kingdom which Thou hast created and which is rightfully Thine.\n\nHeavenly Father, give us the reign of the Sacred Heart of Jesus and the Immaculate Heart of Mary. I repeat this prayer out of pure love for Thee with every beat of my heart and with every breath I take. Amen.",
      },
      {
        name: "Blessing Against Storm",
        text: "Jesus Christ, a King of glory, has come in peace. God became man, and the Word was made flesh. Christ was born of a Virgin. Christ suffered. Christ was crucified. Christ died. Christ rose from the dead. Christ ascended into heaven. Christ conquers. Christ reigns. Christ orders. May Christ protect us from all storms and lightning.\n\nChrist went through their midst in peace, and the word was made flesh. Christ is with us, Maria. Flee, ye enemy spirits, because the Lion of the tribe of Judah, the root of David, has won. Holy God! Holy, Mighty God! Holy, Immortal God! Have mercy on us. Amen.",
      },
    ],
  },
  // ── SECTION: PURGATORY / PRAYERS FOR THE DEPARTED ────────────────────────
  {
    category: "Purgatory & Prayers for the Departed",
    prayers: [
      {
        name: "St. Gertrude's Prayer",
        subtitle: "For the Holy Souls in Purgatory",
        intro: "Our Lord told St. Gertrude the Great that the following prayer would release 1,000 souls from purgatory each time it is said.",
        text: "Eternal Father, I offer Thee the Most Precious Blood of Thy Divine Son, Jesus, in union with the Masses said throughout the world today, for all the Holy Souls in Purgatory, for sinners everywhere, for sinners in the universal Church, those in my own home and within my family. Amen.",
      },
      { name: "Prayer for the Holy Souls", text: "O God, the Creator and Redeemer of all the faithful, grant to the souls of Thy servants departed the remission of all their sins, that through our pious supplications they may obtain that pardon which they have always desired. Thou who livest and reignest world without end. Amen.\n\nEternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.\n\nMay their souls and the souls of all the faithful departed, through the mercy of God, rest in peace. Amen." },
      { name: "De Profundis", subtitle: "Psalm 130 — For the Dead", text: "Out of the depths I cry to Thee, O Lord;\nLord, hear my voice!\nLet Thine ears be attentive\nTo the voice of my supplications.\n\nIf Thou, O Lord, shouldst mark iniquities,\nLord, who could stand?\nBut there is forgiveness with Thee,\nThat Thou mayest be feared.\n\nI wait for the Lord, my soul waits,\nAnd in His word I hope;\nMy soul waits for the Lord\nMore than watchmen for the morning.\n\nO Israel, hope in the Lord!\nFor with the Lord there is steadfast love,\nAnd with Him is plenteous redemption.\nAnd He will redeem Israel\nFrom all his iniquities.\n\nEternal rest grant unto them, O Lord,\nAnd let perpetual light shine upon them.\nMay they rest in peace. Amen." },
      {
        name: "Cemetery Visit Prayer",
        text: "O God, Lord of mercies, grant to the souls of Thy servants and handmaidens, whose anniversary we commemorate, a place of cool repose, the blessedness of quiet, the brightness of light.\n\nThrough Christ our Lord. Amen.\n\nEternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.\n\nV. From the gate of hell...\nR. Deliver their souls, O Lord.\n\nV. May they rest in peace.\nR. Amen.\n\nV. O Lord, hear my prayer.\nR. And let my cry come unto Thee.",
      },
    ],
  },
  // ── SECTION: LITANIES ─────────────────────────────────────────────────────
  {
    category: "Litanies",
    prayers: [
      {
        name: "Litany to the Sacred Head",
        subtitle: "Coming Soon",
        text: "This litany will be added soon. Check back for updates.",
      },
      {
        name: "Litany of Humility",
        subtitle: "Cardinal Merry del Val (1865–1930)",
        text: "O Jesus, meek and humble of heart, hear me.\n\nFrom the desire of being esteemed, deliver me, Jesus.\nFrom the desire of being loved, deliver me, Jesus.\nFrom the desire of being extolled, deliver me, Jesus.\nFrom the desire of being honored, deliver me, Jesus.\nFrom the desire of being praised, deliver me, Jesus.\nFrom the desire of being preferred to others, deliver me, Jesus.\nFrom the desire of being consulted, deliver me, Jesus.\nFrom the desire of being approved, deliver me, Jesus.\n\nFrom the fear of being humiliated, deliver me, Jesus.\nFrom the fear of being despised, deliver me, Jesus.\nFrom the fear of suffering rebukes, deliver me, Jesus.\nFrom the fear of being calumniated, deliver me, Jesus.\nFrom the fear of being forgotten, deliver me, Jesus.\nFrom the fear of being ridiculed, deliver me, Jesus.\nFrom the fear of being wronged, deliver me, Jesus.\nFrom the fear of being suspected, deliver me, Jesus.\n\nThat others may be loved more than I, Jesus grant me the grace to desire it.\nThat others may be esteemed more than I, Jesus grant me the grace to desire it.\nThat, in the opinion of the world, others may increase and I may decrease, Jesus grant me the grace to desire it.\nThat others may be chosen and I set aside, Jesus grant me the grace to desire it.\nThat others may be praised and I go unnoticed, Jesus grant me the grace to desire it.\nThat others may be preferred to me in everything, Jesus grant me the grace to desire it.\nThat others may become holier than I, provided that I may become as holy as I should, Jesus grant me the grace to desire it. Amen.",
      },
    ],
  },
  // ── SECTION: NOVENAS ──────────────────────────────────────────────────────
  {
    category: "Novenas",
    prayers: [
      {
        name: "Novena — Glory Be to the Father",
        subtitle: "Coming Soon",
        text: "This novena will be added soon. Check back for updates.",
      },
      {
        name: "54-Day Rosary Novena",
        subtitle: "27 days petition + 27 days thanksgiving",
        intro: "Pray five decades of the Rosary each day for 54 consecutive days. The first 27 days are in petition; the final 27 days are in thanksgiving — prayed as if the grace has already been granted.",
        text: "This novena was first prayed in Naples, Italy in 1884. A young woman named Fortuna Agrelli, gravely ill and given up by doctors, was cured after praying this novena. Our Lady appeared to her on the last day and said:\n\n\"Whoever desires to obtain favors from me should make three novenas of the prayers of the Rosary in petition, and three novenas in thanksgiving.\"\n\nDAYS 1–27 (Petition):\nPray five decades of the Rosary each day. After each decade, add:\n\n\"O my Queen, my Mother, I give myself entirely to you, and to show my devotion to you, I consecrate to you this day my eyes, my ears, my mouth, my heart, my whole being without reserve. Wherefore, good Mother, as I am your own, keep me, guard me as your property and possession. Amen.\"\n\nDAYS 28–54 (Thanksgiving):\nContinue praying five decades of the Rosary each day, now in gratitude — trusting that Our Lady has heard your petition and interceded with her Son on your behalf.\n\n\"Most Holy Virgin, Mother of God, I thank you for the graces you have granted me through this novena. I offer you my love and gratitude, and I renew my consecration to you. Keep me always close to your Immaculate Heart, and guide me to your Son, Jesus. Amen.\"",
      },
      {
        name: "Novena to St. Thérèse",
        subtitle: "The Little Flower — 9-day novena",
        intro: "Pray once each day for nine consecutive days, along with five decades of the Rosary.",
        text: "O Little Thérèse of the Child Jesus, please pick for me a rose from the heavenly gardens and send it to me as a message of love.\n\nO Little Flower of Jesus, ask God today to grant the favors I now place with confidence in your hands.\n\n(Mention your specific intentions here.)\n\nSt. Thérèse, help me to always believe, as you did, in God's great love for me, so that I might imitate your \"Little Way\" each day.\n\nAmen.\n\n—\n\nSt. Thérèse, you said that you would spend your heaven doing good on earth and that you would let fall a shower of roses. Through the intercession of Our Lady, obtain for me from God the graces I hope for with so much confidence.\n\nYou loved God so much during your life on earth; kindle in my heart a flame of that same love. And in return for all the roses you send me, I will love God more and more, and one day I will come to heaven to thank you.\n\nSt. Thérèse of the Child Jesus, pray for us.",
      },
      {
        name: "Novena to the Infant of Prague",
        subtitle: "9-day prayer for urgent intentions",
        intro: "Pray once each day for nine consecutive days.",
        text: "O Jesus, who said, 'Ask and you shall receive, seek and you shall find, knock and it shall be opened to you,' through the intercession of Mary, Your most holy Mother, I knock, I seek, I ask that my prayer be granted.\n\n(Mention your intention.)\n\nO Jesus, who said, 'All that you ask of the Father in My Name, He will grant you,' through the intercession of Mary, Your most holy Mother, I humbly and urgently ask your Father in Your Name that my prayer be granted.\n\n(Mention your intention.)\n\nO Jesus, who said, 'Heaven and earth shall pass away but My word shall not pass away,' through the intercession of Mary, Your most holy Mother, I feel confident that my prayer will be granted.\n\n(Mention your intention.)\n\nO Infant Jesus, I believe in Your love for me. I trust in Your promises. I consecrate myself entirely to You. I surrender to Your will, whatever it may be. And I ask You, with confidence born of love and trust, to hear my prayer.\n\nInfant Jesus, have mercy on me. Amen.",
      },
      {
        name: "Jesus, King of All Nations",
        subtitle: "Prayer of consecration and petition",
        text: "O Jesus, King of all nations, may Your reign be recognized on earth.\n\nI acknowledge Your kingship and I consecrate myself to You. Rule over me, Lord Jesus, and grant that Your Kingdom may come into every area of my life and into the whole world.\n\nLord Jesus, King of all nations, have mercy on us and on the whole world. Deliver us from the power of evil. Protect the Church and guide her. Unite all peoples under Your gentle and loving reign.\n\nO Lord Jesus, we turn to You in our need. Stretch out Your almighty hand over us, over our families, over our nation, and over the world. You are our King — come and reign. Our hearts are Your throne.\n\nJesus, King of all nations, I trust in You.\nJesus, King of all nations, I believe in You.\nJesus, King of all nations, I love You.\n\nAmen.",
      },
      {
        name: "Sacred Heart Novena",
        subtitle: "9-day novena of trust",
        intro: "Pray once each day for nine consecutive days. This novena is especially powerful when prayed with the Act of Consecration to the Sacred Heart.",
        text: "O my Jesus, Thou hast said: 'Truly I say to you, ask and you will receive, seek and you will find, knock and it will be opened to you.' Behold, I knock; I seek and I ask for the grace of:\n\n(Mention your intention.)\n\nOur Father... Hail Mary... Glory Be...\n\nO Sacred Heart of Jesus, I place all my trust in Thee.\n\n—\n\nO my Jesus, Thou hast said: 'Truly I say to you, if you ask anything of the Father in My name, He will give it to you.' Behold, in Thy name I ask the Father for the grace of:\n\n(Mention your intention.)\n\nOur Father... Hail Mary... Glory Be...\n\nO Sacred Heart of Jesus, I place all my trust in Thee.\n\n—\n\nO my Jesus, Thou hast said: 'Truly I say to you, heaven and earth will pass away but My words will not pass away.' Encouraged by Thy infallible words, I now ask for the grace of:\n\n(Mention your intention.)\n\nOur Father... Hail Mary... Glory Be...\n\nO Sacred Heart of Jesus, I place all my trust in Thee.\n\nO Sacred Heart of Jesus, for whom it is impossible not to have compassion on the afflicted, have pity on us miserable sinners and grant us the grace which we ask of Thee, through the Sorrowful and Immaculate Heart of Mary, Thy tender Mother and ours.\n\nHail, Guardian of the Redeemer, Spouse of the Blessed Virgin Mary. To you God entrusted His only Son; in you Mary placed her trust; with you Christ became man. Blessed Joseph, to us too, show yourself a father and guide us in the way of life. Obtain for us grace, mercy, and courage, and defend us from every evil. Amen.",
      },
    ],
  },
  // ── SECTION: PRAYERS OF THE SAINTS ───────────────────────────────────────
  {
    category: "Prayers of the Saints",
    prayers: [
      {
        name: "St. Bridget's Prayers",
        subtitle: "15 Prayers of St. Bridget of Sweden (d. 1373)",
        intro: "Our Lord promised St. Bridget that whoever prayed these 15 prayers for one year would free 15 souls from purgatory, convert 15 sinners, and receive many other graces. The prayers meditate on the wounds and Passion of Christ.",
        text: "1. O Jesus Christ, Eternal Sweetness to those who love Thee, joy surpassing all joy and all desire, Salvation and Hope of all sinners, Who hast proved that Thou hast no greater desire than to be among men, even assuming human nature at the fullness of time for the love of men, recall all the sufferings Thou hast endured from the instant of Thy conception, and especially during Thy Passion, as it was decreed and ordained from all eternity in the Divine plan. Remember, O Lord, that during the Last Supper with Thy disciples, having washed their feet, Thou gavest them Thy most precious Body and Blood, and while gently consoling them, Thou didst foretell Thy coming Passion. Remember the sadness and bitterness which Thou didst experience in Thy Soul as Thou Thyself bore witness saying: 'My Soul is sorrowful even unto death.' Remember all the fear, anguish and pain that Thou didst suffer in Thy delicate Body before the torment of the Crucifixion, when, after praying three times, bathed in a sweat of blood, Thou wast betrayed by Judas, Thy disciple, arrested by the mob, accused by false witnesses, unjustly judged by three judges, condemned though innocent, and publicly mocked. Remember that Thou wast stripped of Thy garments and clothed in those of derision; that Thy Face and Eyes were veiled, that Thou wast buffeted, crowned with thorns, given a reed in Thy Hands, that Thou wast crushed with blows and overwhelmed with affronts and outrages. In memory of all these pains and sufferings which Thou didst endure before Thy Passion on the Cross, grant me before my death true contrition, a sincere and entire confession, worthy satisfaction and the remission of all my sins. Amen.\n\n2. O Jesus, true liberty of Angels, Paradise of delights, remember the horror and sadness which Thou didst endure when Thy enemies, like furious lions, surrounded Thee, and by thousands of insults, spits, blows, lacerations and other unheard-of cruelties, tormented Thee at will. In consideration of these torments and insulting words, I beseech Thee, O my Savior, to deliver me from all my enemies, visible and invisible, and to bring me, under Thy protection, to the perfection of eternal salvation. Amen.\n\n3. O Jesus, Creator of Heaven and earth, Whom nothing can encompass or limit, Thou Who dost enfold and hold all things in Thy loving arms, remember the very bitter pain Thou didst suffer when the Jews nailed Thy sacred Hands and Feet to the Cross by blow after blow with big and blunt nails, and not finding Thee in a pitiable enough state to satisfy their rage, they enlarged Thy Wounds, and added new pains to Thy torture. In consideration of the anguish this caused Thee, I implore Thee, O Lord and God, to grant me, I who am a sinner, to have fear of Thee, true penitence, and amendment of my life. Amen.\n\n(Continue with prayers 4–15 from the Pieta Prayer Book, pages 8–15.)",
      },
      {
        name: "St. Bridget's Prayers 4–15",
        subtitle: "Coming Soon",
        text: "The remaining 12 of the 15 Prayers of St. Bridget of Sweden will be added soon. Check back for updates.",
      },
      {
        name: "Three Beautiful Prayers",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "True Letter",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "Unity Prayer",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "Brother Estanislao",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "Letter to Messina",
        subtitle: "Coming Soon",
        text: "This prayer will be added soon. Check back for updates.",
      },
      {
        name: "Mystic Picture",
        subtitle: "Coming Soon",
        text: "This reflection will be added soon. Check back for updates.",
      },
      {
        name: "Prayer of St. Francis",
        subtitle: "Make Me an Instrument of Thy Peace",
        text: "Lord, make me an instrument of Thy peace.\nWhere there is hatred, let me sow love;\nWhere there is injury, pardon;\nWhere there is doubt, faith;\nWhere there is despair, hope;\nWhere there is darkness, light;\nWhere there is sadness, joy.\n\nO Divine Master, grant that I may not so much seek\nTo be consoled as to console,\nTo be understood as to understand,\nTo be loved as to love.\n\nFor it is in giving that we receive;\nIt is in pardoning that we are pardoned;\nAnd it is in dying that we are born to eternal life. Amen.",
      },
      {
        name: "Radiating Christ",
        subtitle: "Fr. Pedro Arrupe SJ (1907–1991)",
        text: "Lord Jesus,\nHelp me to spread Your fragrance everywhere I go.\nFlood my soul with Your spirit and life.\nPenetrate and possess my whole being so utterly that all my life may only be a radiance of Yours.\n\nShine through me, and be so in me that every soul I come in contact with may feel Your presence in my soul. Let them look up and see no longer me, but only Jesus.\n\nStay with me and then I shall begin to shine as You shine, so to shine as to be a light to others. The light, O Jesus, will be all from You; none of it will be mine. It will be You shining on others through me.\n\nLet me thus praise You in the way You love best — by shining on those around me. Let me preach You without preaching, not by words but by my example, by the catching force, the sympathetic influence of what I do, the evident fullness of the love my heart bears to You.\n\nAmen.",
      },
    ],
  },
  // ── SECTION: SPIRITUAL COMMUNION & MASS ──────────────────────────────────
  {
    category: "Spiritual Communion & Mass",
    prayers: [
      { name: "Why Daily Mass", subtitle: "Coming Soon", text: "This reflection will be added soon. Check back for updates." },
      { name: "Why Daily Rosary", subtitle: "Coming Soon", text: "This reflection will be added soon. Check back for updates." },
      { name: "Graces from Masses", subtitle: "Coming Soon", text: "This reflection will be added soon. Check back for updates." },
      { name: "Spiritual Communion", subtitle: "St. Alphonsus Liguori (1696–1787)", text: "My Jesus, I believe that Thou art present in the Most Holy Sacrament. I love Thee above all things, and I desire to receive Thee into my soul. Since I cannot at this moment receive Thee sacramentally, come at least spiritually into my heart.\n\nI embrace Thee as if Thou wert already there, and I unite myself wholly to Thee. Never permit me to be separated from Thee. Amen." },
      { name: "Before Holy Communion", text: "Lord, I am not worthy that Thou shouldst enter under my roof, but only say the word and my soul shall be healed.\n\nO Lord, I am not worthy of the least of Thy favors; yet, since Thou dost invite me to receive Thee, I come with full confidence in Thy goodness and mercy. Thou art the Physician of souls; mine is sick — heal it by Thy holy presence. Thou art the Bread of life; I am hungry — feed me with Thyself.\n\nO Sacrament most holy, O Sacrament divine, all praise and all thanksgiving be every moment Thine." },
      { name: "After Holy Communion", text: "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me.\n\nO good Jesus, hear me; within Thy wounds hide me; suffer me not to be separated from Thee. From the malicious enemy defend me. In the hour of my death call me, and bid me come to Thee, that with Thy saints I may praise Thee forever and ever. Amen.\n\nI thank Thee, O Lord, for the grace which Thou hast given me in receiving Thy Body and Blood. I pray Thee, O Lord, that the reception of this Sacrament may be to me a pardon of sins, a complete forgiveness, a communion of faith, a progress in virtue, and an attainment of salvation. Amen." },
    ],
  },
];

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
        const largeReached = large && reached;
        const showNum = !large && b.beadInDecade != null && reached;
        const textCol = (active || largeReached) ? "#2d1b3d" : "rgba(255,255,255,0.95)";
        const largeFill = largeReached ? "url(#arcGradActive)" : beadFill(b.stepIndex);
        const largeStroke = largeReached ? "#ffd700" : beadStroke(b.stepIndex);
        return (
          <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
            {(active || largeReached) && <circle cx={b.x} cy={b.y} r={beadR + 7} fill="rgba(255,215,0,0.15)" />}
            <circle cx={b.x} cy={b.y} r={beadR}
              fill={large ? largeFill : beadFill(b.stepIndex)}
              stroke={large ? largeStroke : beadStroke(b.stepIndex)}
              strokeWidth={active ? 2.5 : 1.5}
              filter={(active || largeReached) ? "url(#arcGlow)" : "url(#arcShadow)"}
            />
            {large && <circle cx={b.x} cy={b.y} r={beadR - 5} fill="none"
              stroke={(active || largeReached) ? "rgba(255,215,0,0.6)" : "rgba(200,168,232,0.4)"} strokeWidth="1" />}
            {large && largeReached && b.decade != null && (
              <text x={b.x} y={b.y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontWeight="700"
                fill="#2d1b3d" fontFamily="sans-serif" pointerEvents="none">
                {["1st","2nd","3rd","4th","5th"][b.decade]}
              </text>
            )}
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
        const largeReached = large && reached;
        const showNumber = isHM && inActiveDecade && reached && b.beadInDecade != null;
        const textCol = active ? "#2d1b3d" : "rgba(255,255,255,0.9)";
        const largeFill = largeReached ? "url(#gradActive)" : beadFill(b.stepIndex);
        const largeStroke = largeReached ? "#ffd700" : beadStroke(b.stepIndex);
        return (
          <g key={b.stepIndex} onClick={() => onBeadTap(b.stepIndex)} style={{ cursor: "pointer" }}>
            {(active || largeReached) && <circle cx={b.x} cy={b.y} r={r + (mini ? 3 : 7)} fill="rgba(255,215,0,0.15)" />}
            <circle cx={b.x} cy={b.y} r={r} fill={large ? largeFill : beadFill(b.stepIndex)} stroke={large ? largeStroke : beadStroke(b.stepIndex)} strokeWidth={active ? 2 : 1} filter={(active || largeReached) ? "url(#glowGold)" : "url(#softShadow)"} />
            {large && <circle cx={b.x} cy={b.y} r={r - (mini ? 2 : 4)} fill="none" stroke={(active || largeReached) ? "rgba(255,215,0,0.6)" : "rgba(200,168,232,0.4)"} strokeWidth="1" />}
            {largeReached && b.decade != null && (
              <text x={b.x} y={b.y + 0.5} textAnchor="middle" dominantBaseline="middle"
                fontSize={mini ? "4" : "6.5"} fontWeight="700"
                fill="#2d1b3d" fontFamily="sans-serif" pointerEvents="none">
                {mini ? b.decade + 1 : ["1st","2nd","3rd","4th","5th"][b.decade]}
              </text>
            )}
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
        // Pendant HM beads are at stepIndex 3,4,5 (bottom→top: 1,2,3)
        // Show number 1,2,3 only while still in pendant intro phase
        const isPendantHM = !isCrucifix && !isLarge && b.stepIndex >= 3 && b.stepIndex <= 5;
        const pendantHMNum = b.stepIndex - 2; // stepIndex 3→1, 4→2, 5→3
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
  const [savedProgress, setSavedProgress] = useState(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Sleep / auto-play mode
  const [autoPlay, setAutoPlay] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const autoPlayRef = useRef(false);
  const seqLenRef = useRef(sequence.length);
  const audioRef = useRef(null);

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

  // User Guide
  const [showUserGuide, setShowUserGuide] = useState(false);

  // FAQ
  const [showFAQ, setShowFAQ] = useState(false);
  const [faqTab, setFaqTab] = useState("about");
  const [faqOpenSection, setFaqOpenSection] = useState(null);

  // MJK Novena
  const [showMJK, setShowMJK] = useState(false);

  // Pieta Prayer Book
  const [pietaScreen, setPietaScreen] = useState(null); // null | "splash" | "list" | "prayer"
  const [pietaSelectedPrayer, setPietaSelectedPrayer] = useState(null);
  const [pietaExpandedGroups, setPietaExpandedGroups] = useState(new Set());
  const [pietaSearch, setPietaSearch] = useState("");
  const pietaListScrollRef = useRef(null);
  const pietaListScrollPos = useRef(0);
  const [prayerIntention, setPrayerIntention] = useState("");
  const [prayerName, setPrayerName] = useState("");
  const [prayerLocation, setPrayerLocation] = useState("");
  const [prayerList, setPrayerList] = useState([]);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerError, setPrayerError] = useState(false);

  // Real-time Firestore listeners + load saved progress on mount
  useEffect(() => {
    // Live prayer intentions — updates instantly for all users
    const prayersQ = query(collection(db, "prayers"), orderBy("createdAt", "desc"));
    const unsubPrayers = onSnapshot(prayersQ,
      snap => setPrayerList(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setPrayerList([])
    );

    // Live feedback
    const feedbackQ = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubFeedback = onSnapshot(feedbackQ,
      snap => setFeedbackList(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setFeedbackList([])
    );

    // Rosary progress lives in localStorage (device-only, intentional)
    try {
      const raw = localStorage.getItem("rosary_progress");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.currentStep > 0) {
          setSavedProgress(parsed);
          setShowResumePrompt(true);
        }
      }
    } catch (e) { /* ignore */ }

    return () => { unsubPrayers(); unsubFeedback(); };
  }, []);

  // Save progress to localStorage while praying
  useEffect(() => {
    if (screen === "praying" && currentStep > 0) {
      const progress = { mysterySet, currentStep, totalSteps: sequence.length };
      try { localStorage.setItem("rosary_progress", JSON.stringify(progress)); } catch (e) { /* ignore */ }
    }
  }, [screen, currentStep, mysterySet, sequence.length]);

  // Save feedback to Firestore
  async function submitFeedback() {
    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      rating: feedbackRating,
      thumb: feedbackThumb,
      comment: feedbackComment.trim(),
      name: feedbackName.trim(),
      location: feedbackLocation.trim(),
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "feedback"), entry);
      setFeedbackSubmitted(true);
      setFeedbackRating(0);
      setFeedbackThumb(null);
      setFeedbackComment("");
      setFeedbackName("");
      setFeedbackLocation("");
      setTimeout(() => { setFeedbackSubmitted(false); setShowFeedback(false); }, 1800);
    } catch (e) { console.error("Firestore error:", e); }
  }

  // Save prayer intention to Firestore
  async function submitPrayer() {
    const entry = {
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      intention: prayerIntention.trim(),
      name: prayerName.trim(),
      location: prayerLocation.trim(),
      createdAt: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "prayers"), entry);
      setPrayerSubmitted(true);
      setPrayerIntention("");
      setPrayerName("");
      setPrayerLocation("");
      setTimeout(() => { setPrayerSubmitted(false); setShowPrayerWarrior(false); }, 1800);
    } catch (e) { console.error("Firestore error:", e); setPrayerError(true); setTimeout(() => setPrayerError(false), 3000); }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Keep sequence length ref current for use inside speech callbacks
  useEffect(() => { seqLenRef.current = sequence.length; }, [sequence]);

  // Cancel speech and reset autoplay when leaving the praying screen
  useEffect(() => {
    if (screen !== "praying") {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAutoPlay(false);
      autoPlayRef.current = false;
    }
  }, [screen]);

  // Map a sequence step to its MP3 filename (if one exists)
  const audioFileForStep = (s) => {
    if (!s) return null;
    if (s.type === "prayer") {
      const map = {
        signOfCross: "prayer_sign_of_cross.mp3",
        apostlesCreed: "prayer_apostles_creed.mp3",
        ourFather: "prayer_our_father.mp3",
        hailMary: "prayer_hail_mary.mp3",
        gloryBe: "prayer_glory_be.mp3",
        fatimaPrayer: "prayer_fatima.mp3",
        hailHolyQueen: "prayer_hail_holy_queen.mp3",
        finalPrayer: "prayer_final.mp3",
      };
      return map[s.prayer] ? `/audio/${map[s.prayer]}` : null;
    }
    if (s.type === "mystery") {
      const setKey = { Joyful: "joyful", Sorrowful: "sorrowful", Glorious: "glorious", Luminous: "luminous" };
      const key = setKey[mysterySet];
      if (key) return `/audio/mystery_${key}_${s.decadeIndex + 1}.mp3`;
    }
    return null;
  };

  // Speak the current step whenever autoPlay is on and the step changes
  useEffect(() => {
    if (!autoPlay || screen !== "praying") return;

    window.speechSynthesis.cancel();
    const s = sequence[currentStep];
    if (!s || s.type === "complete") return;

    const pauseMs = s.type === "mystery" ? 5000 : 2500;
    const audioFile = audioFileForStep(s);

    const onEnd = () => {
      setIsSpeaking(false);
      if (autoPlayRef.current) {
        setTimeout(() => {
          if (autoPlayRef.current) {
            setCurrentStep(c => Math.min(c + 1, seqLenRef.current - 1));
            setExpandedPrayer(null);
          }
        }, pauseMs);
      }
    };

    if (audioFile) {
      let cancelled = false;
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      const handleEnded = () => { if (!cancelled) onEnd(); };
      audio.addEventListener('ended', handleEnded);
      audio.src = audioFile;
      audio.load();
      audio.play()
        .then(() => { if (!cancelled) setIsSpeaking(true); })
        .catch(() => { /* iOS blocked — silence */ });
      return () => {
        cancelled = true;
        audio.removeEventListener('ended', handleEnded);
        audio.pause();
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      };
    } else {
      speakWithTTS(s, onEnd);
      return () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };
    }

    function speakWithTTS(step, onend) {
      let text = "";
      if (step.type === "prayer") {
        const p = PRAYERS[step.prayer];
        text = p.name + ". " + p.text;
      } else if (step.type === "mystery") {
        const m = step.mystery;
        text = `Mystery ${step.decadeIndex + 1}: ${m.title}. ${m.scripture}. ${m.description}`;
      }
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.78;
      utterance.pitch = 0.88;
      utterance.volume = 1.0;

      const assignVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const enhancedFeminine = [
          "Samantha (Enhanced)", "Karen (Enhanced)", "Moira (Enhanced)",
          "Tessa (Enhanced)", "Fiona (Enhanced)", "Veena (Enhanced)",
        ];
        const feminineFallback = ["Samantha", "Karen", "Moira", "Tessa", "Fiona", "Veena", "Victoria", "Serena"];
        const pick =
          voices.find(v => enhancedFeminine.includes(v.name)) ||
          voices.find(v => feminineFallback.includes(v.name)) ||
          voices.find(v => v.lang === "en-US" && v.localService) ||
          voices.find(v => v.lang.startsWith("en") && v.localService) ||
          voices[0];
        if (pick) utterance.voice = pick;
      };
      if (window.speechSynthesis.getVoices().length > 0) assignVoice();
      else window.speechSynthesis.onvoiceschanged = assignVoice;

      setIsSpeaking(true);
      utterance.onend = onend;
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [autoPlay, currentStep, screen, sequence, mysterySet]);

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
    try { localStorage.removeItem("rosary_progress"); } catch (e) { /* ignore */ }
    setSavedProgress(null);
  }, [mysterySet]);

  const toggleAutoPlay = () => {
    const next = !autoPlay;
    setAutoPlay(next);
    autoPlayRef.current = next;
    if (!next) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
  };

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
    if (step?.type === "complete") {
      setScreen("complete");
      try { localStorage.removeItem("rosary_progress"); } catch (e) { /* ignore */ }
      setSavedProgress(null);
    }
  }, [step]);

  const progress = Math.round((currentStep / (sequence.length - 2)) * 100);

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');
    @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
    @keyframes splashFade { 0% { opacity:1; } 80% { opacity:1; } 100% { opacity:0; } }
    @keyframes pulseBead { 0%,100% { transform:scale(1); opacity:0.7; } 50% { transform:scale(1.15); opacity:1; } }
    @keyframes speakPulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
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
        borderRadius: "24px 24px 0 0",
        maxHeight: "88vh", overflowY: "auto",
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ padding: "24px 22px max(40px, env(safe-area-inset-bottom))" }}>
        <div onClick={() => setShowPrayerWarrior(false)} style={{ padding: "4px 0 16px", cursor: "pointer", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.3)", borderRadius: 99 }} />
        </div>

        {prayerSubmitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
            <div style={{ fontSize: 18, color: "white", fontFamily: "'Lora',serif", fontWeight: 700 }}>Prayer Received</div>
            <div style={{ fontSize: 14, color: "#c9a0e8", fontFamily: "'Lora',serif", marginTop: 6 }}>Your intention has been saved.</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif" }}>⚔️ Prayer Requests</div>
              <button onClick={() => setShowPrayerWarrior(false)} style={{
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(200,160,232,0.3)",
                borderRadius: 20, color: "white", fontSize: 13, fontFamily: "'Lora',serif",
                fontWeight: 700, cursor: "pointer", padding: "6px 14px",
              }}>Done</button>
            </div>
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

            {prayerError && (
              <div style={{ fontSize: 13, color: "#ff8a8a", fontFamily: "'Lora',serif", textAlign: "center", marginBottom: 12 }}>
                Something went wrong. Please try again.
              </div>
            )}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Lora',serif" }}>🙏 Prayer Wall
            <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", fontWeight: 400, marginTop: 2 }}>{prayerList.length} intention{prayerList.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={() => setShowPrayerWall(false)} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(200,160,232,0.3)",
            borderRadius: 20, color: "white", fontSize: 13, fontFamily: "'Lora',serif",
            fontWeight: 700, cursor: "pointer", padding: "6px 14px",
          }}>Done</button>
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

  // ── USER GUIDE OVERLAY ──
  const UserGuide = showUserGuide ? (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(10,5,20,0.85)",
      display: "flex", alignItems: "flex-end",
    }} onClick={() => setShowUserGuide(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 390, margin: "0 auto",
        background: "linear-gradient(180deg,#2d1b3d,#1a0d2e)",
        borderRadius: "24px 24px 0 0",
        maxHeight: "90vh", overflowY: "auto",
        paddingBottom: 40,
        animation: "fadeIn 0.25s ease",
      }}>
        {/* Handle */}
        <div onClick={() => setShowUserGuide(false)} style={{ padding: "12px 0 4px", cursor: "pointer", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.4)", borderRadius: 99 }} />
        </div>
        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f0e6ff", fontFamily: "'Lora',serif", marginBottom: 4 }}>How to Use the App</div>
          <div style={{ fontSize: 13, color: "#9b7aba", fontFamily: "'Lora',serif", fontStyle: "italic", marginBottom: 24 }}>A simple guide to every feature</div>

          {/* Section helper */}
          {[
            {
              heading: "Choosing Your Mysteries",
              icon: "✦",
              lines: [
                "At the top of the home screen, tap one of the four mystery buttons — Joyful, Sorrowful, Glorious, or Luminous.",
                "The app will suggest the traditional mysteries for today's day of the week. You'll see a small '✦ Suggested' label on the recommended choice.",
                "Each mystery set includes a list of the five mysteries shown below the buttons so you know what you'll be praying.",
              ],
            },
            {
              heading: "Beginning the Rosary",
              icon: "🌿",
              lines: [
                "Once you've chosen your mysteries, tap Begin the Rosary. The app will walk you through every prayer step by step.",
                "If you left a Rosary unfinished, you'll see a Resume card. Tap Resume to pick up exactly where you left off, or Start Fresh to begin from the Sign of the Cross.",
              ],
            },
            {
              heading: "Navigating the Prayers",
              icon: "←  →",
              lines: [
                "On the prayer screen, use the Back and Next buttons to move one step at a time.",
                "You can also tap any bead on the rosary image to jump directly to that step.",
                "Tap the prayer card itself to expand or collapse the full prayer text.",
                "Tap Expand All Prayers (lower left) to see the full text of every prayer at once.",
              ],
            },
            {
              heading: "Sleep Mode  —  the Moon Button",
              icon: null,
              moonIcon: true,
              lines: [
                "Tap the moon icon in the top right corner of the prayer screen to turn on Sleep Mode.",
                "When active, the app reads each prayer aloud in a warm, natural voice and automatically advances to the next step when it finishes.",
                "This is perfect for praying at bedtime — simply lay your phone down and listen.",
                "Tap the moon again to stop at any time. It turns golden while active.",
              ],
            },
            {
              heading: "Learn More",
              icon: "↓",
              lines: [
                "When you reach a mystery step, a Learn More button appears below the mystery card.",
                "Tap it to open a deeper meditation — including the Scripture passage, the Fruit of the Mystery, and a full reflection.",
                "To close it, tap the gray pill bar at the top of the card, tap the Return to Prayer button, or tap anywhere outside the card.",
              ],
            },
            {
              heading: "Community Features",
              icon: null,
              navIcons: true,
              lines: [
                "🙏  Prayer Wall — Read prayer intentions shared by others in the community.",
                "⚔️  Prayer Requests — Submit your own prayer intention to be prayed for.",
                "💬  Feedback — Rate the app and share a comment.",
                "📋  View Feedback — Read feedback left by other users.",
                "These four buttons are always visible at the bottom of the screen.",
              ],
            },
            {
              heading: "MJK Novena",
              icon: null,
              lines: [
                "Tap the MJK Novena button in the top right of the home screen to open a special novena prayer.",
              ],
            },
            {
              heading: "Judith's Pieta Prayer Book",
              icon: "📖",
              lines: [
                "Tap the Pieta Prayers button in the top right of the home screen to open Judith's Pieta Prayer Book.",
                "You'll land on a sky splash screen. Tap Open Prayer Book to enter.",
                "Prayers are organized into 12 sections — Daily Prayers, Acts, Chaplets, Consecrations, Prayers to Jesus Christ, Prayers to Our Lady, Prayers for Protection, Purgatory & Prayers for the Departed, Litanies, Novenas, Prayers of the Saints, and Spiritual Communion & Mass.",
                "Scroll through the list and tap any prayer to open the full text.",
                "Tap ← Prayer List to go back. The app will return you to exactly where you were in the list.",
                "Prayers marked Coming Soon will be added in a future update.",
              ],
            },
            {
              heading: "History of the Pieta Prayer Book",
              icon: "✝",
              lines: [
                "The Pieta Prayer Book was compiled by MLOR Corporation — My Love of the Rosary — and first published in the 1950s in the United States. It was designed as a compact, affordable Catholic prayer booklet that could fit in a pocket or purse.",
                "\"Pieta\" refers to Michelangelo's famous marble sculpture (1498–1499) depicting the Virgin Mary holding the body of Jesus after the Crucifixion — the image on the cover of the book. The word Pietà is Italian for \"pity\" or \"compassion.\"",
                "It became one of the most widely distributed Catholic prayer books in American history, with over 22 million copies printed. It was sold for just a few cents so that no Catholic family would be without one.",
                "The quote on the cover — \"Jesus, I trust in You.\" — is attributed to St. Maria Faustina Kowalska, the same words on the Pieta Prayer Book splash screen in this app.",
                "The book draws from centuries of Catholic tradition — prayers from the saints, litanies, novenas, chaplets, and devotions — most of which are in the public domain.",
                "It remains in print today and is still distributed at parishes, hospitals, and Catholic bookstores. Many Catholic families have passed their copies down through generations — much like Judith's well-worn copy.",
              ],
            },
          ].map(({ heading, icon, moonIcon, navIcons, lines }) => (
            <div key={heading} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {moonIcon ? (
                  <svg width="26" height="28" viewBox="0 0 36 38" fill="none">
                    <defs><mask id="guideMoon"><rect width="36" height="38" fill="white"/><circle cx="21" cy="15" r="11.5" fill="black"/></mask></defs>
                    <circle cx="15" cy="17" r="13.5" fill="rgba(200,160,232,0.85)" mask="url(#guideMoon)"/>
                    <circle cx="23" cy="26.5" r="2.2" fill="rgba(200,160,232,0.85)"/>
                    <rect x="21.3" y="28.5" width="3.4" height="3.5" rx="0.8" fill="rgba(200,160,232,0.85)"/>
                    <line x1="22" y1="32" x2="20.5" y2="35.5" stroke="rgba(200,160,232,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                    <line x1="24" y1="32" x2="23.5" y2="35.5" stroke="rgba(200,160,232,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                    <line x1="24.5" y1="29.5" x2="31" y2="22.5" stroke="rgba(200,160,232,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
                    <line x1="31" y1="22.5" x2="33" y2="30" stroke="rgba(200,160,232,0.6)" strokeWidth="0.8" strokeLinecap="round"/>
                    <circle cx="33" cy="30.5" r="1.2" fill="rgba(200,160,232,0.85)"/>
                  </svg>
                ) : icon ? (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(107,63,160,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#c9a0e8", fontWeight: 700, flexShrink: 0 }}>{icon}</div>
                ) : null}
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0e6ff", fontFamily: "'Lora',serif" }}>{heading}</div>
              </div>
              {lines.map((line, i) => (
                <div key={i} style={{ fontSize: 14, color: "#d4b8f0", fontFamily: "'Lora',serif", lineHeight: 1.75, marginBottom: 6, paddingLeft: 38 }}>{line}</div>
              ))}
            </div>
          ))}

          {/* Close */}
          <button onClick={() => setShowUserGuide(false)} style={{
            width: "100%", marginTop: 8, background: "rgba(107,63,160,0.4)",
            border: "1px solid rgba(200,160,232,0.2)", borderRadius: 14,
            padding: "13px", color: "#c9a0e8", fontFamily: "'Lora',serif",
            fontSize: 15, cursor: "pointer", fontWeight: 600,
          }}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ── BOTTOM NAV BAR ──
  const navItems = [
    { icon: "🙏", label: "Prayer Wall",      action: () => { setShowPrayerWall(true); setShowPrayerWarrior(false); setShowFeedback(false); setShowFeedbackViewer(false); } },
    { icon: "⚔️", label: "Prayer Requests",  action: () => { setShowPrayerWarrior(true); setShowPrayerWall(false); setShowFeedback(false); setShowFeedbackViewer(false); } },
    { icon: "💬", label: "Feedback",         action: () => { setShowFeedback(true); setShowPrayerWall(false); setShowPrayerWarrior(false); setShowFeedbackViewer(false); } },
    { icon: "📋", label: "View Feedback",    action: () => { setShowFeedbackViewer(true); setShowPrayerWall(false); setShowPrayerWarrior(false); setShowFeedback(false); } },
  ];

  const FeedbackButton = !showDedication ? (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 390, zIndex: 9997,
      background: "rgba(18,8,32,0.96)",
      borderTop: "1px solid rgba(200,160,232,0.15)",
      backdropFilter: "blur(12px)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
    }}>
      {navItems.map(({ icon, label, action }) => (
        <button key={label} onClick={action} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "4px 8px", borderRadius: 10,
          minWidth: 72,
        }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{ fontSize: 9, color: "rgba(200,160,232,0.75)", fontFamily: "'Lora',serif", letterSpacing: 0.3, whiteSpace: "nowrap" }}>{label}</span>
        </button>
      ))}
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
          Wife · Bride · Lover · My World<br/>
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
      <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#faf7fc", display: "flex", flexDirection: "column", fontFamily: "'Lora',serif", paddingBottom: 72 }}>
        <style>{CSS}</style>
        {FeedbackPanel}
        {FeedbackViewer}
        {PrayerWarriorPanel}
        {PrayerWall}
        {UserGuide}
        {FeedbackButton}
        {showMJK && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9990,
            background: "rgba(0,0,0,0.6)",
            display: "flex", justifyContent: "center",
          }}>
            <div style={{
              width: "100%", maxWidth: 390,
              background: "#000",
              display: "flex", flexDirection: "column",
              height: "100%",
            }}>
              {/* Top bar with back button */}
              <div style={{
                display: "flex", alignItems: "center",
                padding: "max(14px, env(safe-area-inset-top)) 16px 14px", flexShrink: 0,
                background: "rgba(0,0,0,0.8)",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}>
                <button onClick={() => setShowMJK(false)} style={{
                  background: "none", border: "none", color: "white",
                  fontFamily: "'Lora',serif", fontSize: 15, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>← Back</button>
                <div style={{ flex: 1, textAlign: "center", color: "white", fontFamily: "'Lora',serif", fontSize: 14, fontWeight: 700, marginRight: 48 }}>
                  MJK Novena
                </div>
              </div>
              {/* Image — scrollable if needed */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: 80 }}>
                <img
                  src="/mjk-novena.jpg"
                  alt="MJK Novena"
                  style={{ width: "100%", borderRadius: 12 }}
                />
              </div>
            </div>
          </div>
        )}
        {showFAQ && (() => {
          const aboutSections = [
            {
              title: "What the Rosary Actually Is",
              body: `At its core, the Rosary is the Gospel prayed slowly.\n\nEach of the twenty Mysteries is a scene drawn directly from the life of Jesus — His birth in Bethlehem, His baptism in the Jordan, His agony in the Garden, His death on the Cross, His resurrection on the third day. To pray the Rosary is to walk through the entire sweep of the Gospel, pausing at each moment to let it sink into the heart.\n\nThe prayers themselves — the Our Father, the Hail Mary, the Glory Be — are either taken word for word from Scripture or deeply rooted in it. The Our Father is the prayer Jesus Himself taught us (Matthew 6:9–13). The first half of the Hail Mary is composed entirely of the words of the Angel Gabriel and Elizabeth, straight from the Gospel of Luke.\n\nThe repetition of the Hail Mary creates a kind of interior quiet in which the mind and heart are free to rest on Christ. The words become almost like a heartbeat — steady and unobtrusive — while the soul gazes at Jesus.`,
            },
            {
              title: "Do Catholics Pray to Mary?",
              body: `When Catholics speak to Mary, they are not worshiping her. They are asking her to intercede — to bring their needs before her Son, just as a dear friend might be asked to pray on someone's behalf. This is called intercessory prayer, and it is thoroughly biblical.\n\nSt. Paul urged the early Christians to pray for one another: "I urge you, brothers and sisters… to join me in my struggle by praying to God for me" (Romans 15:30). James wrote: "The prayer of a righteous person is powerful and effective" (James 5:16).\n\nThe Church teaches clearly that Jesus Christ is the one Mediator between God and humanity (1 Timothy 2:5). Mary does not replace that mediation — she participates in it, as all intercessors do, by directing prayer toward her Son. Catholics do not believe Mary has power of her own. They believe she has a mother's ear with her Son — and they ask her to use it.`,
            },
            {
              title: "The Wedding at Cana",
              body: `Perhaps no moment in Scripture illuminates Mary's role more beautifully than the Wedding at Cana (John 2:1–11) — one of the Luminous Mysteries of the Rosary.\n\nJesus and Mary are guests at a wedding in Cana. The wine runs out. Mary notices — and what does she do? She doesn't solve it herself. She goes quietly to Jesus and says: "They have no wine."\n\nJesus responds: "Woman, what does this have to do with me? My hour has not yet come." Yet Mary, with serene confidence, turns to the servants and says words that have echoed through Christian history: "Do whatever He tells you."\n\nJesus performs His first public miracle. Look at the pattern:\n\nA need arises → Mary brings it to Jesus → Jesus acts → Mary's final recorded words in all of Scripture are a direct command to follow Christ.\n\nThis is Mary's role. Always and only. She does not say "Come to me." She says "Go to Him." The Rosary does exactly the same thing.`,
            },
            {
              title: "Standing Beside Mary at the Cross",
              body: `One of the most profound gifts of the Rosary is that it invites the soul to see the mysteries of Christ's life through Mary's eyes.\n\nConsider the Fifth Sorrowful Mystery: the Crucifixion. As you pray, you are not merely reading about the death of Jesus from a distance. You are standing where Mary stood — at the foot of the Cross, watching her Son die for the sins of the world.\n\nThis is the genius of the Rosary. It does not merely inform — it forms. It does not merely teach about Christ — it draws the soul into relationship with Christ, through the motherly companionship of the one who knew Him best.`,
            },
            {
              title: "A Response to Concerns About Heresy",
              body: `Some Christians, with genuine faith and sincere concern, have called the Catholic veneration of Mary a heresy — a worship of a creature in the place of God. This concern deserves a respectful and direct response.\n\nThe Rosary, properly understood, is not a departure from the Gospel — it is the Gospel, prayed and contemplated. Every mystery is a scene from the life of Christ. Every Our Father is the prayer He taught us. Every Glory Be is a doxology of praise to the Trinity.\n\nThe Catholic Church has never taught that Mary is divine, equal to Christ, or a source of grace in herself. The Catechism is explicit: "Mary's role in the Church is inseparable from her union with Christ and flows directly from it."\n\nIf honoring the mother of Jesus is heresy, then one must reckon with Elizabeth, who cried out under the inspiration of the Holy Spirit: "Blessed are you among women, and blessed is the fruit of your womb!" (Luke 1:42). The Church has simply never stopped saying what Elizabeth said.`,
            },
            {
              title: "An Invitation",
              body: `If you have never prayed the Rosary, or if you have held it at arm's length out of suspicion or misunderstanding, consider this: pick it up, and let it lead you where it has always led — to the life, death, and resurrection of Jesus Christ, the Son of God and the Savior of the world.\n\nMary will not keep you. She never does. She will simply say, as she said to the servants at Cana, what she has always said:\n\n"Do whatever He tells you."`,
            },
          ];

          const historySections = [
            {
              title: "The Earliest Roots (3rd–4th Century)",
              body: `Long before the Rosary took its familiar form, the earliest Christians felt the need to return, again and again, to God. The Desert Fathers of Egypt and Syria, as early as the 3rd and 4th centuries, would carry pouches of small stones, moving one pebble at a time as they repeated prayers throughout the day. It was a simple, humble practice — prayer made physical, anchored in the body as much as the soul.\n\nThe goal was the repetition of 150 Psalms, the great ancient prayer book of the Church. The number 150 would echo through the centuries as the Rosary slowly took shape.`,
            },
            {
              title: "The People's Prayer: From Psalms to Hail Marys",
              body: `As Christianity spread into villages and towns, most ordinary Christians — farmers, tradespeople, mothers, and children — could not read. The Latin Psalms were beyond their reach. Yet their hearts burned with the same desire to pray.\n\nAnd so, quietly and gradually, the faithful began to substitute 150 Our Fathers for the 150 Psalms, keeping count on knotted ropes or simple strings of beads called paternosters — a word that means "Our Father." Later, as devotion to Mary deepened, the Our Fathers gave way to 150 Hail Marys, drawn directly from the words of the Angel Gabriel and Elizabeth in Luke.\n\nThis became known as the Psalter of Mary — the Poor Man's Psalter. A grandmother in a medieval village, unable to read a single word, holding her beads and whispering the same prayer that monks chanted in great stone monasteries.`,
            },
            {
              title: "The Hail Mary: Scripture Woven Into Prayer",
              body: `The prayer at the heart of the Rosary grew slowly, like a tree putting down roots.\n\nThe first part came from the Angel Gabriel's greeting at the Annunciation: "Hail, full of grace, the Lord is with you" (Luke 1:28). The second part came from Elizabeth: "Blessed are you among women, and blessed is the fruit of your womb" (Luke 1:42).\n\nOver time, the name of Jesus was added at the center — grounding the prayer in Christ. Finally, the second half — "Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death" — was gradually added, reaching its final form around the 16th century. What had begun as pure Scripture had become a complete prayer, always pointing toward her Son.`,
            },
            {
              title: "St. Dominic and the Dominican Gift (13th Century)",
              body: `According to a beloved tradition, the Virgin Mary appeared to St. Dominic — a Spanish priest preaching against heresy in southern France — and entrusted him with the Rosary as a spiritual weapon of such power that it could turn hearts back to the truth of the Gospel.\n\nMost historians note the Rosary was already developing before Dominic's time. But what is certain: the Dominican Order embraced the Rosary with extraordinary zeal, preaching it across Europe and establishing Rosary confraternities — communities of ordinary people who committed to praying it together. St. Dominic may not have invented the Rosary, but he and his brothers gave it wings.`,
            },
            {
              title: "The Mysteries: From Repetition to Contemplation (15th Century)",
              body: `In the 15th century, a Dominican priest named Alanus de Rupe helped popularize a practice that would transform the Rosary: pairing each group of prayers with a Mystery — a scene from the life of Jesus to hold in the heart while the lips moved in prayer.\n\nSuddenly, the Rosary was not just counting prayers. It was a walking meditation through the entire Gospel. This was the insight that made the Rosary what it truly is: not mere repetition, but contemplation carried on the wings of repetition.`,
            },
            {
              title: "The Physical Rosary: Crucifix and Beads (15th–16th Century)",
              body: `The prayers of the Rosary developed first — the physical form we recognize today came together gradually over the 15th and 16th centuries.\n\nThe crucifix began appearing attached to the pendant section in the 1400s, as devotion to Christ's Passion deepened throughout the Church. Before that, rosaries were often simple knotted cords or plain loops of beads with no crucifix attached.\n\nBy the 16th century, rosary-making had become a craft in its own right, and the familiar form solidified: a crucifix at the base of the pendant, a large bead for the Our Father, three small beads for the Hail Marys, and then the circular loop of five decades — each decade anchored by a large Our Father bead and ten smaller Hail Mary beads.\n\nPope Pius V's 1569 standardization of the prayer structure gave the physical beads their definitive meaning and sequence. From that point forward, the hardware and the prayers were locked together as one unified whole.\n\nThe 2002 addition of the Luminous Mysteries by Pope John Paul II changed the prayer content — but not the beads themselves. The physical rosary you hold today is, in all its essentials, the same object Catholics have held in their hands for roughly five hundred years.`,
            },
            {
              title: "Pope Pius V and the Battle of Lepanto (1571)",
              body: `In 1569, Pope Pius V — himself a Dominican — gave the Rosary its formal structure: five decades per session, with fifteen Mysteries arranged into three groups: the Joyful, the Sorrowful, and the Glorious.\n\nTwo years later, a massive Ottoman fleet threatened to overwhelm Christian Europe at the Battle of Lepanto. Pope Pius V called on all of Christendom to pray the Rosary. Against all odds, the Christian fleet prevailed.\n\nPope Pius V attributed the victory to Our Lady of the Rosary. He established October 7th as the Feast of Our Lady of the Rosary — celebrated on that date ever since. The event cemented the Rosary's place at the very heart of Catholic identity.`,
            },
            {
              title: "Fatima: Mary's Own Request (1917)",
              body: `In the spring and summer of 1917, three shepherd children in Fatima, Portugal — Lucia, Francisco, and Jacinta — reported a series of apparitions of the Virgin Mary. The world was in the grip of the First World War, and Mary's request was the same in each appearance: "Pray the Rosary every day."\n\nThe Fatima apparitions, approved by the Church, sent a wave of renewed Rosary devotion around the world. For millions of Catholics in the 20th century, the Rosary became not just a tradition inherited from the past, but a living response to a mother's gentle, persistent call.`,
            },
            {
              title: "St. John Paul II: The Luminous Mysteries (2002)",
              body: `In October 2002, Pope John Paul II — who had carried a Rosary in his hand for virtually his entire priestly life — gave the Church a gift. In his apostolic letter Rosarium Virginis Mariae, he added a fourth set of Mysteries: the Luminous Mysteries, or Mysteries of Light.\n\nThese five new meditations focused on the public ministry of Jesus: His Baptism in the Jordan, the Wedding at Cana, the Proclamation of the Kingdom, the Transfiguration, and the Institution of the Eucharist.\n\nJohn Paul called the Rosary "my favorite prayer." It was the first structural change to the Rosary in over four centuries.`,
            },
            {
              title: "What the Rosary Is, At Its Heart",
              body: `Across seventeen centuries, through the hands of desert monks, medieval villagers, Dominican friars, popes, and shepherd children, the Rosary arrived at what it is today: a prayer of twenty mysteries, one hundred and fifty Hail Marys, and a lifetime of contemplation.\n\nIt is Scripture prayed slowly. It is the Gospel held in the hands. It is a mother's voice, passed from generation to generation, whispering the same thing she has always whispered — come, and look at my Son.\n\nHowever you came to the Rosary — by inheritance, by choice, or by some quiet grace you can't quite explain — you are part of a story that has been unfolding for a very long time. And every bead you pray adds one more voice to that great, unbroken chorus.`,
            },
          ];

          const sections = faqTab === "about" ? aboutSections : historySections;

          return (
            <div style={{
              position: "fixed", inset: 0, zIndex: 9990,
              background: "rgba(0,0,0,0.6)",
              display: "flex", justifyContent: "center",
            }}>
              <div style={{
                width: "100%", maxWidth: 390,
                background: "linear-gradient(180deg,#faf7fc,#f0eaf5)",
                display: "flex", flexDirection: "column",
                height: "100%",
              }}>
                {/* Header */}
                <div style={{
                  display: "flex", alignItems: "center",
                  padding: "14px 16px", flexShrink: 0,
                  background: "linear-gradient(160deg,#2d1b3d,#6b3fa0)",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <button onClick={() => setShowFAQ(false)} style={{
                    background: "none", border: "none", color: "white",
                    fontFamily: "'Lora',serif", fontSize: 15, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>← Back</button>
                  <div style={{ flex: 1, textAlign: "center", color: "white", fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, marginRight: 48 }}>
                    Rosary FAQ
                  </div>
                </div>

                {/* Tabs */}
                <div style={{
                  display: "flex", flexShrink: 0,
                  borderBottom: "1px solid #e8dff0",
                  background: "white",
                }}>
                  {[["about", "About the Rosary"], ["history", "History"]].map(([tab, label]) => (
                    <button key={tab} onClick={() => { setFaqTab(tab); setFaqOpenSection(null); }} style={{
                      flex: 1, padding: "12px 8px",
                      background: "none", border: "none",
                      borderBottom: faqTab === tab ? "3px solid #6b3fa0" : "3px solid transparent",
                      color: faqTab === tab ? "#6b3fa0" : "#7a6680",
                      fontFamily: "'Lora',serif", fontSize: 13, fontWeight: faqTab === tab ? 700 : 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{label}</button>
                  ))}
                </div>

                {/* Intro blurb */}
                <div style={{ flexShrink: 0, padding: "16px 18px 0", background: "white" }}>
                  {faqTab === "about" ? (
                    <div style={{ fontSize: 13, color: "#4a3550", fontFamily: "'Lora',serif", lineHeight: 1.75, fontStyle: "italic", paddingBottom: 14, borderBottom: "1px solid #f0eaf5" }}>
                      One of the most common misunderstandings about the Rosary is that Catholics pray to Mary instead of to Jesus. The truth is both simple and beautiful: the Rosary is a meditation on the life of Jesus Christ. Mary's role is not to stand between the soul and Christ — it is to lead the soul to Christ, just as she has always done.
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "#4a3550", fontFamily: "'Lora',serif", lineHeight: 1.75, fontStyle: "italic", paddingBottom: 14, borderBottom: "1px solid #f0eaf5" }}>
                      The Rosary is one of the most beloved prayers in the history of the Christian faith — not because it was handed down complete and polished, but because it grew organically, shaped by the devotion of countless ordinary believers across many centuries.
                    </div>
                  )}
                </div>

                {/* Accordion sections */}
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 80px", background: "white" }}>
                  {sections.map((sec, i) => {
                    const isOpen = faqOpenSection === i;
                    return (
                      <div key={i} style={{ marginBottom: 8, borderRadius: 12, border: "1px solid #e8dff0", overflow: "hidden" }}>
                        <button onClick={() => setFaqOpenSection(isOpen ? null : i)} style={{
                          width: "100%", padding: "14px 16px",
                          background: isOpen ? "#f5eeff" : "white",
                          border: "none", cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          textAlign: "left",
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isOpen ? "#6b3fa0" : "#2d1b3d", fontFamily: "'Lora',serif", lineHeight: 1.4 }}>
                            {sec.title}
                          </span>
                          <span style={{ color: "#6b3fa0", fontSize: 18, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ padding: "0 16px 16px", background: "#faf5ff" }}>
                            {sec.body.split("\n\n").map((para, pi) => (
                              <p key={pi} style={{ fontSize: 13, color: "#3a2a4a", fontFamily: "'Lora',serif", lineHeight: 1.85, margin: "12px 0 0" }}>
                                {para}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        <div style={{ background: "linear-gradient(160deg,#2d1b3d,#6b3fa0)", padding: "max(20px, env(safe-area-inset-top)) 20px 16px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: "#c9a0e8", letterSpacing: 2, textTransform: "uppercase" }}>The Holy</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>Rosary</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => setShowUserGuide(true)} style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(200,160,232,0.4)",
              borderRadius: 10, padding: "8px 10px",
              color: "white", fontFamily: "'Lora',serif",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.5,
            }}>Guide</button>
            <button onClick={() => { setShowFAQ(true); setFaqTab("about"); setFaqOpenSection(null); }} style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(200,160,232,0.4)",
              borderRadius: 10, padding: "8px 10px",
              color: "white", fontFamily: "'Lora',serif",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.5,
            }}>FAQ</button>
            <button onClick={() => setShowMJK(true)} style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(200,160,232,0.4)",
              borderRadius: 10, padding: "8px 10px",
              color: "white", fontFamily: "'Lora',serif",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.5, lineHeight: 1.4, textAlign: "center",
            }}>
              MJK<br/>Novena
            </button>
            <button onClick={() => setPietaScreen("splash")} style={{
              background: "rgba(255,215,100,0.15)",
              border: "1px solid rgba(255,215,100,0.45)",
              borderRadius: 10, padding: "8px 10px",
              color: "#ffd764", fontFamily: "'Lora',serif",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              letterSpacing: 0.5, lineHeight: 1.4, textAlign: "center",
            }}>
              Pieta<br/>Prayers
            </button>
          </div>
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
          {showResumePrompt && savedProgress ? (
            <div style={{ marginBottom: 20, background: "#f5eeff", borderRadius: 14, border: "2px solid #6b3fa0", padding: "16px", marginTop: 0 }}>
              <div style={{ fontSize: 13, color: "#6b3fa0", fontWeight: 700, fontFamily: "'Lora',serif", marginBottom: 4 }}>
                You left off in the middle of a Rosary
              </div>
              <div style={{ fontSize: 12, color: "#7a4fa6", fontFamily: "'Lora',serif", marginBottom: 14 }}>
                {savedProgress.mysterySet} Mysteries · {Math.round((savedProgress.currentStep / (savedProgress.totalSteps - 2)) * 100)}% complete
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => {
                  const seq = buildSequence(savedProgress.mysterySet);
                  setMysterySet(savedProgress.mysterySet);
                  setSequence(seq);
                  setCurrentStep(savedProgress.currentStep);
                  setExpandedPrayer(null);
                  setStickyExpanded(new Set());
                  setShowResumePrompt(false);
                  setScreen("praying");
                }} style={{
                  flex: 1, background: "#6b3fa0", color: "white", border: "none",
                  borderRadius: 10, padding: "12px 8px", fontSize: 14, fontFamily: "'Lora',serif",
                  fontWeight: 700, cursor: "pointer",
                }}>
                  Resume
                </button>
                <button onClick={() => {
                  setShowResumePrompt(false);
                  setSavedProgress(null);
                  try { localStorage.removeItem("rosary_progress"); } catch (e) { /* ignore */ }
                }} style={{
                  flex: 1, background: "white", color: "#6b3fa0", border: "2px solid #6b3fa0",
                  borderRadius: 10, padding: "12px 8px", fontSize: 14, fontFamily: "'Lora',serif",
                  fontWeight: 700, cursor: "pointer",
                }}>
                  Start Fresh
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setSequence(buildSequence(mysterySet)); setCurrentStep(0); setScreen("praying"); }} style={{
              width: "100%", background: "#2d1b3d", color: "white", border: "none",
              borderRadius: 14, padding: "15px", fontSize: 16, fontFamily: "'Lora',serif",
              fontWeight: 700, cursor: "pointer",
            }}>
              Begin the Rosary
            </button>
          )}
          <div style={{ height: 20 }} />
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

        {/* ── PIETA PRAYER BOOK ── */}
        {pietaScreen === "splash" && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9990,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "#1a0d2e",
          }}>
            <img src="/pieta-sky.png" alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 30%",
            }} />
            <div style={{ position: "relative", textAlign: "center", padding: "0 32px" }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#ffe033", fontFamily: "'Lora',serif",
                letterSpacing: 3, textTransform: "uppercase", marginBottom: 14,
                textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)",
              }}>Judith's</div>
              <div style={{
                fontSize: 30, fontWeight: 700, color: "#fff",
                fontFamily: "'Lora',serif", lineHeight: 1.25, marginBottom: 6,
                textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 24px rgba(0,0,0,1)",
              }}>Pieta Prayer Book</div>
              <div style={{
                fontFamily: "'Lora',serif", fontStyle: "italic", marginBottom: 28, lineHeight: 1.7,
              }}>
                <span style={{ color: "#8B0000", fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)", fontSize: 15 }}>Jesus, I trust in You.</span>
                <br/>
                <span style={{ color: "#fff", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)", fontSize: 15 }}>— St. Maria Faustina Kowalska</span>
              </div>
              <button onClick={() => setPietaScreen("list")} style={{
                background: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(255,255,255,0.9)",
                borderRadius: 14, padding: "14px 44px",
                color: "#fff", fontFamily: "'Lora',serif",
                fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}>Open Prayer Book</button>
              <div style={{ marginTop: 22 }}>
                <button onClick={() => setPietaScreen(null)} style={{
                  background: "none", border: "none", color: "#fff",
                  fontFamily: "'Lora',serif", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  textShadow: "0 1px 4px rgba(0,0,0,1)",
                }}>← Back</button>
              </div>
            </div>
          </div>
        )}

        {pietaScreen === "list" && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9990,
            background: "linear-gradient(180deg,#1a0d2e,#0f0720)",
            display: "flex", flexDirection: "column",
            maxWidth: 390, margin: "0 auto",
          }}>
            <div style={{
              padding: "max(52px, env(safe-area-inset-top)) 20px 16px",
              background: "linear-gradient(180deg,rgba(107,63,160,0.35),transparent)",
              borderBottom: "1px solid rgba(200,160,232,0.15)", flexShrink: 0,
            }}>
              <button onClick={() => { setPietaScreen("splash"); setPietaSearch(""); }} style={{
                background: "none", border: "none", color: "rgba(200,160,232,0.7)",
                fontFamily: "'Lora',serif", fontSize: 13, cursor: "pointer",
                marginBottom: 8, padding: 0,
              }}>← Back</button>
              <div style={{ fontSize: 10, color: "rgba(255,215,100,0.7)", fontFamily: "'Lora',serif", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 4 }}>Judith's</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0e6ff", fontFamily: "'Lora',serif", marginBottom: 14 }}>Pieta Prayer Book</div>
              {/* Search bar */}
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
                <input
                  value={pietaSearch}
                  onChange={e => setPietaSearch(e.target.value)}
                  placeholder="Search prayers by name…"
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(200,160,232,0.25)", borderRadius: 12,
                    color: "white", fontFamily: "'Lora',serif", fontSize: 14,
                    padding: "10px 36px 10px 34px", boxSizing: "border-box",
                  }}
                />
                {pietaSearch.length > 0 && (
                  <button onClick={() => setPietaSearch("")} style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "rgba(200,160,232,0.7)",
                    fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1,
                  }}>✕</button>
                )}
              </div>
            </div>
            <div ref={pietaListScrollRef} style={{ overflowY: "auto", flex: 1, padding: "12px 16px 40px" }}>

              {/* ── SEARCH RESULTS ── */}
              {pietaSearch.trim().length > 0 && (() => {
                const term = pietaSearch.trim().toLowerCase();
                const results = PIETA_PRAYERS.flatMap(group =>
                  group.prayers
                    .filter(p => p.name.toLowerCase().includes(term))
                    .map(p => ({ ...p, category: group.category }))
                );
                return results.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px 0", color: "#9b7aba", fontFamily: "'Lora',serif", fontStyle: "italic" }}>
                    No prayers found for "{pietaSearch}"
                  </div>
                ) : results.map((p, i) => (
                  <button key={i} onClick={() => { pietaListScrollPos.current = pietaListScrollRef.current?.scrollTop || 0; setPietaSelectedPrayer(p); setPietaScreen("prayer"); setPietaSearch(""); }} style={{
                    width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(200,160,232,0.15)",
                    borderRadius: 12, padding: "14px 16px", marginBottom: 8,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "space-between", textAlign: "left",
                  }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#f0e6ff", fontFamily: "'Lora',serif" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,215,100,0.65)", fontFamily: "'Lora',serif", marginTop: 3, letterSpacing: 1.5, textTransform: "uppercase" }}>{p.category}</div>
                      {p.subtitle && <div style={{ fontSize: 11, color: "#9b7aba", fontFamily: "'Lora',serif", marginTop: 2, fontStyle: "italic" }}>{p.subtitle}</div>}
                    </div>
                    <div style={{ color: "rgba(200,160,232,0.5)", fontSize: 18, marginLeft: 8 }}>›</div>
                  </button>
                ));
              })()}

              {/* ── GROUPED LIST (shown when not searching) ── */}
              {pietaSearch.trim().length === 0 && PIETA_PRAYERS.map((group, gi) => {
                const isExpanded = pietaExpandedGroups.has(gi);
                return (
                  <div key={gi} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => setPietaExpandedGroups(prev => {
                        const next = new Set(prev);
                        if (next.has(gi)) next.delete(gi); else next.add(gi);
                        return next;
                      })}
                      style={{
                        width: "100%", background: isExpanded ? "rgba(107,63,160,0.2)" : "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(200,160,232,0.18)",
                        borderRadius: isExpanded ? "12px 12px 0 0" : 12,
                        padding: "12px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      <div style={{
                        fontSize: 10, color: "rgba(255,215,100,0.85)", fontFamily: "'Lora',serif",
                        letterSpacing: 2, textTransform: "uppercase",
                      }}>{group.category}</div>
                      <div style={{ color: "rgba(255,215,100,0.7)", fontSize: 10, letterSpacing: 1 }}>
                        {isExpanded ? "▲" : "▼"}
                      </div>
                    </button>
                    {isExpanded && (
                      <div style={{
                        border: "1px solid rgba(200,160,232,0.18)", borderTop: "none",
                        borderRadius: "0 0 12px 12px", padding: "8px 8px 4px", marginBottom: 12,
                      }}>
                        {group.prayers.map((p, pi) => (
                          <button key={pi} onClick={() => { pietaListScrollPos.current = pietaListScrollRef.current?.scrollTop || 0; setPietaSelectedPrayer(p); setPietaScreen("prayer"); }} style={{
                            width: "100%", background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(200,160,232,0.1)",
                            borderRadius: 10, padding: "13px 14px",
                            marginBottom: 6, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            textAlign: "left",
                          }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#f0e6ff", fontFamily: "'Lora',serif" }}>{p.name}</div>
                              {p.subtitle && <div style={{ fontSize: 11, color: "#9b7aba", fontFamily: "'Lora',serif", marginTop: 2, fontStyle: "italic" }}>{p.subtitle}</div>}
                            </div>
                            <div style={{ color: "rgba(200,160,232,0.5)", fontSize: 18, marginLeft: 8 }}>›</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {pietaScreen === "prayer" && pietaSelectedPrayer && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 9990,
            background: "linear-gradient(180deg,#1a0d2e,#0f0720)",
            display: "flex", flexDirection: "column",
            maxWidth: 390, margin: "0 auto",
          }}>
            <div style={{
              padding: "max(52px, env(safe-area-inset-top)) 20px 16px",
              background: "linear-gradient(180deg,rgba(107,63,160,0.35),transparent)",
              borderBottom: "1px solid rgba(200,160,232,0.15)", flexShrink: 0,
            }}>
              <button onClick={() => { setPietaScreen("list"); setTimeout(() => { if (pietaListScrollRef.current) pietaListScrollRef.current.scrollTop = pietaListScrollPos.current; }, 0); }} style={{
                background: "none", border: "none", color: "rgba(200,160,232,0.7)",
                fontFamily: "'Lora',serif", fontSize: 13, cursor: "pointer",
                marginBottom: 8, padding: 0,
              }}>← Prayer List</button>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f0e6ff", fontFamily: "'Lora',serif", lineHeight: 1.3 }}>
                {pietaSelectedPrayer.name}
              </div>
              {pietaSelectedPrayer.subtitle && (
                <div style={{ fontSize: 12, color: "#9b7aba", fontFamily: "'Lora',serif", marginTop: 4, fontStyle: "italic" }}>
                  {pietaSelectedPrayer.subtitle}
                </div>
              )}
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: "24px 20px 60px" }}>
              {pietaSelectedPrayer.history && (
                <div style={{
                  marginBottom: 20, borderRadius: 12, overflow: "hidden",
                  border: "1px solid rgba(139,0,0,0.4)",
                }}>
                  <div style={{
                    background: "rgba(139,0,0,0.5)", padding: "8px 14px",
                    fontSize: 10, fontWeight: 700, color: "rgba(255,200,200,0.95)",
                    fontFamily: "'Lora',serif", letterSpacing: 2, textTransform: "uppercase",
                  }}>History</div>
                  <div style={{
                    background: "rgba(139,0,0,0.1)", padding: "12px 14px",
                    fontSize: 13, color: "rgba(255,210,210,0.9)", fontFamily: "'Lora',serif",
                    lineHeight: 1.75, fontStyle: "italic",
                  }}>{pietaSelectedPrayer.history}</div>
                </div>
              )}
              {pietaSelectedPrayer.intro && (
                <div style={{
                  fontSize: 13, color: "rgba(255,215,100,0.8)", fontFamily: "'Lora',serif",
                  fontStyle: "italic", lineHeight: 1.75, marginBottom: 20,
                  padding: "12px 16px", background: "rgba(255,215,100,0.06)",
                  borderRadius: 10, borderLeft: "2px solid rgba(255,215,100,0.3)",
                }}>{pietaSelectedPrayer.intro}</div>
              )}
              <div style={{
                fontSize: 16, color: "#d4b8f0", fontFamily: "'Lora',serif",
                lineHeight: 1.95, whiteSpace: "pre-wrap",
              }}>{pietaSelectedPrayer.text}</div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── COMPLETE SCREEN ──
  if (screen === "complete") {
    return (
      <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: "#1a0d2e", display: "flex", flexDirection: "column", fontFamily: "'Lora',serif", paddingBottom: 72 }}>
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
      display: "flex", flexDirection: "column", fontFamily: "'Lora',serif", overflowX: "hidden", paddingBottom: 72,
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
      <div style={{ padding: "max(16px, env(safe-area-inset-top)) 18px 6px", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "#c9a0e8", cursor: "pointer", fontSize: 13, fontFamily: "'Lora',serif" }}>
            ← Home
          </button>
          <div style={{ fontSize: 12, color: "white", fontFamily: "'Lora',serif", fontWeight: 700 }}>{mysterySet} Mysteries</div>
          <button onClick={toggleAutoPlay} title={autoPlay ? "Stop Sleep Mode" : "Sleep Mode — reads prayers aloud"} style={{
            background: autoPlay ? "rgba(200,160,232,0.25)" : "none",
            border: autoPlay ? "1px solid rgba(200,160,232,0.5)" : "1px solid transparent",
            borderRadius: 20, padding: "4px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}>
            {/* Crescent moon with boy fishing — DreamWorks style */}
            <svg width="32" height="34" viewBox="0 0 36 38" fill="none">
              <defs>
                <mask id="moonMask">
                  <rect width="36" height="38" fill="white"/>
                  <circle cx="21" cy="15" r="11.5" fill="black"/>
                </mask>
              </defs>
              {/* Crescent body */}
              <circle cx="15" cy="17" r="13.5" fill={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"} mask="url(#moonMask)"/>
              {/* Boy — sitting on the lower horn of the crescent */}
              {/* Head */}
              <circle cx="23" cy="26.5" r="2.2" fill={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"}/>
              {/* Body */}
              <rect x="21.3" y="28.5" width="3.4" height="3.5" rx="0.8" fill={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"}/>
              {/* Legs dangling down */}
              <line x1="22" y1="32" x2="20.5" y2="35.5" stroke={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"} strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="24" y1="32" x2="23.5" y2="35.5" stroke={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"} strokeWidth="1.6" strokeLinecap="round"/>
              {/* Fishing rod */}
              <line x1="24.5" y1="29.5" x2="31" y2="22.5" stroke={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"} strokeWidth="1.3" strokeLinecap="round"/>
              {/* Fishing line */}
              <line x1="31" y1="22.5" x2="33" y2="30" stroke={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.6)"} strokeWidth="0.8" strokeLinecap="round"/>
              {/* Float / bobber */}
              <circle cx="33" cy="30.5" r="1.2" fill={autoPlay ? "#FFD97D" : "rgba(200,160,232,0.75)"}/>
            </svg>
            {autoPlay && (
              <span style={{ fontSize: 10, color: "#c9a0e8", fontFamily: "'Lora',serif", letterSpacing: 0.5, animation: "speakPulse 1.4s ease-in-out infinite" }}>
                {isSpeaking ? "speaking…" : "pausing…"}
              </span>
            )}
          </button>
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
              {/* Handle — tap to dismiss */}
              <div onClick={() => setLearnMore(false)} style={{ padding: "4px 0 16px", cursor: "pointer", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 40, height: 4, background: "rgba(200,160,232,0.4)", borderRadius: 99 }} />
              </div>
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
