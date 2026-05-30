"""ds02 — Animal pharmacy builder (FacilityBuilder)."""
from backend.kg.builders._facility import FacilityBuilder


class Ds02PharmacyBuilder(FacilityBuilder):
    DATASET_ID = "02"
    SHORT_NAME = "pharmacy"
    KLASS = "Pharmacy"
    SOURCE_CSV = "02_pharmacy_clean.csv"
    SOURCE_DIR = "cleaned"
    EXTRA_PROPS = (
        ("BusinessStatus", "businessStatus"),
        ("BusinessStatusDetail", "businessStatusDetail"),
        ("FloorArea", "floorAreaSqm"),
        ("LicenseDate", "licenseDate"),
        ("ClosingDate", "closingDate"),
        ("ReopenDate", "reopenDate"),
        ("SuspensionStartDate", "suspensionStart"),
        ("SuspensionEndDate", "suspensionEnd"),
    )


if __name__ == "__main__":
    Ds02PharmacyBuilder.cli()
