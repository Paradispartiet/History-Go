# Oslo unresolved runtime/source drift audit — post batch 179

This audit does not change canonical place data. It traces every currently unresolved protocol id through every occurrence in the ordered place manifest and compares those source records with the generated runtime index.

The report distinguishes genuinely unresolved places from source shadowing, duplicate-source precedence and coordinate-metadata loss. In particular, it can identify cases where an earlier source is already verified but a later manifest occurrence or runtime representation drops that verification metadata.

No coordinate, place identity or protocol row is modified by this job.
