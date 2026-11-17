# Collections and work identity

The named **Ethiopian Orthodox Tewahedo** collection follows the numbered Old and New Testament lists on the Church’s published [The Bible](https://www.ethiopianorthodox.org/english/canonical/books.html) page. The page credits Church publications from 1983 and 1970. ChiFold retains that list’s order, rather than generating entries to reach a numerical canon count. Other traditions and editions can share the same work identities.

`src/data/catalog.ts` contains the catalog, collection groups, and a `sourceLabels` record for labels that need explanation. **All texts** includes every catalog work, including unavailable ones. A reading preference such as KJV never removes a work from the catalog.

## Normalization and unresolved names

| Church-list entry | ChiFold handling |
| --- | --- |
| Paired Samuel and Kings entries | Each pair is represented by its two individually identifiable works; the source’s grouped label remains in `sourceLabels`. |
| Ezra and Nehemia | Maps to Ezra and Nehemiah as distinct shared work identities. |
| Jublee; Enoch | Normalized to Jubilees and 1 Enoch. Enoch means the Ethiopic Enoch work here, not 2 Enoch or 3 Enoch. |
| Ezra (2nd) and Ezra Sutuel | Two separately named, unavailable catalog identities. No mapping to Western 1 or 2 Esdras has been verified. Imported KJV Esdras texts remain separate works. |
| Ethiopian Maccabees entries | Represented by 1, 2 and 3 Meqabyan identities. The Greek-tradition 1 and 2 Maccabees in KJV are separate works and do not fulfill these entries. |
| Tegsats | Retained separately from Proverbs as the source lists it. Its extent and text-edition equivalence remain unresolved. |
| Metsihafe Tibeb | Retained under the Church’s name; its precise extent has not been verified. Imported Western Wisdom of Solomon is not silently substituted. |
| Joshua the son of Sirac | Normalized to Sirach, also known as Ecclesiasticus. This is not the book of Joshua. |
| Josephas the Son of Bengorion | Retained as a distinct Ethiopic Church-list identity. Texts of Josephus are not substituted. |
| Sirate Tsion, Tizaz, Gitsew, Abtilis | Four separately listed identities, retained without inferring interchangeable editions of a generic Sinodos. |
| First and second Dominos | Two separately named works; text is unavailable pending a verified complete edition. |
| Clement | A distinct Ethiopic Church-list work. Neither 1 Clement nor 2 Clement is substituted. |
| Didascalia | A distinct Ethiopic identity. The Church page explicitly discusses differences among versions; Syriac Didascalia or Apostolic Constitutions is not used as a substitute. |

The Church page also mentions Baruch, Esdras, and Ascension of Isaiah in prose outside its numbered list. ChiFold does not silently turn that prose into additional numbered collection membership. Likewise, Lamentations is available in the wider catalog but is not independently named in this list. A future collection revision may model traditional composite works once their boundaries and mappings are sourced.

The distinction between Ethiopian Meqabyan and Greek Maccabees is independently supported by the United Bible Societies translation notes for [1 Meqabyan](https://tips.translation.bible/story/the-book-of-1-meqabyan/), [2 Meqabyan](https://tips.translation.bible/story/the-book-of-2-meqabyan/), and [3 Meqabyan](https://tips.translation.bible/story/the-book-of-3-meqabyan/), credited to Haileyesus Woldemariam. Those pages describe texts used by permission; they do not provide a blanket redistribution grant for ChiFold, so they are not imported here.

## Edition completeness is not a claim about a tradition’s textual extent

A **complete** badge means that the loaded edition’s complete source book and chapter coverage was checked. It does not assert that the edition reproduces an official Ethiopian text or the full extent of every traditional composite book. The reader labels the actual translation and numbering. For example, KJV Daniel is the complete Daniel of that edition; separately imported additions retain their own identities. ChiFold does not merge them and invent Ethiopic verse numbers.

KJV’s Additions to Esther are stored as source chapters 10–16, separately from Esther. Its Baruch includes the Letter of Jeremiah as chapter 6. These source boundaries are preserved; the same text is not duplicated into an invented extra work. Greek Maccabees, Western Esdras, and Wisdom of Solomon remain visible under **All texts**, without being assigned to ambiguous Tewahedo entries.

## Remaining collection gaps

These catalog identities intentionally remain **Text not yet available** until a complete, reusable, identifiable edition is verified:

- Ezra (2nd) in the Church list; Ezra Sutuel.
- 1, 2, and 3 Meqabyan.
- Tegsats; Metsihafe Tibeb.
- Josephas the Son of Bengorion.
- Sirate Tsion; Tizaz; Gitsew; Abtilis.
- 1 and 2 Dominos; Ethiopic Clement; Ethiopic Didascalia.

The imported text manifest is the authority for current availability; catalog membership alone never implies that text exists. No chapter count is invented for these gaps. The source list is not padded or truncated to match a target total.
