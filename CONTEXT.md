# Karaopetch

A lyrics search app that shows a Thai phonetic reading for non-Thai (e.g. Korean) song lyrics, so users can sing along without knowing the source language.

## Language

**Transliteration**:
The Thai-script phonetic rendering of how foreign-language lyrics sound (e.g. "ออ-ริน"). Not a translation of meaning.
_Avoid_: Translation, translate

**Script Detection**:
Determining whether lyrics contain a non-Thai script (e.g. Hangul) by checking Unicode character ranges, used to decide whether Transliteration is needed. Deterministic, not AI- or metadata-based.
_Avoid_: Language detection (implies NLP/ID-based detection, not what this does)

**Line Pair**:
One original lyric line paired with its Transliteration, matched by line index. The unit the UI renders for side-by-side display.
_Avoid_: Row (implies table/grid UI, not the domain concept)
