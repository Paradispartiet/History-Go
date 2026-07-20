# Quiz Knowledge Runtime v1

Quiz er både kunnskapsflate og prøve.

Etter hvert svar skal runtime:

1. vise riktig/feil
2. vise kunnskapsforklaring fra `knowledge` eller `knowledge_payload`
3. vise relevante begreper, terminologi og historiefragmenter
4. kreve at brukeren trykker **Fortsett**
5. registrere `quiz_knowledge_presented` når forklaringen vises
6. registrere `quiz_knowledge_read` når brukeren går videre
7. registrere mestring bare når svaret er riktig

Feil svar kan dokumentere at stoffet er møtt og lest, men skal markeres for repetisjon og skal ikke gi mestring.

Eksisterende legacy-flyt for poeng, unlocks, trivia og `saveKnowledgeFromQuiz` beholdes for riktige svar. Nye strukturerte felter som `knowledge_unit_ids`, `concept_ids`, `term_ids`, `story_ids` og `knowledge_emne_ids` følger evidenshendelsene.
