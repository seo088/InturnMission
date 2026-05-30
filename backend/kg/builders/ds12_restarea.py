"""ds12 — Highway restarea pet playground (FacilityBuilder).

No RoadAddress column — the ``Location`` column doubles as address.
"""
from backend.kg.builders._facility import FacilityBuilder


class Ds12RestareaBuilder(FacilityBuilder):
    DATASET_ID = "12"
    SHORT_NAME = "restarea"
    KLASS = "RestArea"
    SOURCE_CSV = "12_restarea.csv"
    ADDR_COL = "Location"
    EXTRA_PROPS = (
        ("FacilityType",    "facilityType"),
        ("OpeningHours",    "operatingHours"),
        ("CloseDay",        "closeDay"),
        ("EstablishedYear", "establishedYear"),
        ("Remark",          "remark"),
    )


if __name__ == "__main__":
    Ds12RestareaBuilder.cli()
