from __future__ import annotations
import json
import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "frontend" / "index.html"
PLAN_PATH = ROOT / "data" / "plan-2026-10-12.example.json"
SCHEMA_PATH = ROOT / "schemas" / "daily-plan.schema.json"

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.anchors=[]; self.scripts=[]; self.in_script=False; self.script_buf=[]; self.h1=0
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if "id" in attrs: self.ids.append(attrs["id"])
        if tag=="a" and attrs.get("href", "").startswith("#"): self.anchors.append(attrs["href"][1:])
        if tag=="h1": self.h1+=1
        if tag=="script": self.in_script=True; self.script_buf=[]
    def handle_endtag(self, tag):
        if tag=="script" and self.in_script:
            self.scripts.append("".join(self.script_buf)); self.in_script=False
    def handle_data(self, data):
        if self.in_script: self.script_buf.append(data)

class SmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html=HTML_PATH.read_text(encoding="utf-8")
        cls.plan=json.loads(PLAN_PATH.read_text(encoding="utf-8"))
        cls.schema=json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        cls.parser=PageParser(); cls.parser.feed(cls.html)
    def test_html_has_unique_ids_and_valid_nav_targets(self):
        self.assertEqual(len(self.parser.ids),len(set(self.parser.ids)),"duplicate HTML id")
        missing=set(self.parser.anchors)-set(self.parser.ids)
        self.assertFalse(missing,f"anchor targets not found: {missing}")
        self.assertEqual(self.parser.h1,1)
    def test_plan_schema_version_and_required_sections(self):
        self.assertEqual(self.plan["schemaVersion"],"1.0.0")
        for key in ("date","timezone","dataAsOf","instruments","riskPolicy","checklist","sources"):
            self.assertIn(key,self.plan)
        self.assertEqual(self.schema["properties"]["schemaVersion"]["const"],"1.0.0")
    def test_scenario_level_references_resolve(self):
        for inst in self.plan["instruments"]:
            ids={level["id"] for level in inst["levels"]}
            self.assertIn(inst["referenceLevelId"],ids)
            for scenario in inst["scenarios"]:
                self.assertIn(scenario["triggerLevelId"],ids,(inst["symbol"],scenario["id"]))
                if scenario.get("invalidationLevelId"):
                    self.assertIn(scenario["invalidationLevelId"],ids)
                for target in scenario["targetLevelIds"]:
                    self.assertIn(target,ids)
    def test_html_embeds_the_same_example_data(self):
        match=re.search(r"const SAMPLE_PLAN = (\{.*?\});\nconst STORAGE_PREFIX",self.html,re.S)
        self.assertIsNotNone(match,"embedded seed data not found")
        embedded=json.loads(match.group(1))
        self.assertEqual(embedded,self.plan)
    def test_safety_disclosures_and_export_import_exist(self):
        for phrase in ("قیمت زنده دریافت نمی‌شود", "این ابزار لات را محاسبه نمی‌کند", "historical-reference", "STORAGE_PREFIX"):
            self.assertIn(phrase,self.html)
        self.assertIn('id="exportBtn"',self.html)
        self.assertIn('id="importBtn"',self.html)
        self.assertIn('id="priceMap"',self.html)

if __name__ == "__main__":
    unittest.main(verbosity=2)