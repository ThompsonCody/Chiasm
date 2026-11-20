# Missing-text import audit — 19 November 2026

**The library is not complete.** It contains 85 readable works / 151 edition-books, with 13 Church-list identities still unavailable. These are ChiFold record counts, not a claim about the number of books in an Ethiopian canon. The user's instruction is **only verified complete editions**; community drafts and substitute textual traditions are excluded.

## Added in this import pass

| Work | Reading edition | Coverage verified |
| --- | --- | --- |
| Ethiopic Didascalia | J. M. Harden, 1920 | All 43 source chapters. |
| Tizaz / Te’ezaz | George Horner, 1904; Ertale electronic edition | All 73 numbered electronic sections, corresponding to printed statutes 1–72 with two consecutive statute 40s. **The electronic source excludes Horner's appended unnumbered liturgical prayer cycle.** Complete coverage of this electronic edition's numbered statutory body, not the entire Horner volume or every Sinodos recension. |
| Gitsew / Gessew | George H. Schodde, 1885 | All 57 numbered canons, I–LVII. Canon numbers become reader chapter numbers without invented verse numbering. |

These are historical translations from Ethiopic, not official contemporary Tewahedo editions. All inputs are SHA-256 pinned; every imported body block is independently compared against its pinned transcription. Original scan section headings and opening/closing boundaries were checked. This establishes source coverage and faithful transfer, **not correction of every OCR error or a new critical edition**. OCR warnings and edition-specific numbering are visible in Read. Introductions, translator apparatus and footnotes are excluded.

### Provenance and identity

