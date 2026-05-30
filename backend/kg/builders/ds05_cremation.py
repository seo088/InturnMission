"""ds05 — Animal cremation (장묘업) builder (FacilityBuilder)."""
from backend.kg.builders._facility import FacilityBuilder


class Ds05CremationBuilder(FacilityBuilder):
    DATASET_ID = "05"
    SHORT_NAME = "cremation"
    KLASS = "Cremation"
    SOURCE_CSV = "05_cremation_clean.csv"
    SOURCE_DIR = "cleaned"
    EXTRA_PROPS = (
        ("Category", "category"),
        ("BusinessStatus", "businessStatus"),
        ("LicenseDate", "licenseDate"),
    )


if __name__ == "__main__":
    Ds05CremationBuilder.cli()
