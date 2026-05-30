"""ds01 — Animal hospital builder."""
from backend.kg.builders._facility import FacilityBuilder


class Ds01HospitalBuilder(FacilityBuilder):
    DATASET_ID = "01"
    SHORT_NAME = "hospital"
    KLASS = "AnimalHospital"
    SOURCE_CSV = "01_hospital_clean.csv"
    SOURCE_DIR = "cleaned"
    EXTRA_PROPS = (
        ("Category", "category"),
        ("BusinessStatus", "businessStatus"),
        ("BusinessStatusDetail", "businessStatusDetail"),
        ("LicenseDate", "licenseDate"),
    )


if __name__ == "__main__":
    Ds01HospitalBuilder.cli()