- **Didascalia:** [original scan](https://archive.org/details/cu31924096083336), [public-domain identification](https://commons.wikimedia.org/wiki/File:The_Ethiopic_Didascalia_(IA_cu31924096083336).pdf), [43-chapter transcription](https://ertale.com/bible/ethiopiancanon/didascalia/). Original OCR misreads XXXI as XXXII; the transcription index supplies the explicit 1–43 sequence.
- **Tizaz:** [Horner volume](https://archive.org/details/statutesapostle00unkngoog), English translation of Ethiopic pp.127–232; [electronic edition and exclusions](https://ertale.com/bible/ethiopiancanon/teezaz/); [Ran HaCohen, Tel Aviv University, identifies this publication with Te’ezaz](https://www.tau.ac.il/~hacohen/Tezaz/Information.html). Browser section 41 is the second printed 40; sections 42–73 correspond to printed 41–72. No automatic cross-edition numbering equivalence.
- **Gitsew:** Schodde, “The Apostolic Canons, Translated from the Ethiopic,” *Journal of the Society of Biblical Literature and Exegesis* 5 (1885), 61–72: [journal record](https://www.jstor.org/stable/3268629), [scan/OCR](https://archive.org/details/jstor-3268629), [transcription](https://ertale.com/bible/ethiopiancanon/apostoliccanons/1/). Schodde identifies Fell's 1871 Ethiopic text as his base. [Mikre-Sellassie 1993, p.119, notes 47–48](https://translation.bible/wp-content/uploads/2024/06/mikre-sellassie-1993-the-bible-and-its-canon-in-the-ethiopian-orthodox-church.pdf) identifies Fell with Gessew; [Cowley 1974, note 12](https://www.islamic-awareness.org/bible/text/canon/ethiopican.html) independently connects Gessew's canon list with Fell canon 56. The transcription site's source note instead calls it Abtelis; ChiFold follows those scholarly identifications and does **not** mark Abtilis available from this text. Traditional 56-canon and Schodde 57-canon segmentation are disclosed without asserting an automatic mapping.

## Remaining 13 gaps

| Catalogue identity | Checked candidate / concrete obstacle |
| --- | --- |
| Ezra (2nd) · Church list | The separately named entry still needs a verified identity and edition boundary. Western 1 Esdras is already available under its own name; it is not silently assigned here. |
| Ezra Sutuel | A reusable historical English translation **does exist**: Richard Laurence, *Primi Ezrae libri … versio Aethiopica … latine angliceque reddita* (Oxford, 1820). [HathiTrust catalogue](https://catalog.hathitrust.org/Record/009706619) verifies English/Latin/Ge’ez content; [Beta maṣāḥǝft](https://betamasaheft.awhamburg.de/works/LIT1376Apocal/text) identifies the edition. HathiTrust full view returned a 403 challenge and Google Books PDF returned 403/429 in this pass. No complete retrievable English transcription with verified boundaries was obtained. KJV 2 Esdras is not relabeled as an Ethiopic translation. |
| 1 Meqabyan | Reusable Wikisource community candidate has only seven chapter pages, unlike the 36-chapter canonical division. Complete source coverage cannot be established. Modern commercial translations checked are separately copyrighted. |
| 2 Meqabyan | Community candidate has 21 chapter pages but lacks a checkable original base establishing faithful complete coverage. Count alone does not verify an edition. Excluded under the verified-editions-only instruction. |
| 3 Meqabyan | Community candidate has 10 chapter pages but the same source-verification problem. Greek 3 Maccabees is a different work. |
| Tegsats | Authoritative witnesses identify a Proverbs subdivision, but boundaries differ: [British Library Add MS 16186](https://searcharchives.bl.uk/?q=Add+MS+16186) describes Proverbs 25–29, whereas Cowley identifies Tägsas with 25–31. A verified edition-specific subdivision/mapping is needed before exposing a separate complete reading unit. |
| Metsihafe Tibeb | [British Library Add MS 16189](https://searcharchives.bl.uk/?q=032-003450047&sort=hierarchy) is a strong lead identifying this name with Wisdom. Precise Church-list scope/recension and the appropriate work-alias mapping still need verification. KJV Wisdom of Solomon remains available under its credited identity. |
| Josephas / Ethiopic Josippon | Checked commercial candidate explicitly approximates the Ethiopic work from Hebrew/Latin and other material. Manuscript/digitization leads are not a complete verified reusable English edition. Josephus is not a substitute. |
| Sirate Tsion | A full Ge’ez scholarly transcription is a lead (Bausi/Liuzzo); checked English candidates use modern translations whose reuse and full original alignment are not established. Horner's Te’ezaz is a different Sinodos division. |
| Abtilis | Multiple 80/81/82/83-section recensions need an identified complete Ethiopic-based edition. Coptic Tattam or Schodde's Gessew cannot fill this work. |
| 1 Dominos | Cooper–Maclean 1902 is translated from Syriac; it does not establish full coverage of the distinct Ethiopic 60-section witness. No substitute imported. |
| 2 Dominos | M. R. James's Epistula Apostolorum combines witnesses and does not itself verify the complete composite Ethiopic second Covenant work. Guerrier–Grébaut 1913 is a historical French/Ge’ez lead requiring checked scope and extraction. |
| Clement · Ethiopic | Seven books. Checked reusable James material covers only a part (book 2 / Apocalypse of Peter); earlier French publications are partial. Modern English candidates do not establish a complete reusable verified edition. Greek 1/2 Clement are different works. |

## Research records

- [Church's published list](https://www.ethiopianorthodox.org/english/canonical/books.html) controls membership; it does not prove a matching edition's identity or scope.
- [Wikisource 1 Meqabyan](https://en.wikisource.org/wiki/Translation:1_Meqabyan), [2 Meqabyan](https://en.wikisource.org/wiki/Translation:2_Meqabyan), [3 Meqabyan](https://en.wikisource.org/wiki/Translation:3_Meqabyan): a reusable licence does not prove source completeness. None imported.
- [Clear Text Editions' sources/rights](https://www.ethiopiancanon.com/sources): new translations are separately copyrighted; substituted traditions and an approximate Josippon are disclosed.
- [TheoDoor source overview](https://tohdee.github.io/Ynnn-Src/Y702-EBC.pdf): original-text and edition leads. Its general CC BY statement is limited by more restrictive source licences; it does not license every modern translation listed.
- [Bausi on Ethiopic Clement](https://repozytorium.uni.lodz.pl/bitstream/handle/11089/58946/Orient1-06%20str.47-57%20Bausi.pdf?sequence=1) and [BnF Grébaut record](https://catalogue.bnf.fr/ark:/12148/cb45626264v) document earlier partial editions.

These are the sources checked, not proof that no suitable edition exists elsewhere. Remaining work requires complete source editions, verified boundaries and reuse terms. No unavailable record has been hidden or marked complete to improve the count.
