"""ds03 — Pet grooming builder (FacilityBuilder)."""
from backend.kg.builders._facility import FacilityBuilder


class Ds03GroomingBuilder(FacilityBuilder):
    DATASET_ID = "03"
    SHORT_NAME = "grooming"
    KLASS = "Grooming"
    SOURCE_CSV = "03_grooming_clean.csv"
    SOURCE_DIR = "cleaned"
    EXTRA_PROPS = (
        ("Category", "category"),
        ("BusinessStatus", "businessStatus"),
        ("LocationArea", "floorAreaSqm"),
        ("LicenseDate", "licenseDate"),
        ("ReopeningDate", "reopenDate"),
    )


if __name__ == "__main__":
    Ds03GroomingBuilder.cli()
