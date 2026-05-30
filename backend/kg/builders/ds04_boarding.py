"""ds04 — Pet boarding (위탁관리) builder (FacilityBuilder)."""
from backend.kg.builders._facility import FacilityBuilder


class Ds04BoardingBuilder(FacilityBuilder):
    DATASET_ID = "04"
    SHORT_NAME = "boarding"
    KLASS = "Boarding"
    SOURCE_CSV = "04_boarding_clean.csv"
    SOURCE_DIR = "cleaned"
    EXTRA_PROPS = (
        ("Category", "category"),
        ("TaskType", "taskType"),
        ("BusinessStatus", "businessStatus"),
        ("LicenseDate", "licenseDate"),
    )


if __name__ == "__main__":
    Ds04BoardingBuilder.cli()
