"""ds11 — Pet-allowed cultural facility (FacilityBuilder).

The preprocessed CSV uses Korean-derived English column names; ``Name`` is
already extracted. Categories 1/2/3, opening hours, and pet-policy fields
get mapped via ``EXTRA_PROPS``.
"""
from backend.kg.builders._facility import FacilityBuilder


class Ds11CultureBuilder(FacilityBuilder):
    DATASET_ID = "11"
    SHORT_NAME = "culture"
    KLASS = "CultureFacility"
    SOURCE_CSV = "11_culture.csv"
    EXTRA_PROPS = (
        ("Category1",      "category"),
        ("PetAllowedInfo", "petPolicy"),
        ("PetRestriction", "petRestriction"),
        ("AllowedPetSize", "allowedPetSize"),
        ("OpeningHours",   "operatingHours"),
        ("CloseDay",       "closeDay"),
        ("EntryFee",       "entryFee"),
        ("Homepage",       "homepage"),
    )


if __name__ == "__main__":
    Ds11CultureBuilder.cli()
