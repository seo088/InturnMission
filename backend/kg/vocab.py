"""Knowledgemap animal-domain vocabulary (closed enumeration).

Adding a new term here is a deliberate act and should be reviewed by
``kg-build-reviewer`` (페르소나: Dr. 서은하). Any class/property used in a
builder MUST be present in this module — ``ttl-validate`` enforces this.
"""
from __future__ import annotations
from types import MappingProxyType

# ── Classes (def:) ─────────────────────────────────────────────────────────
CLASSES: frozenset[str] = frozenset({
    "AnimalHospital", "Pharmacy", "Grooming", "Boarding", "Cremation",
    "AbandonedAnimal", "LostAnimal", "AnimalShelter",
    "CultureFacility", "RestArea", "TravelSpot",
    "Symptom", "SymptomCategory", "Disease", "VetDepartment",
    "Region", "VetQA",
    "Dog", "Cat",
})

# ── Object / datatype properties (def:) ───────────────────────────────────
PROPERTIES: frozenset[str] = frozenset({
    # facility / instance attributes
    "address", "phone", "locatedIn",
    # abandoned-animal
    "desertionNo", "noticeNo",
    "animalBreed", "kindFullName", "colorCode",
    "neuterYn", "weightKg", "birthYear", "ageDetail", "specialMark",
    "processState", "happenDate", "noticeSDate", "noticeEDate",
    "happenPlace", "imageList",
    "vaccinationChk", "healthChk",
    "adoptionTitle", "adoptionText", "adoptionCondition",
    "rfidCode",
    # relationships
    "protectedBy", "foundAt", "matchingCandidate",
    # reasoning chain
    "mapsTo", "indicatesDisease", "hasSymptom",
    "treatedAt", "treatedByDept", "handledBy", "treatsSympCategory",
    "deptHint",
    # provenance / freshness
    "endReason", "unresolvedCareRegNo",
    # facility cluster (ds01-05, ds10)
    "category", "businessStatus", "businessStatusDetail",
    "licenseDate", "closingDate",
    "designatedDate", "targetAnimal", "causeClass", "categoryOf",
    # ds10 operating hours (F5)
    "weekdayOpenTime", "weekdayCloseTime",
    "weekdayCellOpenTime", "weekdayCellCloseTime",
    "weekendOpenTime", "weekendCloseTime",
    "weekendCellOpenTime", "weekendCellCloseTime",
    "vetStaffCount", "specStaffCount",
    "medicalCount", "breedCount", "quarantineCount", "feedCount", "transportCarCount",
    # ds02 pharmacy
    "floorAreaSqm", "reopenDate", "suspensionStart", "suspensionEnd",
    # ds04 boarding
    "taskType",
    # ds11 culture
    "petPolicy", "petRestriction", "allowedPetSize", "operatingHours",
    "closeDay", "entryFee", "homepage",
    # ds12 restarea
    "facilityType", "establishedYear", "remark",
    # ds09 lost
    "matchingGrade", "contactHash",
    # ds14 vetqa
    "question", "answer", "department", "departmentLabel",
    # ds07 travel
    "homepage", "areaCode", "sigunguCode",
})

# ── Class → key-builder spec (URI key composition) ────────────────────────
# kept as a read-only mapping to prevent accidental mutation at import sites
KEY_SPEC = MappingProxyType({
    # F4 fix (kg-build-review): facility classes append a stable ``fid``
    # (Facility_ID or content hash) to defeat slug collisions between
    # same-name venues in the same district.
    "AnimalHospital":  ("hospital",  ("sido", "sgg", "name", "fid")),
    "Pharmacy":        ("pharmacy",  ("sido", "sgg", "name", "fid")),
    "Grooming":        ("grooming",  ("sido", "sgg", "name", "fid")),
    "Boarding":        ("boarding",  ("sido", "sgg", "name", "fid")),
    "Cremation":       ("cremation", ("sido", "sgg", "name", "fid")),
    "CultureFacility": ("culture",   ("sido", "sgg", "name", "fid")),
    "RestArea":        ("restarea",  ("name", "fid")),
    "AbandonedAnimal": ("abandoned", ("careRegNo", "noticeNo")),
    "LostAnimal":      ("lost",      ("lostNoticeNo",)),
    "AnimalShelter":   ("shelter",   ("careRegNo",)),
    "TravelSpot":      ("travel",    ("contentid",)),
    "Symptom":         ("symptom",   ("code",)),
    "SymptomCategory": ("symptom-category", ("code",)),
    "Disease":         ("disease",   ("no",)),
    "VetDepartment":   ("department", ("name",)),
    "Region":          ("region",    ("sido", "sgg")),
    "VetQA":           ("vetqa",     ("sha",)),
})


def assert_known(term: str) -> None:
    """Raise ``ValueError`` if ``term`` is not a registered class or property."""
    if term not in CLASSES and term not in PROPERTIES:
        raise ValueError(
            f"Unknown vocabulary term: {term!r}. "
            f"Add it to backend/kg/vocab.py after kg-build-reviewer approval."
        )
